function captureMicrophone(callback) {
    // btnReleaseMicrophone.disabled = false;
    if(microphone) {
        callback(microphone);
        return;
    }
    if(typeof navigator.mediaDevices === 'undefined' || !navigator.mediaDevices.getUserMedia) {
        alert('This browser does not supports WebRTC getUserMedia API.');
        if(!!navigator.getUserMedia) {
            alert('This browser seems supporting deprecated getUserMedia API.');
        }
    }
    navigator.mediaDevices.getUserMedia({
        audio: isEdge ? true : {
            echoCancellation: false
        }
    }).then(function(mic) {
        callback(mic);
    }).catch(function(error) {
        alert('Unable to capture your microphone. Please check console logs.');
        console.error(error);
    });
};

function releaseMicrophone(){
    if(microphone) {
        microphone.stop();
        microphone = null;
    }
};

var isEdge = navigator.userAgent.indexOf('Edge') !== -1 && (!!navigator.msSaveOrOpenBlob || !!navigator.msSaveBlob);
var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
var recorder; // globally accessible
var microphone;
var btnStartRecording = document.getElementById('trigger');
var speechEvents = hark();

btnStartRecording.onclick = function() {
    this.disabled = true;
    this.style.border = '';
    this.style.fontSize = '';
    if (!microphone) {
        captureMicrophone(function(mic) {
            microphone = mic;
            if(isSafari) {
                // replaceAudio();
                // audio.muted = true;
                // audio.srcObject = microphone;
                btnStartRecording.disabled = false;
                btnStartRecording.style.border = '1px solid red';
                btnStartRecording.style.fontSize = '150%';
                alert('Please click startRecording button again. First time we tried to access your microphone. Now we will record it.');
                return;
            }
            click(btnStartRecording);
        });
        return;
    }
    // replaceAudio();
    // audio.muted = true;
    // audio.srcObject = microphone;
    var options = {
        type: 'audio',
        numberOfAudioChannels: isEdge ? 1 : 2,
        checkForInactiveTracks: true,
        bufferSize: 16384
    };
    if(isSafari || isEdge) {
        options.recorderType = StereoAudioRecorder;
    }
    if(navigator.platform && navigator.platform.toString().toLowerCase().indexOf('win') === -1) {
        options.sampleRate = 48000; // or 44100 or remove this line for default
    }
    if(isSafari) {
        options.sampleRate = 44100;
        options.bufferSize = 4096;
        options.numberOfAudioChannels = 2;
    }
    if(recorder) {
        recorder.destroy();
        recorder = null;
    }
    recorder = RecordRTC(microphone, options);
    speechEvents = hark(microphone, options);
    recorder.startRecording();
};
function click(el) {
    el.disabled = false; // make sure that element is not disabled
    var evt = document.createEvent('Event');
    evt.initEvent('click', true, true);
    el.dispatchEvent(evt);
}
function getRandomString() {
    if (window.crypto && window.crypto.getRandomValues && navigator.userAgent.indexOf('Safari') === -1) {
        var a = window.crypto.getRandomValues(new Uint32Array(3)),
            token = '';
        for (var i = 0, l = a.length; i < l; i++) {
            token += a[i].toString(36);
        }
        return token;
    } else {
        return (Math.random() * new Date().getTime()).toString(36).replace(/\./g, '');
    }
}
function getFileName(fileExtension) {
    var d = new Date();
    var year = d.getFullYear();
    var month = d.getMonth();
    var date = d.getDate();
    return 'RecordRTC-' + year + month + date + '-' + getRandomString() + '.' + fileExtension;
}
