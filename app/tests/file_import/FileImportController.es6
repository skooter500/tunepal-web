import TranscriberAsync from '../../scripts/transcription/TranscriberAsync.es6lib'
import Utils from '../../scripts/Utils.es6lib';

export default class FileImportController {
  constructor($scope) {
    this.$scope = $scope;

    this._audioContext = new window.AudioContext();

    this.samples = [
      {url: '/assets/a440.wav', transcription: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'},
      {url: '/assets/happy-birthday.wav', transcription: 'DEDGGGGAGFFFDEDAGACAFGGEDEDDDDBAGFGECBCBAGAGFGGG'},
      {url: '/assets/Gan-Ainm.ogg'},
      {url: '/assets/Drowsy-Maggie.mp3'},
    ];

    this.source = this.samples[1].url;
  }

  readLocalFile(e) {
    this.file = e.target.files[0];
  }

  readAudio() {
    this.status = 'Reading audio file...';

    this._getAudioUrlAsync()
    .then(this.apply(url => {
      $('audio').attr('src', url);

      var request = new XMLHttpRequest();
      request.open('GET', url, true);
      request.responseType = 'arraybuffer';
      request.onload = this.apply(() => this._analyzeAudio(request.response));
      request.onerror = this.apply(() => this.status = 'Failed to read or download the file');
      request.send();
    }));
  }

  _getAudioUrlAsync() {
    return new Promise((resolve, reject) => {
      switch (this.source) {
        case 'local':
          let reader = new FileReader();
          reader.onload = e => resolve(e.target.result);
          reader.readAsDataURL(this.file);
          break;
        default:
          resolve(this.source);
          break;
      }
    });
  }

  _analyzeAudio(audioFile) {
    this.status = 'Analyzing audio file...';

    this._audioContext.decodeAudioData(audioFile,
      this.apply(audio => this.onAudioDecoded(audio)),
      this.apply(() => this.status = 'Failed to decode the file')
    );
  }

  onAudioDecoded(audio) {
    this._audio = audio;
    this._signal = audio.getChannelData(0);

    let transcriber = new TranscriberAsync();
    let initParams = {
      inputSampleRate: audio.sampleRate,
      sampleTime: audio.duration,
      fundamental: 'D',
      enableSampleRateConversion: this.enableSampleRateConversion,
    };
    let transcribeParams = {
      signal: this._signal,
      midi: false,
    };

    transcriber.initAsync(initParams)
    .then(() => {
      return transcriber.transcribeAsync(transcribeParams);
    })
    .then(this.apply(result => {
      this.result = result;

      this.transcription = result.transcription;
      this.sampleRate = audio.sampleRate;
      this.duration = audio.duration;

      this.convertedSampleRate = this.enableSampleRateConversion
        ? result.sampleRate
        : 'Disabled';

      return transcriber.getSignalAsync();
    }))
    .then(this.apply(signal => {
      this._resampledSignal = signal;
      this._resampledAudio = this._audioContext.createBuffer(1, this.result.numSamples, this.result.sampleRate);
      this._resampledAudio.copyToChannel(signal, 0);
      this.status = 'Succeeded';
    }));
  }

  playSignal() {
    if (this.signalPlayer) {
      this.signalPlayer.stop(0);
      this.signalPlayer = null;
    }
    else {
      this.signalPlayer = this._audioContext.createBufferSource();
      this.signalPlayer.buffer = this._audio;
      this.signalPlayer.connect(this._audioContext.destination);
      this.signalPlayer.onended = this.apply(() => this.signalPlayer = null);
      this.signalPlayer.start(0, 0, this._audio.duration);
    }
  }

  playResampledSignal() {
    if (this.resampledPlayer) {
      this.resampledPlayer.stop(0);
      this.resampledPlayer = null;
    }
    else {
      this.resampledPlayer = this._audioContext.createBufferSource();
      this.resampledPlayer.buffer = this._resampledAudio;
      this.resampledPlayer.connect(this._audioContext.destination);
      this.resampledPlayer.onended = this.apply(() => this.resampledPlayer = null);
      this.resampledPlayer.start(0, 0, this._resampledAudio.duration);
    }
  }

  downloadSignal() {
    let blob = new Blob([this._signal], {type: 'application/octet-stream'});
    saveAs(blob, 'happy-birthday-insignal.bin');
  }

  downloadResampledSignal() {
    let blob = new Blob([this._resampledSignal], {type: 'application/octet-stream'});
    saveAs(blob, 'happy-birthday-outsignal.bin');
  }

  // apply() is used to execute an expression in angular from outside of the angular framework.
  // See https://docs.angularjs.org/api/ng/type/$rootScope.Scope#$apply
  apply(func, that = this) {
    let wrap = function() {
      let args = arguments;
      return this.$scope.$apply(() => func.apply(that, args));
    };
    return wrap.bind(this);
  }
}

angular.module('FileImportApp', [])
.controller('FileImportController', FileImportController)
.directive('myfile', [() => {
  return {
    scope: {
      myfile: '=',
    },
    link: (scope, element, attributes) => {
      element.bind('change', changeEvent => {
        scope.$apply(() => scope.myfile = changeEvent.target.files[0]);
      });
    },
  };
}]);
