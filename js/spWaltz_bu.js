function voronoiMaker(sampleRadius){
  var samples = [],
      sample, s, voronoi, diagram, links, polygons, triangles;

  function sampleing(width, height){
    sample = spwUtils.poissonDiscSampler(width, height, sampleRadius);
    while (s =sample()) samples.push(s);

    // samples = d3.range(300).map(function(d) { return [Math.floor(Math.random() * (width + 1)), Math.floor(Math.random() * (height + 1))]; });

    var widthSideDotNum = 100;
    var heightSideDotNum = 50;
    var dotsW = width / widthSideDotNum;
    var dotsH = height / heightSideDotNum;
    for(var i = 0; i <= widthSideDotNum; i++){
      samples.push([dotsW*i, 0]);
      samples.push([dotsW*i, height]);
    };
    for(var i = 1; i < heightSideDotNum; i++){
      samples.push([0, dotsH*i]);
      samples.push([width, dotsH*i]);
    };
    // Math.floor(Math.random() * (width - min + 1)) + min
  };
  function dsq(a,b) {
      var dx = a[0]-b[0], dy = a[1]-b[1];
      return dx*dx+dy*dy;
  };
  function offset(a,dx,dy) {
        return a.map(function(d) { return [d[0]+dx,d[1]+dy]; });
  };
  function initVoronoi(width, height){
    var alpha = 50;
    var asq = alpha*alpha;
    voronoi = d3.voronoi().extent([[0, 0], [width, height]]);
    var evalArr = [];
    vertices = [[162, 332], [182, 299], [141, 292], [158, 264], [141, 408], [160, 400], [177, 430], [151, 442], [155, 425], [134, 430], [126, 447], [139, 466], [160, 471], [167, 447], [182, 466], [192, 442], [187, 413], [173, 403], [168, 425], [153, 413], [179, 275], [163, 292], [134, 270], [143, 315], [177, 320], [163, 311], [162, 281], [182, 255], [141, 226], [156, 235], [173, 207], [187, 230], [204, 194], [165, 189], [145, 201], [158, 167], [190, 165], [206, 145], [179, 153], [204, 114], [221, 138], [243, 112], [248, 139], [177, 122], [179, 99], [196, 82], [219, 90], [240, 75], [218, 61], [228, 53], [211, 34], [197, 51], [179, 65], [155, 70], [165, 85], [134, 80], [124, 58], [153, 44], [173, 34], [192, 27], [156, 19], [119, 32], [128, 17], [138, 36], [100, 58], [112, 73], [100, 92], [78, 100], [83, 78], [61, 63], [80, 44], [100, 26], [60, 39], [43, 71], [34, 54], [32, 90], [53, 104], [60, 82], [66, 99], [247, 94], [187, 180], [221, 168]];
    vertices = [];
    // polygons = voronoi(offset(samples,200,200)).polygons().filter(function(t, i) {
    //     // console.log(t);
    //     // console.log(i);
    //     var evaluated = dsq(t[0],t[1]) < asq && dsq(t[0],t[2]) < asq && dsq(t[1],t[2]) < asq;
    //     if(!evaluated){
    //       evalArr.push(i);
    //     }
    //     return evaluated;
    // });
    // triangles = voronoi(offset(vertices,0,0)).triangles().filter(function(t, i) {
    //     // console.log(t);
    //     // console.log(i);
    //     var evaluated = dsq(t[0],t[1]) < asq && dsq(t[0],t[2]) < asq && dsq(t[1],t[2]) < asq;
    //     if(!evaluated){
    //       evalArr.push(i);
    //     }
    //     return evaluated;
    // });
    evalArr.reverse().forEach(function(e){
      vertices.splice(e, 1);
    });


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
          vertices : vertices,
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
  initialize : function(){
    var that = this;
    that.initCanvas();
    var maker = new voronoiMaker(30);
    var voronoiObj = maker.init(that.width, that.height);
    that.voronoiArr.push(voronoiObj);
    that.startAudio();

    // that.initImage();
    that.initVideo();

    var samplesLength = voronoiObj.samples.length;
    var randNum = Math.floor((Math.random() * 50) - 10);
    var randNum = samplesLength/60;
    for(var i = 0; i < randNum; i++){
      that.meltRandArr.push( Math.floor((Math.random() * samplesLength)));
    };
    // console.log('that.meltRandArr : '  + JSON.stringify(that.meltRandArr));
    // that.startAnimation();
  },
  initImage : function(){
    var that = this;
    that.backImgae = new Image;
    that.backImgae.src = that.backImgaeSrc;
    that.startAnimation();
    // window.onload = function(){
    //   that.backImgae = new Image;
    //   that.backImgae.src = that.backImgaeSrc;
    //   that.startAnimation();
    // }
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
  // drawVideo : function(context, video, width, height) {  
    // var that = this;
    // console.log('drawVideo');    
    // this.backImgae = video;
    // context.drawImage(video, 0, 0, width, height); // draws current video frame to canvas     
    // var delay = 100; // milliseconds delay for slowing framerate
    // setTimeout(that.drawVideo, delay, context, video, width, height); // recursively calls drawVideo() again after delay
  // },
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
    // console.log('mousehold');
    springWaltz.mouseholding = true;
  },
  mouseup : function() {
    if (springWaltz.mouseTimeOut){
      clearTimeout(springWaltz.mouseTimeOut);
    };
    // console.log('mouseup');
    springWaltz.mouseholding = false;
    var samp = springWaltz.diagramFind('mouseup', d3.mouse(this)[0],d3.mouse(this)[1], 50);
    // console.log('samp: ' + samp);
    if(typeof samp !== 'undefined' && samp !== null){
      springWaltz.voronoiArr[0].samples[samp.index].mouseup = true;
      springWaltz.userAction = true;
      // springWaltz.start();
    };
  },
  mousemoved : function() {
    // console.log('mousemoved');
    var type = 'mousemove';
    if(springWaltz.mouseholding){
      type = 'mousehold';
    };
    var samp = springWaltz.diagramFind(type, d3.mouse(this)[0],d3.mouse(this)[1], 50);
    if(typeof samp !== 'undefined' && samp !== null){
      springWaltz.voronoiArr[0].polygons[samp.index].background = 'red';
      springWaltz.voronoiArr[0].samples[samp.index].mousemoved = true;
      springWaltz.userAction = true;
      springWaltz.meltTriArrs = [];
      // springWaltz.start();
    }
    springWaltz.mouseX = d3.mouse(this)[0];
    springWaltz.mouseY = d3.mouse(this)[1];
    // springWaltz.startEqulizer(d3.mouse(this)[0],d3.mouse(this)[1]);
  },
  
  startAudio : function(){
    var that = this;
    that.audioVis = new AudioVisualizer();
    that.audioVis.setupAudioProcessing();
    that.audioVis.getAudio();
    that.audioNode = that.audioVis.javascriptNode;
    that.audioNode.onaudioprocess = function () {

        // get the average for the first channel
        var array1 = new Float32Array(that.audioVis.analyser.frequencyBinCount);
        that.audioVis.analyser.getFloatFrequencyData(array1);

        var array2 = new Uint8Array(that.audioVis.analyser.frequencyBinCount);
        that.audioVis.analyser.getByteFrequencyData(array2);

        var array3 = new Float32Array(that.audioVis.analyser.frequencyBinCount);
        that.audioVis.analyser.getFloatFrequencyData(array3);

        var array4 = new Uint8Array(that.audioVis.analyser.frequencyBinCount);
        that.audioVis.analyser.getByteFrequencyData(array4);
        // var array3 = new Float32Array(that.audioVis.analyser.frequencyBinCount);
        // that.audioVis.analyser.getFloatTimeDomainData(array3);

        // var array4 = new Uint8Array(that.audioVis.analyser.frequencyBinCount);
        // that.audioVis.analyser.getByteTimeDomainData(array4);
        

        //render the scene and update controls
        // that.audioVis.renderer.render(that.audioVis.scene, that.audioVis.camera);
        // that.audioVis.controls.update();

        var step1 = Math.round(array1.length / that.audioVis.numberOfBars);
        var step2 = Math.round(array2.length / that.audioVis.numberOfBars);
        var step3 = Math.round(array3.length / that.audioVis.numberOfBars);
        var step4 = Math.round(array4.length / that.audioVis.numberOfBars);

        // console.log('step : ' + JSON.stringify(step));
        // console.log('array : ' + JSON.stringify(array));

        //Iterate through the bars and scale the z axis
        for (var i = 0; i < that.audioVis.numberOfBars; i++) {
            var value1 = array1[i * step1] / 4;
            var value2 = array2[i * step2] * 10;
            var value3 = array3[i * step3] / 4;
            var value4 = array4[i * step4] / 4;
            // value = value < 1 ? 1 : value;
            // console.log('value : ' + value);
            
            // that.audioVis.bars[i].scale.z = value;
            that.barsArr1[i] = value1;
            that.barsArr2[i] = value2;
            that.barsArr3[i] = value3;
            that.barsArr4[i] = value4;
        }

        
    }
  },
  startEqulizer : function(){
    var that = this;
    var context = that.context;
    var samples = that.voronoiArr[0].samples;
    var vertices = that.voronoiArr[0].vertices;
    var height = that.height;
    var width = that.width;
    var bars1 = that.barsArr1;
    var bars2 = that.barsArr2;
    var bars3 = that.barsArr3;
    var bars4 = that.barsArr4;
    var barW = width / (bars1.length+1);

    var perAngle = 360 / bars3.length;

    // for(var i=0; i < 90; i++){
    //   that.rythmX = 5*i;
    //   that.rythmY = 5*i;
    //   samples.push([
    //     that.rythmX
    //     ,that.rythmY
    //   ]);
    //   samples[samples.length - 1].melting = 0.3;
    //   samples[samples.length - 1].musics = true;
    // }
    
    // samples[samples.length - 1].musics = true;

    // console.log('bars1.length : '  + bars1.length);
    // console.log('height : ' + height);
    // bars1.forEach(function(b, i){

    //   // console.log(b);
    //   // console.log(height-b*10);
    //   context.beginPath();
    //   context.rect(barW*i,height,barW,(b*10));
    //   // context.rect(width-barW*i,0,barW,(b*13));
    //   // context.rect(width,(b*3),-barW*i,(b*13));

    //   context.strokeStyle = 'red';
    //   context.fillStyle = 'rgba(255,255,255,0.5)';
    //   context.stroke();
    //   context.fill();
    //   context.closePath();
    // })
    that.voronoiArr[0].vertices = [];
    // bars2.forEach(function(b, i){
    //   // console.log(b);
    //   // console.log(height-b*10);
    //   context.beginPath();
    //   context.rect(barW*i,height,barW,-(b*0.1));

    //   that.voronoiArr[0].vertices.push([(barW*i+(barW/2)),(b*0.1)]);
    //   // context.rect(width-barW*i,0,barW,(b*13));
    //   // context.rect(width,(b*3),-barW*i,(b*13));
      
    //   // context.strokeStyle = 'orange';
    //   // context.fillStyle = 'rgba(255,255,255,0.5)';
    //   // context.stroke();
    //   // context.fill();
    //   // context.closePath();
    // })

    
    bars3.forEach(function(b, i){

      // samples.push([
      //   barW*(i+1)
      //   ,height/2 + (b*3000)
      // ]);
      // samples[samples.length - 1].melting = Math.random() + 0.5;
      // samples[samples.length - 1].musics = true;

      // console.log(b);
      // console.log(height-b*10);
      // context.beginPath();
      // context.rect(barW*i,height/2,barW,(b*3000));
      // that.voronoiArr[0].vertices.push([(barW*i+(barW/2)),(height/2+(b*500))]);

      
      // context.rect(width-barW*i,0,barW,(b*13));
      // context.rect(width,(b*3),-barW*i,(b*13));
      
      // context.strokeStyle = 'blue';
      // context.fillStyle = 'rgba(255,255,255,0.5)';
      // context.stroke();
      // context.fill();
      // context.closePath();
    })

    that.meltTriArrs = [];
    bars4.forEach(function(b, i){
    //   // console.log(b);
    //   // console.log(height-b*10);
    //   // context.beginPath();
    //   // context.rect(barW*i,height,barW,-(-height/2+b*10));
    //   // context.rect(width-barW*i,0,barW,(b*13));
    //   // context.rect(width,(b*3),-barW*i,(b*13));
    //   // context.strokeStyle = 'green';
    //   // context.fillStyle = 'rgba(255,255,255,0.5)';
    //   // context.stroke();
    //   // context.fill();
    //   // context.closePath();

        // that.rythmX = Math.random() * 5*i;
        // that.rythmY = Math.random() * 5*i;
        // samples.push([
        //   that.rythmX
        //   ,that.rythmY
        // ]);
        // samples[samples.length - 1].melting = 0.3;
        // samples[samples.length - 1].musics = true;

        samples.push([
          that.mouseX + Math.sin(perAngle*i) * (b*5)
          ,that.mouseY + Math.cos(perAngle*i) * (b*5)
        ]);
        samples[samples.length - 1].melting = 0.9;
        samples[samples.length - 1].musics = true;
        // that.meltTriArrs.push([
        //   that.mouseX + Math.sin(perAngle*i) * (b*5)
        //   ,that.mouseY + Math.cos(perAngle*i) * (b*5)
        // ]);
    })

  },
  startAnimation : function(){
    window.requestAnimationFrame(this.startAnimation.bind(this));
    this.now = Date.now();
    this.delta = this.now - this.then;
    if (this.delta > this.interval) {
      if(this.userAction){
        this.then = this.now - (this.delta % this.interval);
        // console.log('this.backImgae : ' + this.backImgae);
        // console.log('this.backImgae : ' + JSON.stringify(this.backImgae));
        // console.log('this.backImgae.duration : ' + JSON.stringify(this.backImgae.duration));
        // console.log('this.backImgae.currentTime : ' + JSON.stringify(this.backImgae.currentTime));
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
    // console.log('meltRandom');
    // console.log('that.meltRandDelta : ' + that.meltRandDelta);
    // console.log('that.meltRandInterval : ' + that.meltRandInterval);
    that.meltRandInterval = Math.floor((Math.random() * 10000) + 5000);
    if (that.meltRandDelta > that.meltRandInterval) {
      console.log('MELTING RANDOM!!!');
      that.meltRandThen = that.meltRandNow - (that.meltRandDelta % that.meltRandInterval);
      that.meltRandArr.forEach(function(m, i){
      that.diagramFind('mousemove', samples[m][0],samples[m][1], 50);
        // if(typeof samples[m].melting === 'undefined'){
        //   samples[m].melting = Math.random() - 0.5;
        // }else{
        //   samples[m].melting += 0.05;
        // }
      });
    }

    
  },
  drawCircles : function(x,y,type){
    var that = this;
    var context = that.context;
    var width = that.width;
    var height = that.height;
    var imageData = that.imageData;
    var samples = that.voronoiArr[0].samples;
    var polygons = that.voronoiArr[0].polygons;
    var topology = spwUtils.computeTopology(that.voronoiArr[0].voronoi(samples));

    // context.fillStyle = "rgba(0,0,0,0.5)";
    // context.fillRect(0,0,width, height);
    samples.forEach(function(p, i) {
      context.beginPath();
      // var melting =   Math.random() + 0.7;
      var melting = 1;
      if(typeof p.melting !== 'undefined'){
        melting = (1 - p.melting);
      };
      // console.log('melting : ' + melting);
      // var r = melting * 300;
      context.arc(p[0], p[1], 30, 0, 2 * Math.PI);
      context.fillStyle =  "rgba(255,255,255,"+melting+")";
      context.fill();
    });

    // var context = this.context;
    // var r = this.mouseStrength[type] * 300;
    // context.beginPath();
    // context.arc(x, y, r, 0, 2 * Math.PI);
    // context.fillStyle =  "rgba(255,255,255,0.1)";
    // context.fill();
  },
  drawInnerLine : function(){
    var that = this;
    var width = that.width;
    var imageData = that.imageData;
    var context = that.context;
    var polygons = that.voronoiArr[0].polygons;
    var samples = that.voronoiArr[0].samples;

    // var polygonsClone = JSON.parse(JSON.stringify(polygons));
    for (var i = 0; i < 25; ++i) {
      polygons.forEach(function(cell, j) {
        // if( j & 1) return;
        var p0 = cell.shift(),
            p1 = cell[0],
            t = Math.min(0.001, 200 / that.getDistance(p0, p1));
        if(typeof polygons[j].melting !== 'undefined'){
          // console.log('polygons[j].melting : ' + polygons[j].melting);
          t = Math.max(0.1, polygons[j].melting);
          // delete polygons[j].melting;
        }
        var p2 = [p0[0] * (1 - t) + p1[0] * t, p0[1] * (1 - t) + p1[1] * t];
        context.beginPath();
        that.drawCell(cell);
        cell.push(p2);
        var rgba = spwUtils.squareSampleImage(imageData, p0[0], p0[1], 3, width);
        rgba.opacity = Math.random();
        context.strokeStyle =  rgba + "";
        context.strokeStyle =  "rgba(255,255,255,"+t+")";
        // context.strokeStyle =  'rgba(255,255,255,0.6)';
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

    
    // var geo = topology.objects.voronoi.geometries;
    // var geoMerge = topojson.merge(topology, geo.filter(function(d, i) { 
    //   return i & 1; 
    // }));
    if(typeof that.geoMerge === 'undefined'){
      that.geo = topology.objects.voronoi.geometries;
      that.geoMerge = topojson.merge(topology, that.geo.filter(function(d, i) { 
        // return i & 1; 
        return i % 3;
      }));;
    };



    // for (var k = 0; k < 30; ++k) {
      // that.geoMerge.coordinates.forEach(function(polygon) {
      //   var polLength = polygon.length;
      //   polygon.forEach(function(ring, j) {
      //       // console.log('ring : ' + JSON.stringify(ring));
      //       // if( j & 1) return;
      //       var p0 = ring.shift(),
      //           p1 = ring[0],
      //           t = Math.min(0.01, 4 / that.getDistance(p0, p1));
      //       // if(typeof polygons[i].melting !== 'undefined'){
      //       //   console.log('polygons[i].melting : ' + polygons[i].melting);
      //       //   t = Math.max(0.1, polygons[i].melting);
      //       //   delete polygons[i].melting;
      //       //   context.beginPath();
      //       //   that.drawCell(polygons[i]);
      //       //   context.fillStyle="red";
      //       //   context.fill();
      //       // }
      //       var p2 = [p0[0] * (1 - t) + p1[0] * t, p0[1] * (1 - t) + p1[1] * t  + 5 * polLength];
      //       context.beginPath();
      //       that.drawCell(ring);
      //       ring.push(p2);
      //       var rgba = spwUtils.squareSampleImage(imageData, p0[0], p0[1], 3, width);
      //       rgba.opacity = 0.1;
      //       // context.strokeStyle =  rgba + "";
      //       // context.stroke();
      //       context.fillStyle = 'rgba(255,255,255,0.5)';
      //       context.fill();
      //       context.closePath();
      //     });
      // });
    // };


    
    that.geoMerge.coordinates.forEach(function(polygon) {
      polygon.forEach(function(ring, i) {
        context.beginPath();
        spwUtils.renderSinglePolygon(context, ring, width, height);

        // var rgba1 = spwUtils.squareSampleImage(imageData, p1[0], p1[1], 3, width);
        // var rgba2 = spwUtils.squareSampleImage(imageData, p2[0], p2[1], 3, width);
        var rgba1 = 'rgba(0,0,0,0.7)';
        var rgba2 = 'rgba(0,0,0,0.3)';
        var rgba3 = 'rgba(0,0,0,0)';
        var rgba4 = 'rgba(255,255,255,0.1)';
        var rgba5 = 'rgba(255,255,255,0.1)';
        // var randomOpa = Math.random()-0.7;
        // rgba1.opacity = randomOpa;
        // rgba2.opacity = randomOpa;
        // var grd=context.createLinearGradient(ring[0][0],ring[0][1],ring[0][0],ring[0][1]);
        // var grd=context.createLinearGradient(0,0,width,height);
        // grd.addColorStop(0,rgba1 + "");
        // grd.addColorStop(0.3,rgba2 + "");
        // grd.addColorStop(0.6,rgba3 + "");
        // grd.addColorStop(0.98,rgba4 + "");
        // grd.addColorStop(1,rgba5 + "");
        // context.fillStyle=grd;
        context.fillStyle = "rgba(255,255,255,0.7)";
        context.fill();
        context.lineWidth = 1.5;
        context.lineJoin = "miter";
        // context.strokeStyle = "rgba(255,0,0,1)";
        context.strokeStyle = "rgba(255,255,255,1)";
        context.stroke();
        context.closePath();
      })
    });
    
    // context.beginPath();
    // spwUtils.renderMultiPolygon(context, that.geoMerge, width, height);
    // // context.fillStyle = "rgba(255,0,0,0.1)";
    // context.fillStyle = "rgba(255,255,255,0.8)";
    // context.fill();
    // context.lineWidth = 1.5;
    // context.lineJoin = "miter";
    // // context.strokeStyle = "rgba(255,0,0,1)";
    // context.strokeStyle = "rgba(255,255,255,1)";
    // context.stroke();
    // context.closePath();

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
    var width = that.width;
    var height = that.height;
    var context = that.context;
    var samples = that.voronoiArr[0].samples;
    var voronoi = that.voronoiArr[0].voronoi;
    var vertices = that.voronoiArr[0].vertices;
    var polygons = that.voronoiArr[0].polygons;
    var triangles = that.voronoiArr[0].triangles;
    var links = that.voronoiArr[0].links;
    var imageData = that.imageData;
    var width = that.width;
    var height = that.height;

    // for (var i = 0, n = polygons.length; i < n; ++i){
    //   context.beginPath();

    //   x = Math.floor(polygons[i].data[0]),
    //   y = Math.floor(polygons[i].data[1]);

    //   // context.fillStyle = pointSampleImage(imageData, x, y) + "";
    //   // console.log(squareSampleImage(imageData, x, y, 3));

    //   var rgba = spwUtils.squareSampleImage(imageData, x, y, 3, width);
    //   // if(typeof samples[i].mouseup !== 'undefined'){
    //   //   // rgba.opacity = samples[i][2];
    //   //   rgba.opacity = 0.5;
    //   // }else{
    //   //   rgba.opacity = 0.8;
    //   // };

    //   context.fillStyle =  rgba + "";

    //   if(typeof polygons[i] !== 'undefined' && typeof polygons[i].background !== 'undefined'){
    //     context.fillStyle =  polygons[i].background;
    //     // that.meltTriArrs = [];
    //     polygons[i].forEach(function(pp,ii){
    //       that.meltTriArrs.push([(pp[0]),(pp[1])]);
    //     });
        
    //     delete polygons[i].background;
    //   }
    //   that.drawCell(polygons[i]);
    //   context.strokeStyle =  "#fff";
    //   context.stroke();
    //   context.fill();
    //   context.closePath();
    // };

    var alpha = 200;
    var asq = alpha*alpha;
    function dsq(a,b) {
        var dx = a[0]-b[0], dy = a[1]-b[1];
        return dx*dx+dy*dy;
    };
    function offset(a,dx,dy) {
          return a.map(function(d) { return [d[0]+dx,d[1]+dy]; });
    };
    // console.log('that.meltTriArrs.length : ' + that.meltTriArrs.length);
    var triangles = voronoi(samples.filter(function(s, i) {
      if(typeof s.musics !== 'undefined'){
        samples.splice(i,1);
      };
      return typeof s.melting !== 'undefined';
    })).triangles().filter(function(t, i) {
        // console.log(t);
        // console.log(i);
        // if(typeof t[0].melting !== 'undefined' && typeof polygons[i].background !== 'undefined'){

        // }
        var evaluated = dsq(t[0],t[1]) < asq && dsq(t[0],t[2]) < asq && dsq(t[1],t[2]) < asq;
        return evaluated;
    });
    
    // triangles
    for (var i = 0, n = triangles.length; i < n; ++i){

      
      context.beginPath();
      that.drawCell(triangles[i]);

      // var maxMeltPoint = d3.max(triangles[i], function(t) { return t.melting; });
      // var minMeltPoint = d3.min(triangles[i], function(t) { return t.melting; });
      // console.log('maxMeltPoint : ' + maxMeltPoint);
      // console.log('minMeltPoint : ' + minMeltPoint);
      // var rgba1 = spwUtils.squareSampleImage(imageData, triangles[i][0][0], triangles[i][0][1], 3, width);
      // var rgba2 = spwUtils.squareSampleImage(imageData, triangles[i][1][0], triangles[i][1][1], 3, width);
      // var rgba2 = 'rgba(255,255,255,1)';
      // var randomOpa = Math.random()-0.7;
      // // rgba1.opacity = 1;
      // // rgba2.opacity = 1;
      // var grd=context.createLinearGradient(triangles[i][0][0],triangles[i][0][1],triangles[i][1][0],triangles[i][1][1]);
      // var grd=context.createLinearGradient(0,0,width,height);

      // grd.addColorStop(0,rgba1 + "");
      // grd.addColorStop(0.7,rgba2 + "");
      // // grd.addColorStop(0.6,rgba3 + "");
      // // grd.addColorStop(0.98,rgba4 + "");
      // // grd.addColorStop(1,rgba5 + "");
      // context.fillStyle=grd;

      var meltingAver = (triangles[i][0].melting + triangles[i][1].melting + triangles[i][2].melting) / 3;
      context.fillStyle =  "rgba(255,255,255,"+(1-meltingAver)+")";
      // if(typeof polygons[i] !== 'undefined' && typeof polygons[i].background !== 'undefined'){
      //   context.fillStyle =  polygons[i].background;
      //   delete polygons[i].background;
      // }
      context.strokeStyle =  "rgba(0,0,0,0."+(1-meltingAver)+")";
      // context.stroke();
      context.fill();
      context.closePath();
    };





    var triangles2 = voronoi(samples.filter(function(s, i) {
      // return typeof s.melting === 'undefined';
      return true;
    })).triangles().filter(function(t, i) {
        return true;
        // var evaluated = dsq(t[0],t[1]) < asq && dsq(t[0],t[2]) < asq && dsq(t[1],t[2]) < asq;
        // return evaluated;
    });

    for (var i = 0, n = triangles2.length; i < n; ++i){
      context.beginPath();
      that.drawCell(triangles2[i]);
      var opacity = 1;
      if(typeof triangles2[i][0].melting !== 'undefined' && typeof triangles2[i][1].melting !== 'undefined' && typeof triangles2[i][2].melting !== 'undefined'){
        var meltingAver = (triangles2[i][0].melting + triangles2[i][1].melting + triangles2[i][2].melting) / 3;
        opacity = 1 - meltingAver;
      };
      context.fillStyle =  "rgba(255,255,255,"+opacity+")";
      context.strokeStyle =  "rgba(255,255,255,"+opacity+")";
      context.stroke();
      context.fill();
      context.closePath();
    };

    // // 링크
    // context.beginPath();
    // for (var i = 0, n = links.length; i < n; ++i) that.drawLink(links[i]);
    // context.strokeStyle = "#fff";
    // context.stroke();

    //사이트
    // context.beginPath();
    // for (var i = 0, n = samples.length; i < n; ++i){
    //   // if(typeof samples[i].melting !== 'undefined'){
    //   //   context.font = "20px Arial";
    //   //   context.fillStyle = "#fff";
    //   //   context.fillText(samples[i].melting,samples[i][0],samples[i][1]);
    //     that.drawSite(samples[i])
    //   // }
    // };
    // context.fillStyle = "black";
    // context.fill();
    // context.strokeStyle = "yellow";
    // context.stroke();
    // context.closePath();

  },
  startVoronoi : function(){
    // console.log('startVoronoi');
    this.startEqulizer();
    this.meltRandom();
    // this.drawCircles();

    
    // this.drawInnerCircle();
    // this.drawInnerLine();
    // this.drawTopology();
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
        samples[i].melting = 0.9;
      };
      
      

      if(type === 'meltrandom'){
        polygons[i].melting = Math.random() * 0.01;
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

window.onload = function(){
  // var playButton = document.getElementById('play_spring_waltz');
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
