var spwUtils = spwUtils || function() {
  return{
      // Based on https://www.jasondavies.com/poisson-disc/
      poissonDiscSampler : function(width, height, radius, playRadius) {
        // width = width+ 500;
        // height = height+ 500;
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
        function getDistance(a, b) {
          var dx = a[0] - b[0], dy = a[1] - b[1];
          return Math.sqrt(dx * dx + dy * dy);
        }
        function sample(x, y) {
          var s = [x, y];
          if(tryNum > 10){
            return;
          }
          if(getDistance(s, center) < playRadius*2){
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
      pointSampleImage : function(image, x, y, width) {
          var i = (y * width + x) << 2;
          return d3.rgb(image.data[i + 0], image.data[i + 1], image.data[i + 2]);
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
      renderMultiLineString : function(context, line) {
        line.coordinates.forEach(function(line) {
          line.forEach(function(point, i) {
            if (i) context.lineTo(point[0], point[1]);
            else context.moveTo(point[0], point[1]);
          });
        });
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
        // return { r: r, g: g, b: b };
      },
      // dsq:function(a,b) {
      //     var dx = a[0]-b[0], dy = a[1]-b[1];
      //     return dx*dx+dy*dy;
      // },
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
      },
      getCenterFromPolygon: function(polygon){
        var that = this;
        polygon.coordinates.forEach(function(polygon) {
          polygon.forEach(function(ring) {
            var cenArr = [];
            ring.forEach(function(point, i) {
              cenArr.push(point);
              if(i === (ring.length - 1)){
                ring.center = that.getCenterAll(cenArr);
              };
            });
          });
        });
      },
      renderSinglePolygon : function (context, ring, width, height, trans = 0) {
        var that = this;
        var padX = trans;
        var padY = trans;

        ring.forEach(function(point, i) {
          if(trans !== 0){
            if(point[0] === 0 || point[0] === width){
              padX = 0;
            }
            if(point[1] === 0 || point[1] === height){
              padY = 0;
            }
          };
          if(i > 0){
            context.lineTo(point[0] + padX, point[1] + padY);
          }else{
            context.moveTo(point[0] + padX, point[1] + padY);
          };
        });
      },
      renderMultiPolygon : function (context, polygon, width, height, trans) {
        var that = this;
        if(typeof trans === 'undefined' || trans === null){
          trans = 0;
        }; 
        var padX = trans;
        var padY = trans;
        
        polygon.coordinates.forEach(function(polygon) {
          polygon.forEach(function(ring) {
            ring.forEach(function(point, i) {
              if(trans !== 0){
                if(point[0] === 0 || point[0] === width){
                  padX = 0;
                }
                if(point[1] === 0 || point[1] === height){
                  padY = 0;
                }
              };
              if(i > 0){
                context.lineTo(point[0] + padX, point[1] + padY);
              }else{
                context.moveTo(point[0] + padX, point[1] + padY);
              };
            });
          });
        });
      },

      // A horrible brute-force algorithm for determining the largest circle that can
      // fit inside a convex polygon. For each distinct set of three sides of the
      // polygon, compute the tangent circle. Then reduce the circle’s radius against
      // the remaining sides of the polygon.
      polygonIncircle: function(points) {
        var circle = {radius: 0};

        for (var i = 0, n = points.length; i < n; ++i) {
          var pi0 = points[i],
              pi1 = points[(i + 1) % n];
          for (var j = i + 1; j < n; ++j) {
            var pj0 = points[j],
                pj1 = points[(j + 1) % n],
                pij = j === i + 1 ? pj0 : this.lineLineIntersection(pi0[0], pi0[1], pi1[0], pi1[1], pj0[0], pj0[1], pj1[0], pj1[1]);
            search: for (var k = j + 1; k < n; ++k) {
              var pk0 = points[k],
                  pk1 = points[(k + 1) % n],
                  pik = this.lineLineIntersection(pi0[0], pi0[1], pi1[0], pi1[1], pk0[0], pk0[1], pk1[0], pk1[1]),
                  pjk = k === j + 1 ? pk0 : this.lineLineIntersection(pj0[0], pj0[1], pj1[0], pj1[1], pk0[0], pk0[1], pk1[0], pk1[1]),
                  candidate = this.triangleIncircle(pij[0], pij[1], pik[0], pik[1], pjk[0], pjk[1]),
                  radius = candidate.radius;

              for (var l = 0; l < n; ++l) {
                var pl0 = points[l],
                    pl1 = points[(l + 1) % n],
                    r = this.pointLineDistance(candidate[0], candidate[1], pl0[0], pl0[1], pl1[0], pl1[1]);
                if (r < circle.radius) continue search;
                if (r < radius) radius = r;
              }

              circle = candidate;
              circle.radius = radius;
            }
          }
        }

        return circle;
      },

      // Returns the incircle of the triangle 012.
      triangleIncircle: function(x0, y0, x1, y1, x2, y2) {
        var x01 = x0 - x1, y01 = y0 - y1,
            x02 = x0 - x2, y02 = y0 - y2,
            x12 = x1 - x2, y12 = y1 - y2,
            l01 = Math.sqrt(x01 * x01 + y01 * y01),
            l02 = Math.sqrt(x02 * x02 + y02 * y02),
            l12 = Math.sqrt(x12 * x12 + y12 * y12),
            k0 = l01 / (l01 + l02),
            k1 = l12 / (l12 + l01),
            center = this.lineLineIntersection(x0, y0, x1 - k0 * x12, y1 - k0 * y12, x1, y1, x2 + k1 * x02, y2 + k1 * y02);
        center.radius = Math.sqrt((l02 + l12 - l01) * (l12 + l01 - l02) * (l01 + l02 - l12) / (l01 + l02 + l12)) / 2;
        return center;
      },

      // Returns the intersection of the infinite lines 01 and 23.
      lineLineIntersection: function(x0, y0, x1, y1, x2, y2, x3, y3) {
        var x02 = x0 - x2, y02 = y0 - y2,
            x10 = x1 - x0, y10 = y1 - y0,
            x32 = x3 - x2, y32 = y3 - y2,
            t = (x32 * y02 - y32 * x02) / (y32 * x10 - x32 * y10);
        return [x0 + t * x10, y0 + t * y10];
      },

      // Returns the signed distance from point 0 to the infinite line 12.
      pointLineDistance: function(x0, y0, x1, y1, x2, y2) {
        var x21 = x2 - x1, y21 = y2 - y1;
        return (y21 * x0 - x21 * y0 + x2 * y1 - y2 * x1) / Math.sqrt(y21 * y21 + x21 * x21);
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
