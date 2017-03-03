function voronoiMaker(sampleRadius){
  var samples = [],
      sample, s, voronoi, diagram, links, polygons, triangles;

  function sampleing(width, height){
    sample = spwUtils.poissonDiscSampler(width, height, sampleRadius);
    while (s = sample()) samples.push(s);
  };
  function initVoronoi(width, height){
    voronoi = d3.voronoi().extent([[-1, -1], [width + 1, height + 1]]);
    diagram = voronoi(samples);
    links = diagram.links();
    polygons = diagram.polygons();
    triangles = diagram.triangles();
  };
  return {
    init : function(width, height){
      sampleing(width,height);
      initVoronoi(width,height);
      return {
          samples : samples,
          voronoi : voronoi,
          diagram : diagram,
          links : links,
          polygons : polygons,
          triangles : triangles
      }
    }
  }
}

var springWaltz = springWaltz || {
  width : 0,
  height : 0,
  backImgaeSrc : 'resources/imgs/sp4.jpg',
  backImg : {},
  imageData : {},
  canvas : {},
  context : {},
  voronoiArr : [],
  angle : 0,
  audioVis : {},
  audioNode : {},
  initialize : function(){
    this.initCanvas();
    
    var maker = new voronoiMaker(50);
    var voronoiObj = maker.init(this.width, this.height);
    this.voronoiArr.push(voronoiObj);
    // console.log('arr : ' + JSON.stringify(voronoiObj));
    // var maker2 = new voronoiMaker(30);
    // var voronoiObj2 = maker2.init(this.width, this.height);
    // this.voronoiArr.push(voronoiObj2);
    this.imageLoad();
    this.startAudio();
    this.start();

  },
  start : function(){
    this.context.drawImage(this.backImgae, 0, 0);
    this.imageData = this.context.getImageData(0, 0, this.width, this.height);
    this.particleStart();
    // this.drawVoro();
  },
  startAudio : function(){
    var that = this;
    that.audioVis = new AudioVisualizer();
    that.audioVis.setupAudioProcessing();
    that.audioVis.getAudio();
    that.audioNode = that.audioVis.javascriptNode;
    that.audioNode.onaudioprocess = function () {

        // get the average for the first channel
        var array = new Uint8Array(that.audioVis.analyser.frequencyBinCount);
        that.audioVis.analyser.getByteFrequencyData(array);

        //render the scene and update controls
        // that.audioVis.renderer.render(that.audioVis.scene, that.audioVis.camera);
        // that.audioVis.controls.update();

        var step = Math.round(array.length / that.audioVis.numberOfBars);

        // console.log('step : ' + JSON.stringify(step));
        // console.log('array : ' + JSON.stringify(array));

        //Iterate through the bars and scale the z axis
        for (var i = 0; i < that.audioVis.numberOfBars; i++) {
            var value = array[i * step] / 4;
            value = value < 1 ? 1 : value;
            // console.log('value : ' + value);
            // that.audioVis.bars[i].scale.z = value;
        }
    }
  },
  initCanvas : function(){
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    // this.initCanvas();
    this.canvas = d3.select("body").append("canvas")
        .attr("width", this.width)
        .attr("height", this.height);

    d3.select("canvas").on("touchmove mousemove", this.mousemoved);
    this.context = this.canvas.node().getContext("2d");
  },
  mousemoved : function() {
    // console.log('d3.mouse(this)[0] : ' + d3.mouse(this)[0]);
    // console.log('d3.mouse(this)[1] : ' + d3.mouse(this)[1]);

    var samp = springWaltz.diagramFind(d3.mouse(this)[0],d3.mouse(this)[1], 50);
    if(typeof samp !== 'undefined' && samp !== null){
      // console.log('samp.index : ' + samp.index);
      springWaltz.voronoiArr[0].polygons[samp.index].background = 'red';
      springWaltz.voronoiArr[0].samples[samp.index][2] = 0;
      springWaltz.start();
    }
  },
  imageLoad : function(){
    this.backImgae = new Image;
    this.backImgae.src = this.backImgaeSrc;
    // this.backImgae.onload = this.start;
  },
  drawInnerLine : function(){
    var that = this;
    var width = that.width;
    var imageData = that.imageData;
    var context = that.context;
    var polygons = that.voronoiArr[0].polygons;
    var formatHex = d3.format("02x");
    // var samples = that.voronoiArr[0].samples;
    // var curPolygons = that.voronoiArr[0].voronoi(samples).polygons();
    function drawCell(cell) {
      context.moveTo(cell[0][0], cell[0][1]);
      for (var i = 1, n = cell.length; i < n; ++i) context.lineTo(cell[i][0], cell[i][1]);
      // context.closePath();
    }

    function distance(a, b) {
      var dx = a[0] - b[0], dy = a[1] - b[1];
      return Math.sqrt(dx * dx + dy * dy);
    };
    function clone(obj) {
        if (null == obj || "object" != typeof obj) return obj;
        var copy = obj.constructor();
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
        }
        return copy;
    };
    var test = JSON.parse(JSON.stringify(polygons));
    var random = Math.floor((Math.random() * 10) + 1);
    for (var i = 0; i < 5; ++i) {
      test.forEach(function(cell, j) {
        if( j & 1) return;
        context.beginPath();
        drawCell(cell);
        var p0 = cell.shift(),
            p1 = cell[0],
            t = Math.max(0.5, 4 / distance(p0, p1)),
            p2 = [p0[0] * (1 - t) + p1[0] * t, p0[1] * (1 - t) + p1[1] * t];

        cell.push(p2);

        var rgba = spwUtils.squareSampleImage(imageData, p0[0], p0[1], 3, width);
        rgba.opacity =  Math.random()-0.7;
        context.strokeStyle =  rgba + "";
        context.stroke();

        // var rgba1 = spwUtils.squareSampleImage(imageData, p1[0], p1[1], 3, width);
        // var rgba2 = spwUtils.squareSampleImage(imageData, p2[0], p2[1], 3, width);
        // var randomOpa = Math.random()-0.7;
        // rgba1.opacity = randomOpa;
        // rgba2.opacity = randomOpa;
        // var grd=context.createLinearGradient(p1[0],p1[1],p2[0],p2[1]);
        // grd.addColorStop(0,rgba1 + "");
        // grd.addColorStop(1,rgba2 + "");
        // context.fillStyle=grd;
        
        // var rgba = spwUtils.squareSampleImage(imageData, p0[0], p0[1], 3, width);
        // if(i === 0){
        //   context.fillStyle = "rgba(0,0,0,0.1)"
        // }else if( i === 1){
        //   rgba.opacity = 0.3;
        //   context.fillStyle = rgba + "";
        //   // context.fillStyle = "green"
        // }else if( i === 2){
        //   rgba.opacity = 0.2;
        //   context.fillStyle = rgba + "";
        //   // context.fillStyle = "red"
        // }else if( i === 3){
        //   rgba.opacity = 0.1;
        //   context.fillStyle = rgba + "";
        // }else if( i === 4){
        //   rgba.opacity = 0.1;
        //   context.fillStyle = rgba + "";
        // };
        // context.fill();
        context.closePath();
      });
      // context.fillStyle = "#" + formatHex(i) + "0000";
      // context.fill();
      // context.strokeStyle = "#" + formatHex(i+100) + "0000";
      // context.strokeStyle = "#fff";
      // context.stroke();
    }
  },
  drawInnerCircle : function(){
    var that = this;
    var context = that.context;
    var polygons = that.voronoiArr[0].polygons;
    context.beginPath();
    polygons.forEach(function(cell) { that.drawPolygonIncircle(cell, -2.5); });
    context.strokeStyle = "#ddd";
    context.fillStyle = "rgba(255,255,255,0.6)";
    context.fill();
    context.stroke();
  },
  particleStart : function(){
    var that = this;
    var samples = that.voronoiArr[0].samples;
    // var samples2 = that.voronoiArr[1].samples;
    var width = that.width;
    var height = that.height;
    var imageData = that.imageData;
    var width = that.width;
    var polygons = that.voronoiArr[0].polygons;
    var context = that.context;

    // for (var i = 0; i < samples.length; ++i) {
    //   var p = samples[i];
    //   p[0] += p[3]; if (p[0] < 0) p[0] = p[3] *= -1; else if (p[0] > width) p[0] = width + (p[3] *= -1);
    //   p[1] += p[4]; if (p[1] < 0) p[1] = p[4] *= -1; else if (p[1] > height) p[1] = height + (p[4] *= -1);
    //   p[3] += 10 * (Math.random() - 0.5) - 0.01 * p[3];
    //   p[4] += 10 * (Math.random() - 0.5) - 0.01 * p[4];
    // }

    
    

    var topology = spwUtils.computeTopology(that.voronoiArr[0].voronoi(samples));

    context.beginPath();
    var geo = topology.objects.voronoi.geometries;
    spwUtils.renderMultiPolygon(context, topojson.merge(topology, geo.filter(function(d, i) { 
      return i & 1; 
    })), width, height);
    // context.fillStyle = "rgba(255,0,0,0.1)";
    context.fillStyle = "rgba(255,255,255,0.3)";
    context.fill();
    context.lineWidth = 1.5;
    context.lineJoin = "round";
    // context.strokeStyle = "rgba(255,0,0,1)";
    context.strokeStyle = "rgba(255,255,255,1)";
    context.stroke();
    context.closePath();



    that.drawInnerLine();
    // that.drawInnerCircle();

    // samples.forEach(function(p, i) {
    //   context.beginPath();
    //   context.arc(p[0], p[1], 10, 0, 2 * Math.PI);
    //   // context.fillStyle = i & 1 ? "rgba(255,0,0,1)" : "rgba(0,0,0,0.6)";
    //   var x = Math.floor(samples[i][0]);
    //   var y = Math.floor(samples[i][1]);
    //   // context.fillStyle = pointSampleImage(imageData, x, y) + "";
    //   // console.log(squareSampleImage(imageData, x, y, 3));
    //   var rgba = spwUtils.squareSampleImage(imageData, x, y, 3, width);
    //   if(typeof samples[i][2] !== 'undefined'){
    //     rgba.opacity = samples[i][2];
    //   }else{
    //     rgba.opacity = 0.8;
    //   };
    //   context.fillStyle =  rgba + "";
    //   if(polygons[i].background !== 'undefined'){
    //     context.fillStyle =  polygons[i].background;
    //     delete polygons[i]['background'];
    //   };
    //   console.log('that.voronoiArr[0].diagram.find.found : ' + that.voronoiArr[0].diagram.find.found);
    //   // context.fillStyle = i & 1 ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.6)";
    //   context.fill();
    // });

    // var topology2 = spwUtils.computeTopology(that.voronoiArr[0].voronoi(samples2));

    // context.beginPath();
    // spwUtils.renderMultiLineString(context, topojson.mesh(topology, topology.objects.voronoi, function(a, b) { return a !== b; }));
    // // context.strokeStyle = "rgba(0,0,0,0.4)";
    // context.strokeStyle = "rgba(255,255,255,0.8)";
    // context.lineWidth = 0.5;
    // context.stroke();


    

    // topology.arcs.forEach(function(p, i) {
      // context.beginPath();
      // context.arc(p.left[0], p.left[1], 10, 0, 2 * Math.PI);
      // context.fill();
      // context.closePath();
    // });

    // context.beginPath();
    // spwUtils.renderMultiPolygon(context, topojson.merge(topology, topology.objects.voronoi.geometries.filter(function(d, i) { 
    //   return i & 1; 
    // })), width, height, ((Math.random() * 11) - 5));
    // // context.fillStyle = "rgba(255,0,0,0.1)";
    // context.fillStyle = "rgba(255,255,255,0.3)";
    // context.fill();
    // context.lineWidth = 1.5;
    // context.lineJoin = "round";
    // // context.strokeStyle = "rgba(255,0,0,1)";
    // context.strokeStyle = "rgba(255,255,255,1)";
    // context.stroke();
    // context.closePath();

    // spwUtils.renderMultiPolygon(context, topojson.merge(topology, topology.objects.voronoi.geometries.filter(function(d, i) { 
    //   return i & 1; 
    // })), width, height, ((Math.random() * 11) - 5));
    // // context.fillStyle = "rgba(255,0,0,0.1)";
    // context.fillStyle = "rgba(255,255,255,0.3)";
    // context.fill();
    // context.lineWidth = 1.5;
    // context.lineJoin = "round";
    // // context.strokeStyle = "rgba(255,0,0,1)";
    // context.strokeStyle = "rgba(255,255,255,1)";
    // context.stroke();
    // context.closePath();



    // context.beginPath();
    // spwUtils.renderMultiPolygon(context, topojson.merge(topology2, topology2.objects.voronoi.geometries.filter(function(d, i) { 
    //   return i & 1; 
    // })));
    // // context.fillStyle = "rgba(255,0,0,0.1)";
    // context.fillStyle = "rgba(255,255,255,0.3)";
    // context.fill();
    // context.lineWidth = 1.5;
    // context.lineJoin = "round";
    // // context.strokeStyle = "rgba(255,0,0,1)";
    // context.strokeStyle = "rgba(255,255,255,1)";
    // context.stroke();
    // context.closePath();


    // context.beginPath();
    // spwUtils.renderMultiPolygon(context, topojson.merge(topology2, topology2.objects.voronoi.geometries.filter(function(d, i) { 
    //   return !(i & 1); 
    // })));
    // // context.fillStyle = "rgba(255,0,0,0.1)";
    // context.fillStyle = "rgba(255,255,255,0.8)";
    // context.fill();
    // context.lineWidth = 1.5;
    // context.lineJoin = "round";
    // // context.strokeStyle = "rgba(255,0,0,1)";
    // context.strokeStyle = "rgba(255,255,255,1)";
    // context.stroke();
    // context.closePath();

    // requestAnimationFrame(that.particleStart);
  },
  diagramFind : function(x, y, radius){
    console.log('find');
    var that = this;
    var diagram = that.voronoiArr[0].diagram;
    var polygons = that.voronoiArr[0].polygons;
    // var polygons = that.voronoiArr[0].diagram.polygons();
    var i, next = diagram.find.found || Math.floor(Math.random() * diagram.cells.length);
    var cell = diagram.cells[next] || diagram.cells[next=0];
    var dx = x - cell.site[0], 
        dy = y - cell.site[1],
        dist = dx*dx + dy*dy;

    console.log('diagram.find.found : ' + diagram.find.found);
    
    // polygons.forEach(function(p,i){
    //   delete polygons[i]['background'];
    // });
    do {
      cell = diagram.cells[i=next];
      next = null;

      // delete polygons[i]['background'] ;
      // polygon._groups[0][i].setAttribute('fill', '#f5a61d');
      polygons[i].background = 'orange';
      cell.halfedges.forEach(function(e) {
        var edge = diagram.edges[e];
        var ea = edge.left;
        if (ea === cell.site || !ea) {
          ea = edge.right;
        }
        if (ea){
          // console.log('ea.index : ' + ea.index);
          if( polygons[ea.index].background != 'orange'){
            for(var j =0; j <polygons[ea.index].length; j++){
              // polygons[ea.index][j] = resample(polygons[ea.index][j]);
              // polygons[ea.index][j][0] += Math.random() < 0.5 ? -1 : 1;
              // polygons[ea.index][j][1] += Math.random() < 0.5 ? -1 : 1;
            }
            polygons[ea.index].background = 'green';
            // console.log('green ea.index : ' + ea.index);
          };
          // if (polygon._groups[0][ea.index].getAttribute('fill') != '#f5a61d')
          // polygon._groups[0][ea.index].setAttribute('fill', '#fbe8ab');
          var dx = x - ea[0],
              dy = y - ea[1],
              ndist = dx*dx + dy*dy;
          if (ndist < dist){
            dist = ndist;
            next = ea.index;
            return;
          }
        }
      });

    } while (next !== null);

    diagram.find.found = i;

    that.voronoiArr[0].polygons = polygons;
    
    if (!radius || dist < radius * radius) return cell.site;
  },
  drawVoro : function(){
    var x, y = 0;
    var that = this;
    var context = that.context;
    var samples = that.voronoiArr[0].samples;
    var polygons = that.voronoiArr[0].polygons;
    var imageData = that.imageData;
    var width = that.width;
    

    for (var i = 0, n = polygons.length; i < n; ++i){
      context.beginPath();

      x = Math.floor(samples[i][0]),
      y = Math.floor(samples[i][1]);

      // context.fillStyle = pointSampleImage(imageData, x, y) + "";
      // console.log(squareSampleImage(imageData, x, y, 3));

      var rgba = spwUtils.squareSampleImage(imageData, x, y, 3, width);
      if(typeof samples[i][2] !== 'undefined'){
        rgba.opacity = samples[i][2];
      }else{
        rgba.opacity = 0.8;
      };

      context.fillStyle =  rgba + "";
      // if(typeof polygons[i].background !== 'undefined'){
      //   console.log('background yes : ' + i + ' : ' + polygons[i].background);
      //   context.fillStyle =  polygons[i].background;
      // }
      that.drawCell(polygons[i]);
      context.strokeStyle =  "#fff";
      context.stroke();
      context.fill();
      context.closePath();
    };

    // that.drawInnerCircle();
    // that.drawInnerLine();
    
    // // 링크
    // context.beginPath();
    // for (var i = 0, n = links.length; i < n; ++i) drawLink(links[i]);
    // context.strokeStyle = "#fff";
    // context.stroke();
    // context.beginPath();

    // //사이트
    // for (var i = 1, n = samples.length; i < n; ++i) drawSite(samples[i]);
    // context.fillStyle = "black";
    // context.fill();
    // context.strokeStyle = "yellow";
    // context.stroke();
  },
  drawPolygonIncircle : function(points, offsetRadius) {
    var context = this.context;
    var circle = spwUtils.polygonIncircle(points),
        radius = circle.radius + offsetRadius;
    if (radius > 0) {
      context.moveTo(circle[0] + radius, circle[1]);
      context.arc(circle[0], circle[1], radius, 0, 2 * Math.PI);
    }
  },
  drawSite:function(site) {
    var context = this.context;
    context.moveTo(site[0] + 2.5, site[1]);
    context.arc(site[0], site[1], 2.5, 0, 2 * Math.PI, false);
  },
  drawLink:function(link) {
    var context = this.context;
    context.moveTo(link.source[0], link.source[1]);
    context.lineTo(link.target[0], link.target[1]);
  },
  drawCell:function(cell) {
    var context = this.context;
    if (!cell) return false;
    context.moveTo(cell[0][0], cell[0][1]);
    for (var j = 1, m = cell.length; j < m; ++j) {
      context.lineTo(cell[j][0], cell[j][1]);
    }
    context.closePath();
    return true;
  },

};

springWaltz.initialize();