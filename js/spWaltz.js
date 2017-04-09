// window.onerror = function(msg, url, linenumber) {
//     alert('Error message: '+msg+'\nURL: '+url+'\nLine Number: '+linenumber);
//     return true;
// }


var _checkMobile = (function () {
   var check = false;
   (function (a) {
       if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true
   })(navigator.userAgent || navigator.vendor || window.opera);
   return check;
})();

var _checkVendor = (function(){
  var vendor = "";
  var styles = window.getComputedStyle(document.documentElement, '');
  vendor = (Array.prototype.slice.call(styles).join('').match(/-(moz|webkit|ms)-/) || (styles.OLink === '' && ['', 'o']))[1];
  if (vendor == "moz") vendor = "Moz";
  return vendor;
})();

var spwDraw = spwDraw || {
  context : [],
  drawImageProp : function(ctx, img, x, y, w, h, offsetX, offsetY) {
    if (arguments.length === 2) {
        x = y = 0;
        w = ctx.canvas.width;
        h = ctx.canvas.height;
    }

    // default offset is center
    offsetX = typeof offsetX === "number" ? offsetX : 0.5;
    offsetY = typeof offsetY === "number" ? offsetY : 0.5;

    // keep bounds [0.0, 1.0]
    if (offsetX < 0) offsetX = 0;
    if (offsetY < 0) offsetY = 0;
    if (offsetX > 1) offsetX = 1;
    if (offsetY > 1) offsetY = 1;

    var iw = img.width,
        ih = img.height,
        r = Math.min(w / iw, h / ih),
        nw = iw * r,   // new prop. width
        nh = ih * r,   // new prop. height
        cx, cy, cw, ch, ar = 1;

    // decide which gap to fill    
    if (nw < w) ar = w / nw;                             
    if (Math.abs(ar - 1) < 1e-14 && nh < h) ar = h / nh;  // updated
    nw *= ar;
    nh *= ar;

    // calc source rectangle
    cw = iw / (nw / w);
    ch = ih / (nh / h);

    cx = (iw - cw) * offsetX;
    cy = (ih - ch) * offsetY;

    // make sure source rectangle is valid
    if (cx < 0) cx = 0;
    if (cy < 0) cy = 0;
    if (cw > iw) cw = iw;
    if (ch > ih) ch = ih;

    // fill image in dest. rectangle
    ctx.drawImage(img, cx, cy, cw, ch,  x, y, w, h);
  },
  drawSite:function(site) {
    this.context.moveTo(site[0] + 2.5, site[1]);
    this.context.arc(site[0], site[1], 2.5, 0, 2 * Math.PI, false);
  },
  drawLink:function(link) {
    this.context.moveTo(link.source[0], link.source[1]);
    this.context.lineTo(link.target[0], link.target[1]);
  },
  drawCell:function(cell) {
    if (!cell) return false;
    this.context.moveTo(cell[0][0], cell[0][1]);
    for (var j = 1, m = cell.length; j < m; j++) {
      this.context.lineTo(cell[j][0], cell[j][1]);
    };
    return true;
  },
}

