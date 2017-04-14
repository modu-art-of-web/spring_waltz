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

var spwVoronoi = function(w, h, sampleType, playBtnRadius){
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

      samples[i].melting += meltRatio * 0.05;
      
      cell.halfedges.forEach(function(e) {
        var edge = diagram.edges[e];
        var ea = edge.left;
        if (ea === cell.site || !ea) {
          ea = edge.right;
        }
        if (ea){
      
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
      wsd.outside = true;
      wsh.outside = true;
      samples.push(wsd);
      samples.push(wsh);
    };
    for(var i = 1; i <= hSideDotNum; i++){
      var wsd = [0, dotsH*i];
      var wsh = [w, dotsH*i];
      wsd.melting = defMelt;
      wsh.melting = defMelt;
      wsd.outside = true;
      wsh.outside = true;
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
      var sampleNum = Math.floor(w / 5);
      
      samples = d3.range(sampleNum).map(function(d, a, b, c, d) { 
        var samp = [Math.floor(Math.random() * (w + 1)), Math.floor(Math.random() * (h + 1))];
        samp.melting = 0;
        return samp; 
      });
    
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

var springWaltz = springWaltz || function(w, h, ctx, back){

  var spwVo,
      _spUrl = 'http://springwaltz.taejaehan.com',
      _width = w,
      _height = h,
      _canvasCen = [w/2, h/2],
      _backRes = back,
      _nextBackLoading = false,
      _audioVis = '',
      _analyser = '',
      _audioEnded = false,
      _context = ctx,
      _imageData = _context.getImageData(0, 0, _width, _height),
      _loadAngle = 0;
      STAGE_INIT = 0,
      STAGE_READY = 1,
      STAGE_FREEZE = 2,
      STAGE_GUIDE = 3,
      STAGE_PLAYING = 4,
      STAGE_ENDING = 5,
      _endMeltingAvg = 0.65,
      _drawEndingFrame = 0,
      _endingStep = [5,8,13],
      _stageStatus = STAGE_INIT,  //0 init, 1 ready, 2 playing, 3 done
      _playBtnRadius = (_width*0.1) > 60 ? 60 : _width*0.1,
      _playBtnAngle = 0,
      _playBtnMouseDown = false,
      _fNow = 0,
      _fThen = Date.now(),
      _fps = 30,                  /* 30 ms */
      _fInterval = (1000/_fps),   //frame rate
      _fDelta = 0,
      _freezeTime = 2300,
      _freezeRatio = 1 / (_fps * (_freezeTime / 1000)),
      _meltRatio = {
        'mousemove' : 0.01,
        'mousedown' : 0.03,
        'mouseup' : 0.05,
        'mousehold' : 0.1,
      },
      _meltingDownLimit = 50,
      _meltingDownNum = 0,
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
      _authorLinkSize = [110 , 80],
      _authorHover = false,
      _relplayHover = false;

  function audioUpdate(){

    var uintFrequencyData = new Uint8Array(_analyser.frequencyBinCount);
    var array = _analyser.getByteFrequencyData(uintFrequencyData);
    var step = Math.round(uintFrequencyData.length / 60);
    var perAngle = 360 / step;
    for (var i = 0; i <= 60; i++){
      var value = uintFrequencyData[i * step] / 4;
      particle = spwVo.samples[i++];
      particle[0] = _curMouse[0] + Math.sin(perAngle*i) * (value*8);
      particle[1] = _curMouse[1] + Math.cos(perAngle*i) * (value*8);
      var mel = 0.5;
      if(_curMouseEvent === 'mousehold'){
        mel = 0.8;
      }
      particle.melting = mel;
    }
  }
  function update(){
    window.requestAnimationFrame(update);
    
    _fNow = Date.now();
    _fDelta = _fNow - _fThen;
    if (_fDelta > _fInterval) {
      if(typeof _backRes.currentTime === 'undefined' || _backRes.currentTime !== 0){
        _fThen = _fNow - (_fDelta % _fInterval);
        if(_stageStatus === STAGE_PLAYING){
          _diagFind = spwVo.meltAtPos(_curMouse[0],_curMouse[1],50,_meltRatio['mousemove']);
          if(spwCheck.audioCtx && !spwCheck.isInApp){
            audioUpdate();
          }
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
    if(spwVo.triPlayIndex !== null){
      spwDraw.drawCell(spwVo.triangles[spwVo.triPlayIndex]);
    }
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

    spwVo.triangles.forEach(function(t, i){
      _context.beginPath();
      spwDraw.drawCell(t);
      if(i !== spwVo.triPlayIndex){
        _context.fillStyle = "rgba(255,255,255,0.8)";
        var outside = false;
        t.forEach(function(ts, j){
          if(ts.outside) outside = true; 
        });
        _context.lineWidth = 1;
        if(!outside){
          _context.strokeStyle = "rgba(255,255,255,0)";
        }else{
          _context.strokeStyle = "rgba(255,255,255,0.3)";
        };
      }else{
        if(spwVo.triPlayIndex !== null){
          var cen = spwUtils.getCenterAll(spwVo.triangles[spwVo.triPlayIndex]);
          var x = Math.floor(cen[0]);
          var y = Math.floor(cen[1]);
          var rgba = spwUtils.squareSampleImage(_imageData, x, y, 3, _width);
          rgba.opacity = 1;
          _context.fillStyle = rgba + "";
          _context.strokeStyle =  "rgba(255,255,255,0.8)";
          _context.lineWidth = 3;
        }
      }
      _context.stroke();
      _context.fill();
      _context.closePath();
    });

    _context.beginPath();
    _context.lineWidth = 1;
    _context.font = "18px Julius Sans One,sans-serif, Arial";
    _context.fillStyle = "gray";
    _context.textAlign = 'center';
    if(spwCheck.isMobile){
      if(!spwCheck.isInApp){
        _context.fillText('Turn up your speakers and',_width/2,_height/2 + _playBtnRadius * 1.8);
      }
      _context.fillText('hit play to uncover spring',_width/2,_height/2 + _playBtnRadius * 1.8 + 23);
    }else{
      _context.fillText('Turn up your speakers and hit play to uncover spring',_width/2,_height/2 + _playBtnRadius * 1.8);
    }
    _context.closePath();
  }
  function drawFreeze(){
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
    }
    spwVo.triangles.forEach(function(t, i){
      
      if(typeof t.opacity === 'undefined'){
        t.opacity = _freezeRatio;
        t.whiteOp = 0.8;
      }else{
        if(!(i % Math.floor(Math.random()* 5) + 1)){
          if(t.opacity < 0.7){
            t.opacity += t.opacity;
          }
          t.whiteOp -= 0.1;
        }
      }
      _context.beginPath();
      _context.fillStyle = "rgba(255,255,255,"+t.whiteOp+")";
      _context.strokeStyle =  "rgba(255,255,255,0)";
      spwDraw.drawCell(t);
      _context.stroke();
      _context.fill();
      _context.closePath();

      
      var cen = spwUtils.getCenterAll(t);
      var x = Math.floor(cen[0]);
      var y = Math.floor(cen[1]);
      var rgba = spwUtils.squareSampleImage(_imageData, x, y, 3, _width);
      rgba.opacity = t.opacity;
      _context.beginPath();
      _context.fillStyle = rgba + "";
      _context.strokeStyle =  "rgba(255,255,255,0)";
      spwDraw.drawCell(t);
      _context.stroke();
      _context.fill();
      _context.closePath();

      
      
    });
  }
  function drawPlaying(){
    spwVo.triangles = spwVo.voronoi(spwVo.samples.filter(function(s, i) {
      if(typeof s.musics !== 'undefined'){
        spwVo.samples.splice(i,1);
      };
      if(typeof s.flow !== 'undefined'){
        s[1] += s.flow * 20;
        s.melting += 0.05;
        if(s[1] > _height || s.melting > 0.8){
          spwVo.samples.splice(i,1);
          _meltingDownNum--;
        };
      };
      return typeof s.melting !== 'undefined';
    })).triangles();

    if(_averageMeting < _endMeltingAvg){

      var totalMelting = 0;
      spwVo.triangles.forEach(function(t, i){
        
        _context.beginPath();
        var cen = spwUtils.getCenterAll(t);
        var x = Math.floor(cen[0]);
        var y = Math.floor(cen[1]);
        var rgba = spwUtils.squareSampleImage(_imageData, x, y, 3, _width);
        var meltingAver = 0;

        t.forEach(function(ts, j){
          meltingAver += ts.melting;
        });
        meltingAver = meltingAver / 3;

        if(_meltingDownLimit > _meltingDownNum && meltingAver > 0.2 && meltingAver < 0.8){
          var downSamp = [x, y];
          downSamp.melting = 0;
          downSamp.flow = meltingAver;
          downSamp.originY = y;
          spwVo.samples.push(downSamp);
          _meltingDownNum++;
        };
        meltingAver > 1 ? meltingAver = 1 : meltingAver = meltingAver;
        t.opacity = 1 - meltingAver;
        totalMelting += meltingAver;
        rgba.opacity = t.opacity;
        _context.fillStyle = rgba + "";
        _context.strokeStyle =  "rgba(255,255,255,0)";
        spwDraw.drawCell(t);
        _context.stroke();
        _context.fill();
        _context.closePath();
      });
      _averageMeting = totalMelting / spwVo.triangles.length;
    }else{
      if(_stageStatus !== STAGE_ENDING){
        spwVo.resample('random');
      }
      drawEnding();
    }
  }
  function drawGuide(){
    spwVo.triangles.forEach(function(t, i){
      _context.beginPath();
      var cen = spwUtils.getCenterAll(t);
      var x = Math.floor(cen[0]);
      var y = Math.floor(cen[1]);
      var rgba = spwUtils.squareSampleImage(_imageData, x, y, 3, _width);
      rgba.opacity = t.opacity;
      _context.fillStyle = rgba + "";
      _context.strokeStyle =  "rgba(255,255,255,0)";
      spwDraw.drawCell(t);
      _context.stroke();
      _context.fill();
      _context.closePath();
    });

    _context.beginPath();
    _context.rect(0,0,_width,_height);
    _context.fillStyle = "rgba(0,0,0,0.8)";
    _context.fill();
    _context.closePath();

    _context.beginPath();
    _context.arc(_curMouse[0], _curMouse[1], 30, 0, 2 * Math.PI, false);
    _context.fillStyle = "rgba(255,255,255,0.8)";
    _context.fill();
    _context.closePath();

    _context.font = "23px Julius Sans One,sans-serif, Arial";
    _context.fillStyle = "rgba(255,255,255,0.8)";
    _context.textAlign = 'center';
    if(spwCheck.isMobile){
      _context.fillText('Move cursor to melt ice ',_curMouse[0],_curMouse[1]+70);
      // _context.fillText('Click and Hold to melt faster.',_curMouse[0],_curMouse[1]+93);
    }else{
      _context.fillText('Move cursor to melt ice Click and Hold to melt faster.',_curMouse[0],_curMouse[1]+70);
    }
    
  }
  function draw(){
    spwDraw.drawImageProp(_context, _backRes, 0, 0, _width, _height);
    _imageData = _context.getImageData(0, 0, _width, _height);

    if(_stageStatus === STAGE_PLAYING){
      drawPlaying();
    }else if(_stageStatus === STAGE_FREEZE){
      drawFreeze()
    }else if(_stageStatus === STAGE_ENDING){
      drawEnding()
    }else if(_stageStatus === STAGE_INIT){
      drawLoading();
    }else if(_stageStatus === STAGE_READY){
      drawReady();
    }else if(_stageStatus === STAGE_GUIDE){
      drawGuide();  //melting guide
    }
  }
  function drawEnding(){

    var topology = spwUtils.computeTopology(spwVo.voronoi(spwVo.samples));
    var geo = topology.objects.voronoi.geometries;
    var limitX = _width * 0.1;
    var limitY = _height * 0.25;
    if(spwUtils.isMobile){
      limitX = -500;
      limitY = _height * 0.1;
    }
    
    var nextPolygons = [];

    var geoMerge = topojson.merge(topology, geo.filter(function(d, i) { 
      var x = d.data[0];
      var y = d.data[1];
      var endingBox = ( x > limitX && x < (_width - limitX) && y > limitY && y < (_height - limitY));
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
      rgba.opacity = _drawEndingFrame / _endingStep[0];
      rgba.opacity = rgba.opacity > 0.8 ? 0.8 : rgba.opacity;
      _context.fillStyle =  rgba + "";
      spwDraw.drawCell(p);
      _context.fill();
      _context.closePath();

      
      _context.drawImage(_snsImg, 0,0,90,100, _fbPos[0], _fbPos[1], _iconW, _iconH);
      _context.drawImage(_snsImg, 95,0,90,100, _twPos[0], _twPos[1], _iconW, _iconH);
      
    });

    if(_drawEndingFrame / _endingStep[0] > 1){
      geoMerge.coordinates.forEach(function(polygon) {
        polygon.forEach(function(ring, i) {
          _context.beginPath();
          spwUtils.renderSinglePolygon(_context, ring, _width, _height, 0);
          var strokeOpa = _drawEndingFrame / _endingStep[1] - 1;
          var fillOpa = strokeOpa > 0.7 ? 0.7 : strokeOpa;
          _context.fillStyle = "rgba(255,255,255,"+fillOpa+")";
          _context.lineWidth = 1.5;
          _context.lineJoin = "miter";
          _context.strokeStyle = "rgba(255,255,255,"+strokeOpa+")";
          _context.fill();
          _context.stroke();
          _context.closePath();

          if(_drawEndingFrame / _endingStep[1] > 2){

            
            var cen = [_width/2, _height/2 - _replayMarginBottom];
            var devide = 6;
            var opa = _drawEndingFrame / _endingStep[2] - 2;
            _imageData = _context.getImageData(0, 0, _width, _height);
            var avrRgb = spwUtils.getAverageColourAsRGB(_imageData.data);
            if(_relplayHover){
              devide = 4;
              _context.fillStyle = avrRgb + '';
              _context.strokeStyle = avrRgb + '';
            }else{
              _context.fillStyle = "rgba(153,153,153,"+opa+")";
              _context.strokeStyle = "rgba(153,153,153,"+opa+")";
            }
            var triRadi = _replayRadi/devide;
            _context.beginPath();
            _context.arc(cen[0], cen[1], _replayRadi, 0, 1.5 * Math.PI, false);
            _context.lineWidth = _replayRadi/5 > 6 ? 6 : _replayRadi/5;
            _context.stroke();
            _context.closePath();

            _context.beginPath();
            _context.moveTo(cen[0] , cen[1] - _replayRadi - triRadi);
            _context.lineTo(cen[0] , cen[1] - _replayRadi + triRadi);
            _context.lineTo(cen[0] + triRadi * 2 , cen[1] - _replayRadi);
            _context.moveTo(cen[0] - triRadi, cen[1] - triRadi * 2);
            _context.lineTo(cen[0] - triRadi, cen[1] + triRadi * 2);
            _context.lineTo(cen[0] + triRadi * 3 , cen[1]);
            _context.fill();
            _context.closePath();

            
            _context.font = "23px Julius Sans One,sans-serif, Arial";
            _context.fillStyle = avrRgb + '';
            _context.strokeStyle = "rgba(153,153,153,"+opa+")";
            _context.fillStyle = "rgba(153,153,153,"+opa+")";
            _context.textAlign = 'center';
            _context.fillText("'Voices Of Spring Waltz'",_width/2,_height/2);
            _context.textAlign = 'left';
            _context.font = "16px Julius Sans One,sans-serif, Arial";
            _context.fillText('- Johann Strauss Jr.',_width/2,_height/2 + 25);

            _context.textAlign = 'center';
            if(_authorHover){
              _context.fillStyle = avrRgb + '';
              _context.strokeStyle = avrRgb + '';
            };
            _context.fillText('by Taejae Han',_width/2,_height/2 + 70);
            _context.beginPath();
            _context.moveTo(_width/2 - _authorLinkSize[0]/2 ,_height/2+ _authorLinkSize[1]);
            _context.lineTo(_width/2 + _authorLinkSize[0]/2,_height/2+ _authorLinkSize[1]);
            _context.lineWidth = 1;
            _context.stroke();
            _context.closePath();
          }
        })
      });
    }
    
    _stageStatus = STAGE_ENDING;
    _drawEndingFrame++;
  }
  
  
  function audioInit(){
    _audioVis = new Audio("resources/audios/spring_waltz.mp3");
    _audioVis.addEventListener("ended",function() {
      _audioEnded = true;
      // melted all
      _averageMeting = 1;
    });
    if(spwCheck.isSafari){
      setTimeout(function(){
        audioLoaded();
      }, 3000);
    }else{
      if(typeof _audioVis.readyState !== 'undefined' && _audioVis.readyState > 3 ) {
        audioLoaded();
      }else{
        _audioVis.addEventListener('loadeddata', function() {
          // audioLoaded();
        }, false);
        _audioVis.addEventListener('canplay', function() {
          // audioLoaded();
        }, false);
        _audioVis.addEventListener('canplaythrough', function() {
          audioLoaded();
        }, false);

      };
    }
  };
  function audioLoaded(){
    if(_stageStatus < STAGE_READY){
      _stageStatus = STAGE_READY;
      if(spwCheck.audioCtx && typeof _audioVis.ctx === 'undefined'){
        _audioVis.ctx = new (window.AudioContext || window.webkitAudioContext)(); // creates audioNode
        var source = _audioVis.ctx.createMediaElementSource(_audioVis); // creates audio source
        _analyser = _audioVis.ctx.createAnalyser(); // creates analyserNode
        source.connect(_audioVis.ctx.destination); // connects the audioNode to the audioDestinationNode (computer speakers)
        source.connect(_analyser); // connects the analyser node to the audioNode and the audioDestinationNode
      }
    }
  }
  function startPlay(){
    if(!spwCheck.isInApp){
      _audioVis.play();
    };
    // setTimeout(function(){
      startFreeze();
    // }, 1500);
  }
  function startFreeze(isReplay){
    
    _stageStatus = STAGE_FREEZE;
    setTimeout(function(){
      _drawEndingFrame = 0;
      _meltingDownNum = 0;
      if(isReplay){
        _stageStatus = STAGE_PLAYING;
      }else{
        _stageStatus = STAGE_GUIDE;
      }
      
    },_freezeTime);
  }

  function resize(w,h){
    _width = w;
    _height = h;
    _canvasCen = [(_width/2),(_height/2)];
    _iconW = _iconH = _width/10 > 40 ? 40 : _width/10;
    _fbPos = [ _width - _iconW * 1.5, 10];
    _twPos = [ _width - _iconW * 2.8, 10];
    _imageData = _context.getImageData(0, 0, _width, _height);
    _playBtnRadius = (_width*0.1) > 60 ? 60 : _width*0.1;
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
  function reactPlayBtn(mark){
    var moveR = mark * _playBtnRadius / 10;
    if(spwVo.triPlayIndex !== null){
      spwVo.triangles[spwVo.triPlayIndex].forEach(function(t,i){
        if(i === 0){
          t[0] -= moveR;
          t[1] -= moveR;  
        }else if(i === 1){
          t[0] -= moveR;
          t[1] += moveR;
        }else if(i === 2){
          t[0] += moveR;
        }
      });
    }
  }
  function userEvent(type, m){
    if(_stageStatus === STAGE_PLAYING){
      _curMouseEvent = type;
      _diagFind = spwVo.meltAtPos(m[0],m[1],50,_meltRatio[type]);
    }else if(_stageStatus === STAGE_READY){
      if(isPlayBtnPos(m)){
        if(type === 'mousemove'){
          if(!_playBtnMouseDown){
            _playBtnAngle += 0.5;
            if(spwVo.triPlayIndex !== null){
              spwVo.triangles[spwVo.triPlayIndex].forEach(function(t,i){
                t[0] += Math.sin(_playBtnAngle) * _playBtnRadius/20;
                t[1] += Math.cos(_playBtnAngle) * _playBtnRadius/20;
              })
            }
          }
        }else if(type === 'mousedown'){
          _playBtnMouseDown = true;
          reactPlayBtn(-1);
          
        }else if(type === 'mouseup'){
          reactPlayBtn(1);
          startPlay();
        }
      }else{
        if(_playBtnMouseDown && type === 'mouseup'){
          _playBtnMouseDown = false;
          reactPlayBtn(1);
        }
      }
      
    }else if(_stageStatus === STAGE_ENDING){
      if(type === 'mouseup'){
        if(isShareFbPos(m)){
          window.open('http://www.facebook.com/sharer/sharer.php?u='+_spUrl);
        }else if(isShareTwPos(m)){
          window.open("https://twitter.com/share?url="+encodeURIComponent(_spUrl)+"&text="+document.title);
        }else if(isAuthorPos(m)){
          window.open("http://blog.taejaehan.com");
        }else if(isReplay(m)){
          if(_audioEnded){
            if(spwCheck.audioCtx){
              _audioVis.ctx.currentTime = 0;
            };
            _audioVis.play();
          }
          _averageMeting = 0;
          _nextBackLoading = true;
          dreamSpring.setBackResource(resetBackres);
        }
      }else if(type === 'mousemove'){
        if(isAuthorPos(m)){
          _authorHover = true;
        }else if(isReplay(m)){
          _relplayHover = true;
        }else{
          _authorHover = false;
          _relplayHover = false;
        }
      }
      
    }else if(_stageStatus === STAGE_GUIDE && type === 'mouseup'){
      _stageStatus = STAGE_PLAYING;
    }
    _curMouse = m;
  }
  function resetBackres(back){
    _backRes = back;
    spwVo.resample('replay');
    _nextBackLoading = false;
    _authorHover = false;
    _relplayHover = false;
    startFreeze(true);
  }
  function init(){
    // not fb,tw,kakao inapp
    if(!spwCheck.isInApp){
      audioInit();
    }else{
      _stageStatus = STAGE_READY;
    }
    spwDraw.context = _context;
    spwVo = new spwVoronoi(_width, _height, 'poisson', _playBtnRadius);
    update();
    
  };
  return {
    init : init,
    resize : resize,
    userEvent : userEvent,
    resetBackres : resetBackres
  }
};

var dreamSpring = dreamSpring || new function(){

  var _isSupport = spwCheck.checkVendor,
      _isMobile = spwCheck.isMobile,
      _mouseholding = false,
      _imgTotal = 12,
      _imgNum = 0,
      _imgPreNum = 0,
      _imgArr = [],
      _imgPath = '',
      _video = null,
      _mouseTimeOut,
      _springWaltz = null,
      _canvas, 
      _this = this;


  _this.width, _this.height, _this.context, _this.backRes;

  function startSpringWalts(){
    
    if(_springWaltz === null){
      _springWaltz = new springWaltz(window.innerWidth, window.innerHeight, _this.context, _this.backRes);
      _springWaltz.init();
      setMouseEvent();
      windowResize();
    }else{
      _springWaltz.resetBackres(_this.backRes);
    }
    
  }
  function preLoad(){
    if(typeof _imgArr[_imgPreNum] === 'undefined') return;
    var img=new Image();
    img.src='resources/imgs/spw'+_imgArr[_imgPreNum]+'.jpg';
    _imgPreNum++;
    img.onload = preLoad;
  }
  function randomBackInti(){
    for(var i=1; i <= _imgTotal; i++){
      _imgArr.push(i);
    };
    _imgArr = shuffle(_imgArr);
    preLoad(0);
  }
  function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  }
  function initImage(){
    _this.backRes = new Image;
    _this.backRes.resType = 'image';
    
    if(_imgArr.length <= _imgNum || typeof _imgArr[_imgNum] === 'undefined'){
      _imgNum = 0;
    };

    _imgPath = 'resources/imgs/spw'+_imgArr[_imgNum]+'.jpg';
    _imgNum++;
    _this.backRes.src = _imgPath;
    _this.backRes.onload = startSpringWalts;
  };
  function initVideo(){
    if(_video === null){
      _video = document.createElement('video');  
    }else{
      initImage();
      return;
    }
    _video.src = 'resources/videos/spw1.mp4';
    _video.muted = true;
    if(spwCheck.videoLoop){
      _video.loop = true;
    }
    _video.play();
    _this.backRes = _video;
    _this.backRes.resType = 'video';
    if(typeof _video.readyState !== 'undefined' && _video.readyState > 3 ) {
      startSpringWalts();
    }else{
      _video.addEventListener('loadeddata', function() {
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
    _canvas = d3.select("body").append("canvas");
    if (spwCheck.isTouch) {
        if ('addEventListener' in document) {
          document.addEventListener('DOMContentLoaded', function() {
            FastClick.attach(document.body);
          }, false);
        }
    }
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
    if(_springWaltz !== null){
      _springWaltz.userEvent('mousedown', d3.mouse(this));
    }
  };
  function mousehold(){
    _mouseholding = true;
  };
  function mouseup(){
    if (_mouseTimeOut){
      clearTimeout(_mouseTimeOut);
    };
    _mouseholding = false;
    if(_springWaltz !== null){
      _springWaltz.userEvent('mouseup', d3.mouse(this));
    }
  };
  function mousemoved() {
    d3.event.preventDefault();
    var type = 'mousemove';
    if(_mouseholding){
      type = 'mousehold';
    };
    if(_springWaltz !== null){
      _springWaltz.userEvent(type, d3.mouse(this));
    }
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
    if(_springWaltz !== null){
      _springWaltz.resize(_this.width, _this.height);
    }
  };
  
  _this.init = function(){
    if(_isSupport){
      randomBackInti();
      initCanvas();
      window.onresize = windowResize;
    }else{
      // remove dom
      // make 404 page
      document.getElementById('sp_fullwrap').className = 'screen-bg';
      document.getElementById('sp_fullwrap').innerHTML = '<h1>Sorry</h1><div class="message">Spring Waltz was created with HTML5 and CSS3.<br>It\'s a Chrome experiment and you can see perfectly on Chrome browser.<br>Please use <a href="http://www.google.com/chrome" target="_blank">Google Chrome browser</a>.</div>';
      return;
    };

  };

  return _this;
};

