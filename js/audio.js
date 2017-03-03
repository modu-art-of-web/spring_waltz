/*
Audio Visualizer by Raathigeshan.
http://raathigesh.com/
*/
function AudioVisualizer() {
    //constants
    this.numberOfBars = 60;

    //Rendering
    // this.scene;
    // this.camera;
    // this.renderer;
    // this.controls;

    // //bars
    // this.bars = new Array();

    //audio
    this.javascriptNode;
    this.audioContext;
    this.sourceBuffer;
    this.analyser;
}
AudioVisualizer.prototype.setupAudioProcessing = function () {
    //get the audio context
    this.audioContext = new AudioContext();

    //create the javascript node
    this.javascriptNode = this.audioContext.createScriptProcessor(2048, 1, 1);
    this.javascriptNode.connect(this.audioContext.destination);

    //create the source buffer
    this.sourceBuffer = this.audioContext.createBufferSource();

    //create the analyser node
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.smoothingTimeConstant = 0.3;
    this.analyser.fftSize = 512;

    //connect source to analyser
    this.sourceBuffer.connect(this.analyser);

    //analyser to speakers
    this.analyser.connect(this.javascriptNode);

    //connect source to analyser
    this.sourceBuffer.connect(this.audioContext.destination);

    var that = this;

    //this is where we animates the bars
    // this.javascriptNode.onaudioprocess = function () {

    //     // get the average for the first channel
    //     var array = new Uint8Array(that.analyser.frequencyBinCount);
    //     that.analyser.getByteFrequencyData(array);

    //     //render the scene and update controls
    //     // audioVis.renderer.render(audioVis.scene, audioVis.camera);
    //     // audioVis.controls.update();

    //     var step = Math.round(array.length / audioVis.numberOfBars);

    //     // console.log('step : ' + JSON.stringify(step));
    //     // console.log('array : ' + JSON.stringify(array));

    //     //Iterate through the bars and scale the z axis
    //     for (var i = 0; i < audioVis.numberOfBars; i++) {
    //         var value = array[i * step] / 4;
    //         value = value < 1 ? 1 : value;
    //         // console.log('value : ' + value);
    //         // audioVis.bars[i].scale.z = value;
    //     }
    // }
};
//get the default audio from the server
AudioVisualizer.prototype.getAudio = function () {
    var request = new XMLHttpRequest();
    request.open("GET", "resources/musics/spring_waltz.mp3", true);
    request.responseType = "arraybuffer";
    request.send();
    var that = this;
    request.onload = function () {
        that.start(request.response);
    }
};
//start the audio processing
AudioVisualizer.prototype.start = function (buffer) {
    console.log('buffer : ' + JSON.stringify(buffer));
    this.audioContext.decodeAudioData(buffer, decodeAudioDataSuccess, decodeAudioDataFailed);
    var that = this;

    function decodeAudioDataSuccess(decodedBuffer) {
        that.sourceBuffer.buffer = decodedBuffer;
        console.log('decodedBuffer : ' + JSON.stringify(decodedBuffer));
        that.sourceBuffer.start(0);
    }

    function decodeAudioDataFailed() {
        debugger
    }
};