var spwUtils = spwUtils || function() {
  return{
      // Based on https://www.jasondavies.com/poisson-disc/
      poissonDiscSampler : function(width, height, radius, playRadius) {
        var k = 30, // maximum number of samples before rejection
            radius2 = radius * radius,
            R = 3 * radius2,
            cellSize = radius * Math.SQRT1_2,
            gridWidth = Math.ceil(width / cellSize),
            gridHeight = Math.ceil(height / cellSize),
            grid = new Array(gridWidth * gridHeight),
            queue = [],
            queueSize = 0,
            sampleSize = 0,
            center = [width/2, height/2],
            tryNum = 0;
        return function() {
          if (!sampleSize) return sample(Math.random() * width, Math.random() * height);
          // Pick a random existing sample and remove it from the queue.
          while (queueSize) {
            var i = Math.random() * queueSize | 0,
                s = queue[i];
            // Make a new candidate between [radius, 2 * radius] from the existing sample.
            for (var j = 0; j < k; ++j) {
              var a = 2 * Math.PI * Math.random(),
                  r = Math.sqrt(Math.random() * R + radius2),
                  x = s[0] + r * Math.cos(a),
                  y = s[1] + r * Math.sin(a);
              // Reject candidates that are outside the allowed extent,
              // or closer than 2 * radius to any existing sample.
              if (0 <= x && x < width && 0 <= y && y < height && far(x, y)) return sample(x, y);
            }
            queue[i] = queue[--queueSize];
            queue.length = queueSize;
          }
        };
        function far(x, y) {
          var i = x / cellSize | 0,
              j = y / cellSize | 0,
              i0 = Math.max(i - 2, 0),
              j0 = Math.max(j - 2, 0),
              i1 = Math.min(i + 3, gridWidth),
              j1 = Math.min(j + 3, gridHeight);
          for (j = j0; j < j1; ++j) {
            var o = j * gridWidth;
            for (i = i0; i < i1; ++i) {
              if (s = grid[o + i]) {
                var s,
                    dx = s[0] - x,
                    dy = s[1] - y;
                if (dx * dx + dy * dy < radius2) return false;
              }
            }
          }
          return true;
        }
        function sample(x, y) {
          var s = [x, y];
          if(tryNum > 10){
            return;
          }
          var distance = Math.sqrt((s[0] - center[0]) * (s[0] - center[0]) + (s[1] - center[1]) * (s[1] - center[1]));
          if(distance < playRadius*2){
            tryNum++;
            return sample(Math.random() * width, Math.random() * height);
          };
          queue.push(s);
          grid[gridWidth * (y / cellSize | 0) + (x / cellSize | 0)] = s;
          ++sampleSize;
          ++queueSize;
          return s;
        }
      },
      squareSampleImage : function(image, x, y, r, width) {
          var samples = [];
          for (var col = x - r; col < x + r + 1; col++) {
              for (var row = y - r; row < y + r + 1; row++) {
                  var i = (row * width + col) << 2;
                  samples.push([image.data[i], image.data[i+1], image.data[i+2]]);
              }
          }
          return d3.rgb(
              d3.mean(samples, function (sample) {
                  return sample[0];
              }),
              d3.mean(samples, function (sample) {
                  return sample[1];
              }),
              d3.mean(samples, function (sample) {
                  return sample[2];
              })
          );
      },
      computeTopology : function(diagram) {
        var cells = diagram.cells,
            arcs = [],
            arcIndex = -1,
            arcIndexByEdge = {};

        return {
          objects: {
            voronoi: {
              type: "GeometryCollection",
              geometries: cells.map(function(cell, index) {
                var cell,
                    site = cell.site,
                    halfedges = cell.halfedges,
                    cellIndex = index,
                    cellArcs = [],
                    clipArc;
                    // site.data.push(cellIndex);
                halfedges.forEach(function(halfedge) {
                  var edge = diagram.edges[halfedge];
                  if (edge.right) {
                    var l = edge.left.index,
                        r = edge.right.index,
                        k = l + "," + r,
                        i = arcIndexByEdge[k];
                    if (i == null) arcs[i = arcIndexByEdge[k] = ++arcIndex] = edge;
                    cellArcs.push(site === edge.left ? i : ~i);
                    clipArc = null;
                  } else if (clipArc) { // Coalesce border edges.
                    if (edge.left) edge = edge.slice(); // Copy-on-write.
                    clipArc.push(edge[1]);
                  } else {
                    arcs[++arcIndex] = clipArc = edge;
                    cellArcs.push(arcIndex);
                  }
                });

                // Ensure the last point in the polygon is identical to the first point.
                var firstArcIndex = cellArcs[0],
                    lastArcIndex = cellArcs[cellArcs.length - 1],
                    firstArc = arcs[firstArcIndex < 0 ? ~firstArcIndex : firstArcIndex],
                    lastArc = arcs[lastArcIndex < 0 ? ~lastArcIndex : lastArcIndex];
                lastArc[lastArcIndex < 0 ? 0 : lastArc.length - 1] = firstArc[firstArcIndex < 0 ? firstArc.length - 1 : 0].slice();

                return {
                  type: "Polygon",
                  data: site.data,
                  cellIndex: cellIndex,
                  arcs: [cellArcs]
                };
              })
            }
          },
          arcs: arcs
        };
      },
      getAverageColourAsRGB : function(data) {
        var r = 0;
        var g = 0;
        var b = 0;

        for (var i = 0, l = data.length; i < l; i += 4) {
          r += data[i];
          g += data[i+1];
          b += data[i+2];
        }

        r = Math.floor(r / (data.length / 4));
        g = Math.floor(g / (data.length / 4));
        b = Math.floor(b / (data.length / 4));

        return d3.rgb(r, g, b);
      },
      getDistance:function(a, b) {
        var dx = a[0] - b[0], dy = a[1] - b[1];
        return Math.sqrt(dx * dx + dy * dy);
      },
      getCenterAll : function(cenArr){
        var sum = [0,0];
        var center = [0,0];
        cenArr.forEach(function(center, i) {
          sum[0] += center[0];
          sum[1] += center[1];
        });
        center[0] = sum[0] / cenArr.length;
        center[1] = sum[1] / cenArr.length;
        return center;
      }
    };
}();


if(!window.requestAnimationFrame){
    window.requestAnimationFrame = (function(){
        return  window.requestAnimationFrame       ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            window.oRequestAnimationFrame      ||
            window.msRequestAnimationFrame     ||
            function(callback){
                window.setTimeout(callback, 1000 / 60);
            };
    })();
};
