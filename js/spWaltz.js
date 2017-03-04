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
  userAction : true,
  mouseholding : false,
  mouseTimeOut : 0,
  mouseStrength :{
    'mousemove' : 0.01,
    'mouseup' : 0.3,
    'mousehold' : 0.4,
  },
  now : 0,
  then : Date.now(),
  interval : 1000/30,   //frame late
  delta : 0,
  initialize : function(){
    this.initCanvas();
    this.initImage();

    var maker = new voronoiMaker(100);
    var voronoiObj = maker.init(this.width, this.height);
    this.voronoiArr.push(voronoiObj);
    // this.startAudio();
    this.startAnimation();
  },
  initImage : function(){
    this.backImgae = new Image;
    this.backImgae.src = this.backImgaeSrc;
    // this.backImgae.onload = this.startAnimation;
  },
  initCanvas : function(){
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas = d3.select("body").append("canvas")
        .attr("width", this.width)
        .attr("height", this.height);

    d3.select("canvas").on("touchmove mousemove", this.mousemoved);
    d3.select("canvas").on("touchstart mousedown", this.mousedown);
    d3.select("canvas").on("touchend mouseup", this.mouseup);
    this.context = this.canvas.node().getContext("2d");
  },
  mousedown : function() {
    springWaltz.mouseTimeOut = setTimeout(springWaltz.mousehold, 500);
  },
  mousehold : function(){
    springWaltz.mouseholding = true;
  },
  mouseup : function() {
    if (springWaltz.mouseTimeOut){
      clearTimeout(springWaltz.mouseTimeOut);
    };
    springWaltz.mouseholding = false;
    var samp = springWaltz.diagramFind('mouseup', d3.mouse(this)[0],d3.mouse(this)[1], 50);
    if(typeof samp !== 'undefined' && samp !== null){
      springWaltz.voronoiArr[0].samples[samp.index].mouseup = true;
      springWaltz.userAction = true;
      // springWaltz.start();
    };
  },
  mousemoved : function() {
    var type = 'mousemove';
    if(springWaltz.mouseholding){
      type = 'mousehold';
    };
    var samp = springWaltz.diagramFind(type, d3.mouse(this)[0],d3.mouse(this)[1], 50);
    if(typeof samp !== 'undefined' && samp !== null){
      springWaltz.voronoiArr[0].polygons[samp.index].background = 'red';
      springWaltz.voronoiArr[0].samples[samp.index].mousemoved = true;
      springWaltz.userAction = true;
      // springWaltz.start();
    }
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
  startAnimation : function(){
    window.requestAnimationFrame(this.startAnimation.bind(this));
    this.now = Date.now();
    this.delta = this.now - this.then;
    if (this.delta > this.interval) {
      if(this.userAction){
        this.then = this.now - (this.delta % this.interval);
        this.context.drawImage(this.backImgae, 0, 0);
        this.imageData = this.context.getImageData(0, 0, this.width, this.height);
        this.startVoronoi();
        this.userAction = false;
      }
    };
  },
  drawInnerLine : function(){
    var that = this;
    var width = that.width;
    var imageData = that.imageData;
    var context = that.context;
    var polygons = that.voronoiArr[0].polygons;
    var samples = that.voronoiArr[0].samples;

    // var polygonsClone = JSON.parse(JSON.stringify(polygons));
    for (var i = 0; i < 1; ++i) {
      polygons.forEach(function(cell, j) {
        // if( j & 1) return;
        var p0 = cell.shift(),
            p1 = cell[0],
            t = Math.min(0.001, 200 / that.getDistance(p0, p1));
        if(typeof polygons[j].melting !== 'undefined'){
          console.log('polygons[j].melting : ' + polygons[j].melting);
          t = Math.max(0.1, polygons[j].melting);
          delete polygons[j].melting;
        }
        var p2 = [p0[0] * (1 - t) + p1[0] * t, p0[1] * (1 - t) + p1[1] * t];
        context.beginPath();
        that.drawCell(cell);
        cell.push(p2);
        var rgba = spwUtils.squareSampleImage(imageData, p0[0], p0[1], 3, width);
        rgba.opacity = Math.random();
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
        // context.fill();
        // context.closePath();
      });
    }
  },
  drawTopology : function(){
    var that = this;
    var context = that.context;
    var width = that.width;
    var height = that.height;
    var imageData = that.imageData;
    var samples = that.voronoiArr[0].samples;
    var polygons = that.voronoiArr[0].polygons;
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

    //stoke of polygons
    // context.beginPath();
    // spwUtils.renderMultiLineString(context, topojson.mesh(topology, topology.objects.voronoi, function(a, b) { return a !== b; }));
    // // context.strokeStyle = "rgba(0,0,0,0.4)";
    // context.strokeStyle = "rgba(255,255,255,0.8)";
    // context.lineWidth = 0.5;
    // context.stroke();

    //Sites
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
  drawBasic : function(){
    var x, y = 0;
    var that = this;
    var context = that.context;
    var samples = that.voronoiArr[0].samples;
    var polygons = that.voronoiArr[0].polygons;
    var imageData = that.imageData;
    var width = that.width;
    var height = that.height;

    for (var i = 0, n = polygons.length; i < n; ++i){
      context.beginPath();

      x = Math.floor(samples[i][0]),
      y = Math.floor(samples[i][1]);

      // context.fillStyle = pointSampleImage(imageData, x, y) + "";
      // console.log(squareSampleImage(imageData, x, y, 3));

      var rgba = spwUtils.squareSampleImage(imageData, x, y, 3, width);
      if(typeof samples[i].mouseup !== 'undefined'){
        // rgba.opacity = samples[i][2];
        rgba.opacity = 0.5;
      }else{
        rgba.opacity = 0.8;
      };

      context.fillStyle =  rgba + "";
      if(typeof polygons[i].background !== 'undefined'){
        context.fillStyle =  polygons[i].background;
        delete polygons[i].background;
      }
      that.drawCell(polygons[i]);
      context.strokeStyle =  "#fff";
      context.stroke();
      context.fill();
      context.closePath();
    };


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
  startVoronoi : function(){
    console.log('startVoronoi');
    this.drawInnerCircle();
    this.drawInnerLine();
    this.drawTopology();
    this.drawBasic();
  },
  diagramFind : function(type, x, y, radius){
    var that = this;
    var diagram = that.voronoiArr[0].diagram;
    var polygons = that.voronoiArr[0].polygons;
    var samples = that.voronoiArr[0].samples;
    var i, next = diagram.find.found || Math.floor(Math.random() * diagram.cells.length);
    var cell = diagram.cells[next] || diagram.cells[next=0];
    var dx = x - cell.site[0], 
        dy = y - cell.site[1],
        dist = dx*dx + dy*dy;
    do {
      cell = diagram.cells[i=next];
      next = null;

      polygons[i].background = 'orange';
      if(typeof polygons[i].melting === 'undefined'){
        polygons[i].melting = 0;
      };
      polygons[i].melting = that.mouseStrength[type];

      cell.halfedges.forEach(function(e) {
        var edge = diagram.edges[e];
        var ea = edge.left;
        if (ea === cell.site || !ea) {
          ea = edge.right;
        }
        if (ea){
          if( polygons[ea.index].background != 'orange'){
            polygons[ea.index].background = 'green';
            if(typeof polygons[ea.index].melting === 'undefined'){
              polygons[ea.index].melting = 0;
            };
            polygons[ea.index].melting = that.mouseStrength[type] * 0.5;
          };
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
  drawPolygonIncircle : function(points, offsetRadius) {
    var context = this.context;
    var circle = spwUtils.polygonIncircle(points),
        radius = circle.radius + offsetRadius;
    if (radius > 0) {
      context.moveTo(circle[0] + radius, circle[1]);
      context.arc(circle[0], circle[1], radius, 0, 2 * Math.PI);
    }
  },
  getDistance:function(a, b) {
    var dx = a[0] - b[0], dy = a[1] - b[1];
    return Math.sqrt(dx * dx + dy * dy);
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