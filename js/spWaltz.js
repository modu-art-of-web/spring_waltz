var springWaltz = springWaltz || function(){
  function setup(){

  }
  function draw(){

  }
  function update(){
    draw();
  }
  function initVoronoi(){

  }
  function init(){
    console.log('init');
    // =============================================================
    // init voronoi
    // start iceing

    // setup()
    // play -> start audio

    // update()
    // draw()

    // if audio end OR melting ratio over 90%
    // done screen

    // =============================================================
    // replay to init voronoi
    // initVoronoi();
    // startIceing();
    // if(play){
    //   setup();
    //   update();
    // };
  };
  return {
    init : init
  }
};

var dreamSpring = dreamSpring || ( function(){

  var _isSupport = true,
      _isMobile = false,
      _springWaltz, _width, _height, _canvas, _context, _backRes;

  function startByImg(){
    //remove video dom
    var videoWrap = document.getElementById("sp_fullscreen_video");
    if(videoWrap){
      videoWrap.parentNode.removeChild(videoWrap);
    };
    _backRes = new Image;
    _backRes.src = 'resources/imgs/sp4.jpg';
    _backRes.onload = _springWaltz.init();
  };
  function startByVideo(){
    // load video
    var video = document.getElementById("theVideo");
    video.play();
    if(typeof video.readyState !== 'undefined' && video.readyState === 4 ) {
      _backRes = video;
      _springWaltz.init();
    }else{
      video.addEventListener('loadeddata', function() {
        _backRes = video;
        _springWaltz.init();
      });
    }
  };
  function loadAudio(){

  }
  function windowResize(){

  };
  function initCanvas(){
    _width = window.innerWidth;
    _height = window.innerHeight;
    _canvas = d3.select("body").append("canvas")
        .attr("width", _width)
        .attr("height", _height);
    _context = _canvas.node().getContext("2d");

    // d3.select("canvas").on("touchmove mousemove", _mousemoved);
    // d3.select("canvas").on("touchstart mousedown", _mousedown);
    // d3.select("canvas").on("touchend mouseup", _mouseup);
    
  }
  function init(){

    if(_isSupport){
      _springWaltz = new springWaltz();
      if(_isMobile){
        startByImg();
      }else{
        startByVideo();
      };
      loadAudio();
    }else{
      // remove dom
      // make 404 page
      return;
    };

    windowResize()
    initCanvas();
  };
  
  return {
    init : init,
  };
})();