var spwVoronoi = function(w, h, sampleType, playBtnRadius = 0){
  var _this = this;
  _this.w = w,
  _this.h = h,
  _this.type = sampleType,
  _this.samples,
  _this.voronoi,
  _this.diagram,
  _this.links,
  _this.polygons,
  _this.triangles;
  _this.triPlayIndex = null;

  _this.make = function(){
    _this.voronoi = d3.voronoi().extent([[-100, -100], [w+100, h+100]]);
    _this.diagram = _this.voronoi(_this.samples);
    _this.links = _this.diagram.links();
    _this.polygons = _this.diagram.polygons();
    _this.triangles = _this.diagram.triangles().filter(function(t, i) {
        if(_this.triPlayIndex === null 
          && typeof t[0].playbtn !== 'undefined' 
          && typeof t[1].playbtn !== 'undefined'
          && typeof t[1].playbtn !== 'undefined'){
          _this.triPlayIndex = i;
        };
        // var evaluated = that.dsq(t[0],t[1]) < asq && that.dsq(t[0],t[2]) < asq && that.dsq(t[1],t[2]) < asq;
        // return evaluated;
        return true;
    });
  };
  _this.resample = function(type){
    
    _this.type = type;
    _this.samples = sampleing(_this.w, _this.h, _this.type);
    _this.make();
  }
  _this.meltAtPos = function(x, y, radius, meltRatio){
    var diagram = _this.diagram;
    var polygons = _this.polygons;
    var samples = _this.samples;
    var i, next = _this.diagram.find.found || Math.floor(Math.random() * _this.diagram.cells.length);
    var cell = _this.diagram.cells[next] || _this.diagram.cells[next=0];
    var dx = x - cell.site[0], 
        dy = y - cell.site[1],
        dist = dx*dx + dy*dy;

    var result = {
      around : []
    };

    do {
      cell = diagram.cells[i=next];
      next = null;
      // polygons[i].background = 'orange';

      samples[i].melting += meltRatio * 0.05;
      
      cell.halfedges.forEach(function(e) {
        var edge = diagram.edges[e];
        var ea = edge.left;
        if (ea === cell.site || !ea) {
          ea = edge.right;
        }
        if (ea){
          
          // if( polygons[ea.index].background != 'orange'){
          //   polygons[ea.index].background = 'green';
          //   result.around.push(ea.index); 
          // };
          samples[ea.index].melting += meltRatio;
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

    _this.diagram.find.found = i;
    result.find = i;
    result.cell = cell;
    if (!radius || dist < radius * radius) return result;
  }

  function addOutsideSampleing(samples){
    var defMelt = 0;
    var wSideDotNum = parseInt(w / 10);
    var hSideDotNum = parseInt(h / 10);
    var dotsW = w / wSideDotNum;
    var dotsH = h / hSideDotNum;
    for(var i = 0; i <= wSideDotNum; i++){
      var wsd = [dotsW*i, 0];
      var wsh = [dotsW*i, h];
      wsd.melting = defMelt;
      wsh.melting = defMelt;
      samples.push(wsd);
      samples.push(wsh);
    };
    for(var i = 1; i <= hSideDotNum; i++){
      var wsd = [0, dotsH*i];
      var wsh = [w, dotsH*i];
      wsd.melting = defMelt;
      wsh.melting = defMelt;
      samples.push(wsd);
      samples.push(wsh);
    };
    return samples;
  }
  function sampleing(w, h, sampleType){
    _this.triPlayIndex = null;
    var defMelt = 0;
    var samples = [],
        sample, s;

    if(sampleType === 'poisson'){
      // var playBtnRadius = 30;
      var limitDistance = playBtnRadius*1.5;
      var cen = [w/2, h/2];
      var playBtnSample = [
        [cen[0] - playBtnRadius, cen[1] - playBtnRadius],
        [cen[0] - playBtnRadius, cen[1] + playBtnRadius],
        [cen[0] + playBtnRadius, cen[1]]
      ];
      // var playBtnSample = [
      //   [cen[0] , cen[1] ],
      //   [cen[0] - playBtnRadius, cen[1]],
      //   [cen[0] + playBtnRadius, cen[1] + playBtnRadius],
      //   [cen[0] + playBtnRadius, cen[1] - playBtnRadius],
      //   // [cen[0] - playBtnRadius/5, cen[1] + playBtnRadius*1.5],
      //   // [cen[0] - playBtnRadius/5, cen[1] - playBtnRadius*1.5],
      // ];
      playBtnSample.forEach(function(pb, i){
        pb.melting = defMelt;
        pb.playbtn = true;
        samples.push(pb);
      });

      sample = spwUtils.poissonDiscSampler(w, h, limitDistance, playBtnRadius);
      while (s = sample()) {
        s.melting = defMelt;
        samples.push(s);
      }

      samples = addOutsideSampleing(samples);
    }else if(sampleType === 'random'){
      var sampleNum = 300;
      samples = d3.range(sampleNum).map(function(d, a, b, c, d) { 
        var samp = [Math.floor(Math.random() * (w + 1)), Math.floor(Math.random() * (h + 1))];
        samp.melting = 0;
        return samp; 
      });
      // samples = d3.range(300).map(function(d) {

      //   var endBoxW, endBoxH, xLimit, yLimit;
      //   ((w * 0.8) > 500) ? endBoxW = 500 : endBoxW = w * 0.8;
      //   ((h * 0.5) > 300) ? endBoxH = 300 : endBoxH = h * 0.5;
      //   var limitW = (w - endBoxW) / 2;
      //   var limitH = (h - endBoxH) / 2;
      //   (Math.random()>.5) ? xLimit = [0,limitW] : xLimit = [(limitW+endBoxW), w];
        

      //   var xRan, yRan;
      //   if(Math.random()>.5){
      //     xRan = d3.randomUniform(0, w)();
      //     (Math.random()>.5) ? yRan = d3.randomUniform(0,limitH)() : yRan = d3.randomUniform((limitH+endBoxH), h)();
      //   }else{
      //     yRan = d3.randomUniform(0, h)();
      //     (Math.random()>.5) ? xRan = d3.randomUniform(0,limitW)() : xRan = d3.randomUniform((limitW+endBoxW), w)();
      //   };
      //   return [xRan, yRan]; 
      // });
      // samples.push([w/2, h/2]);

    }else if(sampleType === 'ending'){

      // samples = d3.range(num).map(function(d) { return [Math.floor(Math.random() * (w + 1)), Math.floor(Math.random() * (h + 1))]; });
      // var cen = [w/2, h/2];
      // samples.push(cen);
    }else if(sampleType === 'replay'){
      samples = addOutsideSampleing(_this.samples);
    }
    return samples;
  };
  function init(){
    _this.samples = sampleing(_this.w, _this.h, _this.type);
    _this.make();
  };

  init();
  return _this;
};

var springWaltz = springWaltz || function(w, h, ctx, back, audio){

  var spwVo,
      _spUrl = 'http://springwaltz.taejaehan.com',
      _width = w,
      _height = h,
      _canvasCen = [w/2, h/2],
      _backRes = back,
      _audioVis = audio,
      _analyser = '',
      _context = ctx,
      _imageData = _context.getImageData(0, 0, _width, _height),
      _loadAngle = 0;
      STAGE_INIT = 0,
      STAGE_READY = 1,
      STAGE_FREEZE = 2,
      STAGE_PLAYING = 3,
      STAGE_ENDING = 4,
      _stageStatus = STAGE_INIT,  //0 init, 1 ready, 2 playing, 3 done
      _playBtnRadius = (_width*0.1) > 60 ? 60 : _width*0.1,
      _fNow = 0,
      _fThen = Date.now(),
      _fps = 60,                  /* 60 ms */
      _fInterval = (1000/_fps),   //frame rate
      _fDelta = 0,
      _freezeTime = 4000,
      _freezeRatio = 1 / (_fps * (_freezeTime / 1000)),
      _meltRatio = {
        'mousemove' : 0.01,
        'mousedown' : 0.03,
        'mouseup' : 0.05,
        'mousehold' : 0.1,
      },
      _replayRadi = 18,
      _replayMarginBottom = 60,
      _diagFind = [],
      _audioData = [],
      _curMouse = [],
      _curMouseEvent = 'mousemove',
      _averageMeting = 0,
      _iconW = _iconH = _width/10 > 40 ? 40 : _width/10,
      _snsImg = new Image,
      _snsImg.src = 'resources/imgs/sns.png',
      _fbPos = [ _width - _iconW * 1.5, 10],
      _twPos = [ _width - _iconW * 2.8, 10],
      _fbPosCen = [ (_fbPos[0] + _iconW/2), (_fbPos[1] + _iconH/2)],
      _twPosCen = [ (_twPos[0] + _iconW/2), (_twPos[1] + _iconH/2)];
      _authorLinkSize = [110 , 30];

  function setup(){

  }
  // function audioUpdate(){
  //   var perAngle = 360 / _audioData.length;
  //   _audioData.forEach(function(b, i){
  //       spwVo.samples.push([
  //         _curMouse[0] + Math.sin(perAngle*i) * (b*5)
  //         ,_curMouse[1] + Math.cos(perAngle*i) * (b*5)
  //       ]);
  //       var mel = 0.5;
  //       if(_curMouseEvent === 'mousehold'){
  //         mel = 0.8;
  //       }
  //       spwVo.samples[spwVo.samples.length - 1].melting = mel;
  //       spwVo.samples[spwVo.samples.length - 1].musics = true;
  //   });
  // }
  function audioUpdate(){
    var uintFrequencyData = new Uint8Array(_analyser.frequencyBinCount);
    // var timeFrequencyData = new Uint8Array(_analyser.fftSize);
    // app.animationFrame = (window.requestAnimationFrame || window.webkitRequestAnimationFrame)(app.animate);
    // stats.begin();
    var array = _analyser.getByteFrequencyData(uintFrequencyData);
    // _analyser.getByteTimeDomainData(timeFrequencyData);
    var step = Math.round(uintFrequencyData.length / 60);
    var perAngle = 360 / step;
    for (var i = 0; i <= 60; i++){
      var value = uintFrequencyData[i * step] / 4;
      // console.log('value : ' + value);
      // particle = particles[i++];
      // particle.position.y = (uintFrequencyData[i] + 80);
      // particle.material.color.setRGB(1,1 - uintFrequencyData[i]/255,1);
      particle = spwVo.samples[i++];
      particle[0] = _curMouse[0] + Math.sin(perAngle*i) * (value*5);
      particle[1] = _curMouse[1] + Math.cos(perAngle*i) * (value*5);
      var mel = 0.5;
      if(_curMouseEvent === 'mousehold'){
        mel = 0.8;
      }
      particle.melting = mel;
      // particle.musics = true;
    }
    
    // _audioData.forEach(function(b, i){
    //     spwVo.samples.push([
    //       _curMouse[0] + Math.sin(perAngle*i) * (b*5)
    //       ,_curMouse[1] + Math.cos(perAngle*i) * (b*5)
    //     ]);
    //     var mel = 0.5;
    //     if(_curMouseEvent === 'mousehold'){
    //       mel = 0.8;
    //     }
    //     spwVo.samples[spwVo.samples.length - 1].melting = mel;
    //     spwVo.samples[spwVo.samples.length - 1].musics = true;
    // });
    // for (var j = 0; j <= 2048; j++){
    //   console.log('timeFrequencyData[j] : ' + timeFrequencyData[j]);
    //     // particle2 = particles2[j++];
    //     // particle2.position.y = (timeFrequencyData[j]/1.5 - 85);
    //     // particle2.material.color.setRGB(1,1 - timeFrequencyData[j]/375,1);
    // }
    // for (var k = 0; k <= 1024; k++){
    //   console.log('uintFrequencyData[k] : ' + uintFrequencyData[k]);
    //     // particle3 = particles3[k++];
    //     // particle3.position.y = -(uintFrequencyData[k] + 80);
    //     // particle3.material.color.setRGB(1,1 - (uintFrequencyData[k]/255),1);
    // }
    // _audioVis.node.onaudioprocess = function () {
    //     var array = new Uint8Array(_audioVis.analyser.frequencyBinCount);
    //     _audioVis.analyser.getByteFrequencyData(array);
    //     var step = Math.round(array.length / _audioVis.numberOfBars);

    //     //Iterate through the bars and scale the z axis
    //     for (var i = 0; i < _audioVis.numberOfBars; i++) {
    //         var value = array[i * step] / 4;
    //         _audioData[i] = value;
    //     }
    // }
  }
  function update(){
    window.requestAnimationFrame(update);
    
    _fNow = Date.now();
    _fDelta = _fNow - _fThen;
    if (_fDelta > _fInterval) {
      if(_backRes.currentTime !== 0){
        _fThen = _fNow - (_fDelta % _fInterval);
        if(_stageStatus === STAGE_PLAYING){
          _diagFind = spwVo.meltAtPos(_curMouse[0],_curMouse[1],50,_meltRatio['mousemove']);
          audioUpdate();
        };
        draw();
      }
    };
  };

  function drawLoading(){
    var loadCircle = _playBtnRadius/3;
    var loadCenter = [_canvasCen[0] - (_playBtnRadius/3), _canvasCen[1]];
    var loadColor = "gray";
    _loadAngle += 0.1;

    _context.beginPath();
    _context.fillStyle =  loadColor;
    _context.lineWidth = 3;
    spwDraw.drawCell(spwVo.triangles[spwVo.triPlayIndex]);
    _context.stroke();
    _context.fill();
    _context.closePath();

    _context.beginPath();
    _context.arc(loadCenter[0], loadCenter[1], loadCircle, 0, 2 * Math.PI, false);
    _context.strokeStyle =  "rgba(255,255,255,1)";
    _context.stroke();
    _context.closePath();

    _context.beginPath();
    _context.arc(loadCenter[0] + Math.sin(_loadAngle) * loadCircle, loadCenter[1] + Math.cos(_loadAngle) * loadCircle, 3, 0, 2 * Math.PI, false);
    _context.fillStyle =  loadColor;
    _context.fill();
    _context.closePath();
  }
  function drawReady(){

    _context.beginPath();
    var cen = spwUtils.getCenterAll(spwVo.triangles[spwVo.triPlayIndex]);
    var x = Math.floor(cen[0]);
    var y = Math.floor(cen[1]);
    var rgba = spwUtils.squareSampleImage(_imageData, x, y, 3, _width);
    rgba.opacity = 1;
    _context.fillStyle = rgba + "";
    _context.strokeStyle =  "rgba(255,255,255,0.8)";
    spwDraw.drawCell(spwVo.triangles[spwVo.triPlayIndex]);
    _context.stroke();
    _context.fill();
    _context.closePath();

    // spwVo.triangles.forEach(function(t, i){
    //   _context.beginPath();
    //   var cen = spwUtils.getCenterAll(t);
    //   var x = Math.floor(cen[0]);
    //   var y = Math.floor(cen[1]);
    //   var rgba = spwUtils.squareSampleImage(_imageData, x, y, 3, _width);
    //   rgba.opacity = 0.6;
    //   _context.fillStyle = rgba + "";
    //   if(i === spwVo.triPlayIndex){
    //     rgba.opacity = 0.9;
    //     _context.fillStyle =  "red";
    //   }
    //   _context.strokeStyle =  "rgba(255,255,255,0)";
    //   spwDraw.drawCell(t);
    //   _context.stroke();
    //   _context.fill();
    //   _context.closePath();
    // });
  }
  function draw(){
    spwDraw.drawImageProp(_context, _backRes, 0, 0, _width, _height);
    _imageData = _context.getImageData(0, 0, _width, _height);

    console.log('draw _stageStatus : '  + _stageStatus);
    if(_stageStatus === STAGE_INIT){
      drawLoading();
    }else if(_stageStatus === STAGE_READY){
      drawReady();
    }else{
      if(_stageStatus === STAGE_FREEZE){
        if(spwVo.triPlayIndex !== null){
          var cen = spwUtils.getCenterAll(spwVo.triangles[spwVo.triPlayIndex]);
          var x = Math.floor(cen[0]);
          var y = Math.floor(cen[1]);
          var rgba = spwUtils.squareSampleImage(_imageData, x, y, 3, _width);
          _context.beginPath();
          _context.fillStyle = rgba;
          _context.strokeStyle =  "rgba(255,255,255,1)";
          spwDraw.drawCell(spwVo.triangles[spwVo.triPlayIndex]);
          _context.stroke();
          _context.fill();
          _context.closePath();
          // if(Math.random() < .1){
          //   _freezeRatio += _freezeRatio;
          // }
        }
      }else{
        
        // console.log('_audioVis.audioContext.currentTime : ' + _audioVis.audioContext.currentTime);
        // console.log('_audioVis.sourceBuffer.buffer.duration : ' + _audioVis.sourceBuffer.buffer.duration);
        // if(_audioVis.audioContext.currentTime > _audioVis.sourceBuffer.buffer.duration ){
        //   if(_stageStatus !== STAGE_ENDING){
        //     spwVo.resample('random');
        //   }
        //   drawEnding();
        // }
        spwVo.triangles = spwVo.voronoi(spwVo.samples.filter(function(s, i) {
          if(typeof s.musics !== 'undefined'){
            spwVo.samples.splice(i,1);
          };
          return typeof s.melting !== 'undefined';
        })).triangles();
      }
      
      console.log('_averageMeting : ' + _averageMeting);
      if(_averageMeting < 0.25){

        // spwVo.polygons.forEach(function(p, i){
        //   _context.beginPath();
        //   if(typeof p === 'undefined' || typeof p.data === 'undefined' ){
          
        //   }else{
        //     x = Math.floor(p.data[0]),
        //     y = Math.floor(p.data[1]);
        //   }
        //   if(i > 0){
        //     var rgba = spwUtils.squareSampleImage(_imageData, x, y, 3, _width);
        //     rgba.opacity = 1;
        //     _context.fillStyle =  rgba + "";
        //   }else{
        //     _context.fillStyle =  "red";
        //   }
          
        //   spwDraw.drawCell(p);
        //   _context.fill();
        //   _context.closePath();
        // });

        var totalMelting = 0;
        spwVo.triangles.forEach(function(t, i){
          
          _context.beginPath();
          var cen = spwUtils.getCenterAll(t);
          var x = Math.floor(cen[0]);
          var y = Math.floor(cen[1]);
          var rgba = spwUtils.squareSampleImage(_imageData, x, y, 3, _width);
          // rgba.r = '255';
          // rgba.g = '255';
          // rgba.b = '255';
          
          if(_stageStatus === STAGE_FREEZE){
            
            if(typeof t.opacity === 'undefined'){
              t.opacity = _freezeRatio;
            }else{
              if(!(i % Math.floor(Math.random()* 5) + 1)){
                if(t.opacity < 1){
                  t.opacity += t.opacity;
                }
              }
            }
          }
          
          if(_stageStatus === STAGE_PLAYING){
            var meltingAver = (t[0].melting + t[1].melting + t[2].melting) / 3;
            meltingAver > 1 ? meltingAver = 1 : meltingAver = meltingAver;
            t.opacity = 1 - meltingAver;
            totalMelting += meltingAver;
          };

          rgba.opacity = t.opacity;
          _context.fillStyle = rgba + "";
          _context.strokeStyle =  "rgba(255,255,255,0)";
          spwDraw.drawCell(t);
          _context.stroke();
          _context.fill();
          _context.closePath();
        });
        _averageMeting = totalMelting / spwVo.triangles.length;
        // console.log('_averageMeting : ' + _averageMeting);
      }else{
        if(_stageStatus !== STAGE_ENDING){
          spwVo.resample('random');
        }
        drawEnding();
      }
    }
   

    // 사이트
    // spwVo.samples.forEach(function(s, i){
    //   _context.beginPath();
    //   spwDraw.drawSite(s);
    //   if(typeof s.playbtn === 'undefined'){
    //     _context.fillStyle = "black";
    //     _context.strokeStyle = "yellow";
    //   }else{
    //     _context.fillStyle = "red";
    //     _context.strokeStyle = "white";
    //   }
    //   _context.font = "15px Julius Sans One,sans-serif, Arial";
    //   _context.fillStyle = 'red';
    //   _context.textAlign = 'center';
    //   _context.fillText(i,s[0],s[1]);

    //   _context.fill();
    //   _context.stroke();
    //   _context.closePath();
    // });

    // if(_stageStatus === STAGE_PLAYING){
    //   startMelt();
    // }else if(_stageStatus === STAGE_INIT || _stageStatus === STAGE_READY){
    //   startFreeze();
    // }else if(_stageStatus === STAGE_ENDING){

    // };
  }
  function drawEnding(){

    

    var topology = spwUtils.computeTopology(spwVo.voronoi(spwVo.samples));
    var geo = topology.objects.voronoi.geometries;
    var limitX = _width * 0.1;
    var limitY = _height * 0.25;
    var nextPolygons = [];
    var geoMerge = topojson.merge(topology, geo.filter(function(d, i) { 
      var x = d.data[0];
      var y = d.data[1];
      var endingBox = ( x > limitX && x < (_width - limitX) && y > limitY && y < (_height - limitY));
      // if(!endingBox){
      //     nextPolygons.push([d.cellIndex, spwUtils.getDistance([_width/2,_height/2], [x,y])]);
      // };
      return endingBox;
    }));

    nextPolygons.sort(function(a, b) {
        return a[1] - b[1];
    });

    //polygones
    spwVo.polygons.forEach(function(p, i){
      
      if(typeof p === 'undefined' || typeof p.data === 'undefined' ){
      
      }else{
        x = Math.floor(p.data[0]),
        y = Math.floor(p.data[1]);
      }

      _context.beginPath();
      var rgba = spwUtils.squareSampleImage(_imageData, x, y, 3, _width);
      rgba.opacity = 0.6;
      _context.fillStyle =  rgba + "";
      spwDraw.drawCell(p);
      _context.fill();
      _context.closePath();

      
      // _context.drawImage(_snsImg, -5,0,90,100, _fbPos[0], _fbPos[1], _iconW, _iconH);
      // _context.drawImage(_snsImg, 95,0,90,100, _twPos[0], _twPos[1], _iconW, _iconH);
      // if(nextPolygons[0][0] === i){
      //   // _context.fillStyle =  "red";
      //   var pos = spwVo.samples[i];
      //   _context.drawImage(_snsImg, pos[0] - _iconW/2, pos[1] - _iconH/2, _iconW, _iconH);
      // }else if(nextPolygons[10][0] === i){
      //   var pos = spwVo.samples[i];
      //   _context.drawImage(_snsImg, pos[0] - _iconW/2, pos[1] - _iconH/2, _iconW, _iconH);
      // }
      
    });

    // spwVo.samples.forEach(function(s, i){
    //   _context.beginPath();
    //   spwDraw.drawSite(s);
    //   if(typeof s.playbtn === 'undefined'){
    //     _context.fillStyle = "black";
    //     _context.strokeStyle = "yellow";
    //   }else{
    //     _context.fillStyle = "red";
    //     _context.strokeStyle = "white";
    //   }
    //   // _context.font = "15px Julius Sans One,sans-serif, Arial";
    //   // _context.fillStyle = 'red';
    //   // _context.textAlign = 'center';
    //   // _context.fillText(i,s[0],s[1]);

    //   _context.fill();
    //   _context.stroke();
    //   _context.closePath();
    // });

    geoMerge.coordinates.forEach(function(polygon) {
      polygon.forEach(function(ring, i) {
        _context.beginPath();
        spwUtils.renderSinglePolygon(_context, ring, _width, _height);
        _context.fillStyle = "rgba(255,255,255,0.7)";
        _context.lineWidth = 1.5;
        _context.lineJoin = "miter";
        _context.strokeStyle = "rgba(255,255,255,1)";
        _context.fill();
        _context.stroke();
        _context.closePath();


        var cen = [_width/2, _height/2 - _replayMarginBottom];
        var triRadi = _replayRadi/6;
        _context.beginPath();
        _context.arc(cen[0], cen[1], _replayRadi, 0, 1.5 * Math.PI, false);
        _context.lineWidth = _replayRadi/5 > 6 ? 6 : _replayRadi/5;
        _context.strokeStyle = "#999";
        _context.stroke();
        _context.closePath();

        _context.beginPath();
        _context.moveTo(cen[0] , cen[1] - _replayRadi - triRadi);
        _context.lineTo(cen[0] , cen[1] - _replayRadi + triRadi);
        _context.lineTo(cen[0] + triRadi * 2 , cen[1] - _replayRadi);
        _context.moveTo(cen[0] - triRadi, cen[1] - triRadi * 2);
        _context.lineTo(cen[0] - triRadi, cen[1] + triRadi * 2);
        _context.lineTo(cen[0] + triRadi * 3 , cen[1]);
        _context.fillStyle = "#999";
        _context.fill();
        _context.closePath();

        _imageData = _context.getImageData(0, 0, _width, _height);
        var avrRgb = spwUtils.getAverageColourAsRGB(_imageData.data);
        _context.font = "23px Julius Sans One,sans-serif, Arial";
        _context.fillStyle = avrRgb + '';
        _context.textAlign = 'center';
        _context.fillText('Voices Of Spring Waltz',_width/2,_height/2);
        // _context.font = "16px Julius Sans One,sans-serif, Arial";
        // _context.fillText('- Johann Strauss Jr.',_width/2,_height/2 + 23);

        _context.font = "16px Julius Sans One,sans-serif, Arial";
        _context.beginPath();
        _context.fillText('by Taejae Han',_width/2,_height/2 + 25);
        _context.moveTo(_width/2 - _authorLinkSize[0]/2 ,_height/2+ _authorLinkSize[1]);
        _context.lineTo(_width/2 + _authorLinkSize[0]/2,_height/2+ _authorLinkSize[1]);
        _context.lineWidth = 1;
        _context.strokeStyle = avrRgb + '';
        _context.stroke();
        _context.closePath();

      })
    });
    _stageStatus = STAGE_ENDING;
  }
  
  
  function audioInit(){
    _audioVis = document.getElementById('theAudio');
    if(/Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor)){
      setTimeout(function(){
        audioLoaded();
      }, 3000);
    }else{
      if(typeof _audioVis.readyState !== 'undefined' && _audioVis.readyState > 3 ) {
        console.log('audio ready');
        audioLoaded();
      }else{
        _audioVis.addEventListener('loadeddata', function() {
          alert('loadeddata');
          // audioLoaded();
        }, false);
        _audioVis.addEventListener('canplay', function() {
          alert('canplay');
          // audioLoaded();
        }, false);
        _audioVis.addEventListener('canplaythrough', function() {
          alert('canplaythrough');
          audioLoaded();
        }, false);

      };
    }
    
    
  };
  function audioLoaded(){
    _stageStatus = STAGE_READY;

    _audioVis.ctx = new (window.AudioContext || window.webkitAudioContext)(); // creates audioNode
    var source = _audioVis.ctx.createMediaElementSource(_audioVis); // creates audio source
    _analyser = _audioVis.ctx.createAnalyser(); // creates analyserNode
    source.connect(_audioVis.ctx.destination); // connects the audioNode to the audioDestinationNode (computer speakers)
    source.connect(_analyser); // connects the analyser node to the audioNode and the audioDestinationNode

    // _audioVis.node.onaudioprocess = function () {
    //     var array = new Uint8Array(_audioVis.analyser.frequencyBinCount);
    //     _audioVis.analyser.getByteFrequencyData(array);
    //     var step = Math.round(array.length / _audioVis.numberOfBars);

    //     //Iterate through the bars and scale the z axis
    //     for (var i = 0; i < _audioVis.numberOfBars; i++) {
    //         var value = array[i * step] / 4;
    //         _audioData[i] = value;
    //     }
    // }
  }
  function startAudio(){
    // _this.audioVis.play();
    _audioVis.play();
    // _audioVis.start ? _audioVis.start(_audioVis.request.response) : _audioVis.noteOn(_audioVis.request.response);
    setTimeout(function(){
      animationPlay();
    }, 1500);
  }
  function animationPlay(){
    
    _stageStatus = STAGE_FREEZE;
    setTimeout(function(){
      _stageStatus = STAGE_PLAYING;
    },_freezeTime);
  }
  
  // function startMelt(){

  // }
  // function startFreeze(){

  //   // triangles 
  //   spwVo.triangles.forEach(function(t, i){
  //     _context.beginPath();
  //     var cen = spwUtils.getCenterAll(t);
  //     var x = Math.floor(cen[0]);
  //     var y = Math.floor(cen[1]);
  //     var rgba = spwUtils.squareSampleImage(_imageData, x, y, 3, _width);
  //     rgba.opacity = 0.6;
  //     _context.fillStyle = rgba + "";
  //     // triangles 중 처음 10개 중에 가운데 playbtn을 검사한다.
  //     if(i < 10 && isPlayBtnPos([x,y])){
  //       rgba.opacity = 0.9;
  //       _context.fillStyle =  "red";
  //     }
      
  //     _context.strokeStyle =  "rgba(255,255,255,0)";
  //     spwDraw.drawCell(t);
  //     _context.stroke();
  //     _context.fill();
  //     _context.closePath();
  //   });

  //   // polygones
  //   // spwVo.polygons.forEach(function(p, i){
  //   //   _context.beginPath();
  //   //   if(typeof p === 'undefined' || typeof p.data === 'undefined' ){
      
  //   //   }else{
  //   //     x = Math.floor(p.data[0]),
  //   //     y = Math.floor(p.data[1]);
  //   //   }

  //   //   var rgba = spwUtils.squareSampleImage(_imageData, x, y, 3, _width);
  //   //   rgba.opacity = 0.6;

  //   //   _context.fillStyle =  rgba + "";
  //   //   spwDraw.drawCell(p);
  //   //   _context.fill();
  //   //   _context.closePath();
  //   // });

  //   // 사이트
  //   // spwVo.samples.forEach(function(s, i){
  //   //   _context.beginPath();
  //   //   spwDraw.drawSite(s);
  //   //   _context.fillStyle = "black";
  //   //   _context.strokeStyle = "yellow";
  //   //   _context.fill();
  //   //   _context.stroke();
  //   //   _context.closePath();
  //   // });
  // }
  
  function resize(w,h){
    _width = w;
    _height = h;
    _canvasCen = [(_width/2),(_height/2)];
    _iconW = _iconH = _width/10 > 40 ? 40 : _width/10;
    _fbPos = [ _width - _iconW * 1.5, 10];
    _twPos = [ _width - _iconW * 2.8, 10];
    _imageData = _context.getImageData(0, 0, _width, _height);
    var type = 'poisson';
    if(_stageStatus === STAGE_ENDING){
      type = 'random';
    };
    spwVo = new spwVoronoi(_width, _height, type, _playBtnRadius);
  };

  function isPlayBtnPos(pos){
    return spwUtils.getDistance([_width/2,_height/2], pos) < _playBtnRadius/2;
  }
  function isShareFbPos(pos){
    return spwUtils.getDistance([_fbPos[0]+_iconW/2, _fbPos[1]+_iconW/2], pos) < _iconW/2;
  }
  function isShareTwPos(pos){
    return spwUtils.getDistance([_twPos[0]+_iconW/2, _twPos[1]+_iconW/2], pos) < _iconW/2;
  }
  function isReplay(pos){
    return spwUtils.getDistance([_width/2, _height/2 -_replayMarginBottom], pos) < _replayRadi;
  }
  function isAuthorPos(pos){
    return ((pos[0] > _width/2 - _authorLinkSize[0]/2) && (pos[0] < _width/2 + _authorLinkSize[0]/2) && pos[1] > _height/2 + 9 && pos[1] < _height/2 + _authorLinkSize[1]);
  }
  function userEvent(type, m){
    if(_stageStatus === STAGE_PLAYING){
      _curMouseEvent = type;
      _diagFind = spwVo.meltAtPos(m[0],m[1],50,_meltRatio[type]);
    }else if(_stageStatus === STAGE_READY && type === 'mouseup' && isPlayBtnPos(m)){
      startAudio();
    }else if(_stageStatus === STAGE_ENDING && type === 'mouseup'){
      if(isShareFbPos(m)){
        window.open('http://www.facebook.com/sharer/sharer.php?u='+_spUrl);
      }else if(isShareTwPos(m)){
        window.open("https://twitter.com/share?url="+encodeURIComponent(_spUrl)+"&text="+document.title);
      }else if(isAuthorPos(m)){
        window.open("http://blog.taejaehan.com");
      }else if(isReplay(m)){
        console.log('replay');
        _averageMeting = 0;
        dreamSpring.setBackResource(resetBackres);
      }
    }
    _curMouse = m;
  }
  function resetBackres(back){
    _backRes = back;
    spwVo.resample('replay');
    animationPlay();
  }
  function init(){
    audioInit();
    spwDraw.context = _context;
    spwVo = new spwVoronoi(_width, _height, 'poisson', _playBtnRadius);
    update();
    // =============================================================
    // init voronoi
    // start freeze

    // setup()
    // play -> start audio

    // update()
    // draw()

    // if audio end OR melting ratio over 90%
    // done screen

    // =============================================================
    // replay to init voronoi
    // init();
    // startfreeze();
    // if(play){
    //   setup();
    //   update();
    // };
  };
  return {
    init : init,
    resize : resize,
    userEvent : userEvent,
    resetBackres : resetBackres
  }
};

var dreamSpring = dreamSpring || new function(){

  var _isSupport = _checkVendor,
      _isMobile = _checkMobile,
      // _isMobile = true,
      _mouseholding = true,
      _imgNum = 12,
      _imgPath = '',
      _mouseTimeOut,
      _springWaltz = null,
      _canvas, 
      _this = this;

  _this.width, _this.height, _this.context, _this.backRes, _this.audioVis;

  function startSpringWalts(){
    
    if(_springWaltz === null){
      _springWaltz = new springWaltz(window.innerWidth, window.innerHeight, _this.context, _this.backRes, _this.audioVis);
      _springWaltz.init();
      setMouseEvent();
      windowResize();
    }else{
      _springWaltz.resetBackres(_this.backRes);
    }
    
  }
  function initImage(){
    //remove video dom
    var videoWrap = document.getElementById("sp_fullscreen_video");
    if(videoWrap){
      videoWrap.parentNode.removeChild(videoWrap);
    };
    _this.backRes = new Image;
    _this.backRes.resType = 'image';
    _imgPath = 'resources/imgs/spw'+Math.floor(Math.random()* _imgNum + 1) +'.jpg';
    _this.backRes.src = _imgPath;
    _this.backRes.onload = startSpringWalts;
  };
  function initVideo(){
    // load video
    var video = document.getElementById("theVideo");
    _this.backRes = video;
    _this.backRes.resType = 'video';
    // video.play();
    if(typeof video.readyState !== 'undefined' && video.readyState > 3 ) {
      startSpringWalts();
    }else{
      video.addEventListener('loadeddata', function() {
        startSpringWalts();
      });
    }
  };
  _this.setBackResource = function(){
    if(_isMobile){
      initImage();
    }else{
      initVideo();
    };
  }
  function initCanvas(){
    _canvas = d3.select("body").append("canvas")
    _this.context = _canvas.node().getContext("2d");
    _this.setBackResource();
  }

  function setMouseEvent(){
    _canvas.on("touchmove mousemove", mousemoved);
    _canvas.on("touchstart mousedown", mousedown);
    _canvas.on("touchend mouseup", mouseup);
  };

  // mouse event
  function mousedown() {
    _mouseTimeOut = setTimeout(mousehold, 500);
    _springWaltz.userEvent('mousedown', d3.mouse(this));
  };
  function mousehold(){
    _mouseholding = true;
  };
  function mouseup(){
    if (_mouseTimeOut){
      clearTimeout(_mouseTimeOut);
    };
    _mouseholding = false;
    _springWaltz.userEvent('mouseup', d3.mouse(this));
  };
  function mousemoved() {
    d3.event.preventDefault();
    var type = 'mousemove';
    if(_mouseholding){
      type = 'mousehold';
    };
    _springWaltz.userEvent(type, d3.mouse(this));
  };

  function windowResize(){
    _this.width = window.innerWidth;
    _this.height = window.innerHeight;
    _canvas.attr("width", _this.width).attr("height", _this.height);
    _canvas.width = _this.width;
    _canvas.height = _this.height;
    if(_this.backRes.resType === 'video'){
      _this.backRes.width = _this.backRes.videoWidth;
      _this.backRes.height = _this.backRes.videoHeight;
    };
    _springWaltz.resize(_this.width, _this.height);
  };
  
  _this.init = function(){
    if(_isSupport){
      document.getElementById('sp_fullwrap').className = '';
      initCanvas();
      window.onresize = windowResize;
    }else{
      // remove dom
      // make 404 page
      document.getElementById('sp_fullwrap').innerHTML = '<h1>Sorry</h1><div class="message">Spring Waltz was created with HTML5 and CSS3.<br>It\'s a Chrome experiment and you can see perfectly on Chrome browser.<br>Please use <a href="http://www.google.com/chrome" target="_blank">Google Chrome browser</a>.</div>';
      return;
    };

  };

  return _this;
};

