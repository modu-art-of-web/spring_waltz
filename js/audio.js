/*
Audio Visualizer by Raathigeshan.
http://raathigesh.com/
*/
function AudioVisualizer(num = 60) {
    //constants
    this.numberOfBars = num;
    this.javascriptNode;
    this.audioContext;
    this.sourceBuffer;
    this.analyser;
}
AudioVisualizer.prototype.setupAudioProcessing = function () {

    var audioCtx = window.AudioContext // Default
    || window.webkitAudioContext // Safari and old versions of Chrome
    || false;

    if(audioCtx){
        //get the audio context
        this.audioContext = new audioCtx();
        // this.audioContext = new AudioContext();

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

        return this.javascriptNode;
    }
    
};
//get the default audio from the server
AudioVisualizer.prototype.sendRequest = function (mp3) {
    var that = this;
    var request = new XMLHttpRequest();
    request.open("GET", mp3, true);
    request.responseType = "arraybuffer";
    request.send();
    // request.onload = function () {
    //   that.start(request.response);
    // };
    return request;
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