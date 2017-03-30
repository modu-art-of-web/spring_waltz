function voronoiMaker(sampleType){
  var samples = [],
      sample, s, voronoi, diagram, links, polygons, triangles;

  function sampleing(width, height){
    if(sampleType[0] === 'poisson'){
      sample = spwUtils.poissonDiscSampler(width, height, sampleType[1]);
      while (s =sample()) samples.push(s);
      var widthSideDotNum = parseInt(width / 10);
      var heightSideDotNum = parseInt(height / 10);
      var dotsW = width / widthSideDotNum;
      var dotsH = height / heightSideDotNum;
      for(var i = 0; i <= widthSideDotNum; i++){
        samples.push([dotsW*i, 0]);
        samples.push([dotsW*i, height]);
      };
      for(var i = 1; i <= heightSideDotNum; i++){
        samples.push([0, dotsH*i]);
        samples.push([width, dotsH*i]);
      };
    }else if(sampleType[0] === 'random'){
      samples = d3.range(sampleType[1]).map(function(d) { return [Math.floor(Math.random() * (width + 1)), Math.floor(Math.random() * (height + 1))]; });
    }
  };
  function initVoronoi(width, height){
    voronoi = d3.voronoi().extent([[-100, -100], [width+100, height+100]]);
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
  video : {},
  voronoiArr : [],
  angle : 0,
  audioVis : {},
  audioNode : {},
  userAction : true,
  mouseholding : false,
  mouseTimeOut : 0,
  mouseStrength :{
    'mousemove' : 0.01,
    'mouseup' : 0.05,
    'mousehold' : 0.1,
  },
  now : 0,
  then : Date.now(),
  interval : 1000/30,   //frame late
  delta : 0,
  meltRandArr : [],
  meltRandNow : 0,
  meltRandThen : Date.now(),
  meltRandInterval : 1000,   //frame late
  meltRandDelta : 0,
  barsArr1 : [],
  barsArr2 : [],
  barsArr3 : [],
  barsArr4 : [],
  meltTriArrs : [],
  mouseX : 0,
  mouseY : 0,
  rythmX : 0,
  rythmY : 0,
  sinAngle : 0,
  sinHeight : 0,
  initialize : function(){
    var that = this;
    that.initCanvas();
    var basicVoronoi = new voronoiMaker(['random',100]);
    var voronoiObj = basicVoronoi.init(that.width, that.height);
    that.voronoiArr.push(voronoiObj);

    var triangleVoronoi = new voronoiMaker(['poisson',30]);
    var voronoiObj2 = triangleVoronoi.init(that.width, that.height);
    that.voronoiArr.push(voronoiObj2);
    that.startAudio();

    // that.initImage();
    that.initVideo();

    var samplesLength = voronoiObj.samples.length;
    var randNum = Math.floor((Math.random() * 50) - 10);
    var randNum = samplesLength/60;
    for(var i = 0; i < randNum; i++){
      that.meltRandArr.push( Math.floor((Math.random() * samplesLength)));
    };
    // that.startAnimation();
  },
  initImage : function(){
    var that = this;
    that.backImgae = new Image;
    that.backImgae.src = that.backImgaeSrc;
    that.startAnimation();
  },
  initVideo : function(){
    var that = this;
    that.video = document.getElementById("theVideo");
    if(typeof that.video.readyState !== 'undefined' && that.video.readyState === 4 ) {
      var canvas = that.canvas;
      var context = that.context;
      // that.drawVideo(context, that.video, canvas.width, canvas.height);
      that.backImgae = that.video;
      that.startAnimation();
    }else{
      that.video.addEventListener('loadeddata', function() {
        var canvas = that.canvas;
        var context = that.context;
        // that.drawVideo(context, that.video, canvas.width, canvas.height);
        that.backImgae = that.video;
        that.startAnimation();
      });
    }
  },
  initCanvas : function(){
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.mouseX = this.width/2;
    this.mouseY = this.height/2;
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
      springWaltz.userAction = true;
      springWaltz.meltTriArrs = [];
      // springWaltz.start();
    }
    springWaltz.mouseX = d3.mouse(this)[0];
    springWaltz.mouseY = d3.mouse(this)[1];
  },
  
  startAudio : function(){
    var that = this;
    that.audioVis = new AudioVisualizer();
    that.audioVis.setupAudioProcessing();
    that.audioVis.getAudio();
    that.audioNode = that.audioVis.javascriptNode;
    that.audioNode.onaudioprocess = function () {

        // get the average for the first channel
        // var array1 = new Float32Array(that.audioVis.analyser.frequencyBinCount);
        // that.audioVis.analyser.getFloatFrequencyData(array1);

        // var array2 = new Uint8Array(that.audioVis.analyser.frequencyBinCount);
        // that.audioVis.analyser.getByteFrequencyData(array2);

        // var array3 = new Float32Array(that.audioVis.analyser.frequencyBinCount);
        // that.audioVis.analyser.getFloatFrequencyData(array3);

        var array4 = new Uint8Array(that.audioVis.analyser.frequencyBinCount);
        that.audioVis.analyser.getByteFrequencyData(array4);
        // var array3 = new Float32Array(that.audioVis.analyser.frequencyBinCount);
        // that.audioVis.analyser.getFloatTimeDomainData(array3);

        // var array4 = new Uint8Array(that.audioVis.analyser.frequencyBinCount);
        // that.audioVis.analyser.getByteTimeDomainData(array4);
        

        //render the scene and update controls
        // that.audioVis.renderer.render(that.audioVis.scene, that.audioVis.camera);
        // that.audioVis.controls.update();

        // var step1 = Math.round(array1.length / that.audioVis.numberOfBars);
        // var step2 = Math.round(array2.length / that.audioVis.numberOfBars);
        // var step3 = Math.round(array3.length / that.audioVis.numberOfBars);
        var step4 = Math.round(array4.length / that.audioVis.numberOfBars);

        //Iterate through the bars and scale the z axis
        for (var i = 0; i < that.audioVis.numberOfBars; i++) {
            // var value1 = array1[i * step1] / 4;
            // var value2 = array2[i * step2] * 10;
            // var value3 = array3[i * step3] / 4;
            var value4 = array4[i * step4] / 4;
            // value = value < 1 ? 1 : value;
            // console.log('value : ' + value);
            
            // that.audioVis.bars[i].scale.z = value;
            // that.barsArr1[i] = value1;
            // that.barsArr2[i] = value2;
            // that.barsArr3[i] = value3;
            that.barsArr4[i] = value4;
        }

        
    }
  },
  startEqulizer : function(){
    var that = this;
    var context = that.context;
    var samples = that.voronoiArr[1].samples;
    var height = that.height;
    var width = that.width;
    var bars4 = that.barsArr4;
    var barW = width / (bars4.length+1);

    // var perAngle = 360 / bars4.length;
    // that.meltTriArrs = [];
    // bars4.forEach(function(b, i){

    //     samples.push([
    //       that.mouseX + Math.sin(perAngle*i) * (b*5)
    //       ,that.mouseY + Math.cos(perAngle*i) * (b*5)
    //     ]);
    //     samples[samples.length - 1].melting = 0.9;
    //     samples[samples.length - 1].musics = true;
    // })
    // 
    if(that.sinAngle* 10 > width){
      that.sinAngle = 0;
    };
    that.sinHeight += (height /that.sinAngle)*10;
    if(that.sinHeight > height){
      that.sinHeight = 0;
    }
    that.sinAngle++;
    samples.push([
      that.sinAngle * 10
      , that.sinHeight + Math.sin(that.sinAngle) * 10
    ]);
    samples[samples.length - 1].melting = 0.1;
    samples[samples.length - 1].musics = true;

    // samples[0][0] += that.sinAngle; 
    // samples[0][1] += that.sinAngle; 
  },
  startAnimation : function(){
    window.requestAnimationFrame(this.startAnimation.bind(this));
    this.now = Date.now();
    this.delta = this.now - this.then;
    if (this.delta > this.interval) {
      if(this.userAction){
        this.then = this.now - (this.delta % this.interval);
        this.context.drawImage(this.backImgae, 0, 0);
        
        // this.context.fillStyle = 'red';
        // this.context.fillRect(0,0,this.width, this.height);
        // this.context.clearRect(0,0,this.width, this.height);

        this.imageData = this.context.getImageData(0, 0, this.width, this.height);
        if(this.backImgae.currentTime !== 0){
          this.startVoronoi();
        }
        // this.userAction = false;
      }
    }
  },
  meltRandom : function(){
    var that = this;

    
    var samples = that.voronoiArr[0].samples;
    that.meltRandNow = Date.now();
    that.meltRandDelta = that.meltRandNow - that.meltRandThen;
    that.meltRandInterval = Math.floor((Math.random() * 10000) + 5000);
    if (that.meltRandDelta > that.meltRandInterval) {
      console.log('MELTING RANDOM!!!');
      that.meltRandThen = that.meltRandNow - (that.meltRandDelta % that.meltRandInterval);
      // that.meltRandArr.forEach(function(m, i){
      //   that.diagramFind('mousemove', samples[m][0],samples[m][1], 50);
      // });
      for(var i=0; i < 30; i++){
        that.diagramFind('meltrandom', Math.random()*that.width,Math.random()*that.height, 50);
      }
    }

    
  },
  drawBasic : function(){
    var x, y = 0;
    var that = this;
    var width = that.width;
    var height = that.height;
    var context = that.context;
    var samples = that.voronoiArr[0].samples;
    var voronoi = that.voronoiArr[0].voronoi;
    // var polygons = that.voronoiArr[0].polygons;
    var triangles = that.voronoiArr[0].triangles;
    var links = that.voronoiArr[0].links;
    var imageData = that.imageData;
    var width = that.width;
    var height = that.height;
    var alpha = 200;
    var asq = alpha*alpha;

    var polygons = voronoi(samples.filter(function(s, i) {
      // if(typeof s.musics !== 'undefined'){
      //   samples.splice(i,1);
      // };
      // return typeof s.melting !== 'undefined';
      return true;
    })).polygons();

    for (var i = 0, n = polygons.length; i < n; ++i){
      context.beginPath();

      if(typeof polygons[i] === 'undefined' || typeof polygons[i].data === 'undefined' ){
        // console.log('polygons[i] : ' + i);
      }else{
        x = Math.floor(polygons[i].data[0]),
        y = Math.floor(polygons[i].data[1]);
      }
      

      // context.fillStyle = pointSampleImage(imageData, x, y) + "";
      // console.log(squareSampleImage(imageData, x, y, 3));

      var rgba = spwUtils.squareSampleImage(imageData, x, y, 3, width);
      // if(typeof samples[i].mouseup !== 'undefined'){
      //   // rgba.opacity = samples[i][2];
      //   rgba.opacity = 0.5;
      // }else{
      //   rgba.opacity = 0.8;
      // };
      rgba.opacity = 0.2;

      context.fillStyle =  rgba + "";

      // if(typeof polygons[i] !== 'undefined' && typeof polygons[i].background !== 'undefined'){
      //   context.fillStyle =  polygons[i].background;
      //   // that.meltTriArrs = [];
      //   polygons[i].forEach(function(pp,ii){
      //     that.meltTriArrs.push([(pp[0]),(pp[1])]);
      //   });
        
      //   delete polygons[i].background;
      // }
      that.drawCell(polygons[i]);
      // context.strokeStyle =  "#fff";
      // context.stroke();
      context.fill();
      context.closePath();
    };

    // // 링크
    // context.beginPath();
    // for (var i = 0, n = links.length; i < n; ++i) that.drawLink(links[i]);
    // context.strokeStyle = "#fff";
    // context.stroke();

    // 사이트
    // for (var i = 0, n = samples.length; i < n; ++i){
    //   // if(typeof samples[i].melting !== 'undefined'){
    //   //   context.font = "20px Arial";
    //   //   context.fillStyle = "#fff";
    //   //   context.fillText(samples[i].melting,samples[i][0],samples[i][1]);
    //     context.beginPath();
    //     that.drawSite(samples[i]);
    //     if(typeof samples[i].musics !== 'undefined' && samples[i].musics){
    //       context.fillStyle = "red";
    //       context.strokeStyle = "red";
    //     }else{
    //       context.fillStyle = "black";
    //       context.strokeStyle = "yellow";
    //     };
    //     context.fill();
    //     context.stroke();
    //     context.closePath();
    //   // }
    // };
  },
  drawTriangles : function(){
    console.log('drawTriangles');
    var x, y = 0;
    var that = this;
    var width = that.width;
    var height = that.height;
    var context = that.context;
    var samples = that.voronoiArr[1].samples;
    var voronoi = that.voronoiArr[1].voronoi;
    // var polygons = that.voronoiArr[1].polygons;
    var triangles = that.voronoiArr[1].triangles;
    var links = that.voronoiArr[1].links;
    var imageData = that.imageData;
    var width = that.width;
    var height = that.height;
    var alpha = 200;
    var asq = alpha*alpha;

    // triangles 1
    var triangles = voronoi(samples.filter(function(s, i) {
      // if(typeof s.musics !== 'undefined'){
      //   samples.splice(i,1);
      // };
      if( typeof s.melting === 'undefined'){
        s.melting = 0;
      }
      return true;
    })).triangles().filter(function(t, i) {
        // var evaluated = that.dsq(t[0],t[1]) < asq && that.dsq(t[0],t[2]) < asq && that.dsq(t[1],t[2]) < asq;
        // return evaluated;
        return true;
    });
    for (var i = 0, n = triangles.length; i < n; i++){
      context.beginPath();
      that.drawCell(triangles[i]);

      var meltingAver = (triangles[i][0].melting + triangles[i][1].melting + triangles[i][2].melting) / 3;
      context.fillStyle =  "rgba(255,255,255,"+(1-meltingAver)+")";
      // context.strokeStyle =  "rgba(0,0,0,0."+(1-meltingAver)+")";
      // context.fillStyle = 'rgba(255,255,255,0.8)';
      // context.strokeStyle =  "rgba(255,255,255,1)";
      // context.stroke();
      context.fill();
      context.closePath();
    }; 

    // // triangles 2 
    // var triangles2 = voronoi(samples.filter(function(s, i) {
    //   return true;
    // })).triangles().filter(function(t, i) {
    //     return true;
    //     // var evaluated = that.dsq(t[0],t[1]) < asq && that.dsq(t[0],t[2]) < asq && that.dsq(t[1],t[2]) < asq;
    //     // return evaluated;
    // });
    // // var triangles2 = triangles;
    // for (var i = 0, n = triangles2.length; i < n; i++){
    //   context.beginPath();
    //   that.drawCell(triangles2[i]);
    //   var opacity = 1;
    //   if(typeof triangles2[i][0].melting !== 'undefined' && typeof triangles2[i][1].melting !== 'undefined' && typeof triangles2[i][2].melting !== 'undefined'){
    //     var meltingAver = (triangles2[i][0].melting + triangles2[i][1].melting + triangles2[i][2].melting) / 3;
    //     opacity = 1 - meltingAver;
    //   };
    //   context.fillStyle =  "rgba(255,255,255,"+opacity+")";
    //   // context.fillStyle =  "gray";
    //   // context.strokeStyle =  "rgba(255,255,255,"+opacity+")";
    //   // context.lineWidth = 0;
    //   context.strokeStyle =  "green";
    //   context.stroke();
    //   context.fill();
    //   context.closePath();
    // };

    // // 링크
    // context.beginPath();
    // for (var i = 0, n = links.length; i < n; ++i) that.drawLink(links[i]);
    // context.strokeStyle = "#fff";
    // context.stroke();

    //사이트
    
    // for (var i = 0, n = samples.length; i < n; ++i){
    //   // if(typeof samples[i].melting !== 'undefined'){
    //   //   context.font = "20px Arial";
    //   //   context.fillStyle = "#fff";
    //   //   context.fillText(samples[i].melting,samples[i][0],samples[i][1]);
    //     context.beginPath();
    //     that.drawSite(samples[i]);
    //     if(typeof samples[i].musics !== 'undefined' && samples[i].musics){
    //       context.fillStyle = "red";
    //       context.strokeStyle = "red";
    //     }else{
    //       context.fillStyle = "black";
    //       context.strokeStyle = "yellow";
    //     };
    //     context.fill();
    //     context.stroke();
    //     context.closePath();
    //   // }
    // };
  },
  startVoronoi : function(){
    this.startEqulizer();
    // this.meltRandom();
    // this.drawBasic();
    this.drawTriangles();
  },
  diagramFind : function(type, x, y, radius){
    var that = this;
    var diagram = that.voronoiArr[1].diagram;
    var polygons = that.voronoiArr[1].polygons;
    var samples = that.voronoiArr[1].samples;
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
        samples[i].melting = 0.9;
      };
      
      

      if(type === 'meltrandom'){
        samples[i].melting = 1;
        // polygons[i].melting = Math.random() * 0.1;
      }else{
        polygons[i].melting = that.mouseStrength[type];
      };
      
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
              samples[ea.index].melting = 0;
            };
            polygons[ea.index].melting = that.mouseStrength[type] * 0.5;
            
          };

          if(typeof samples[ea.index].melting === 'undefined'){
            samples[ea.index].melting = 0.9;
          };
          samples[ea.index].melting += that.mouseStrength[type];
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
  dsq : function(a,b) {
    var dx = a[0]-b[0], dy = a[1]-b[1];
    return dx*dx+dy*dy;
  },
  offset : function(a,dx,dy) {
    return a.map(function(d) { return [d[0]+dx,d[1]+dy]; });
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
    for (var j = 1, m = cell.length; j < m; j++) {
      context.lineTo(cell[j][0], cell[j][1]);
    };
    context.closePath();
    return true;
  },
};

window.onload = function(){
  var playButton = d3.select('#play_spring_waltz');
  console.log('playButton : ' + playButton);
  
  if(playButton._groups[0][0] !== null){
    playButton.on('click', function() {
        console.log('click');
        springWaltz.initialize();
        // d3.select('#start_container').hide();
        this.parentNode.style.display = 'none';
    });
  }else{
    springWaltz.initialize();
  }
};
