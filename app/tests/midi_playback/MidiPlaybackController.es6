import Utils from '../../scripts/Utils.es6lib';

export default class MidiPlaybackController {
  constructor($scope) {
    this.$scope = $scope;

    this._audioContext = new window.AudioContext();

    this.samples = [
      {url: '/assets/happy-birthday.midi'},
    ];

    this.source = this.samples[0].url;
    this.midiPluginReady = false;
    this.midiPlayerReady = false;

    this._initMidi();
  }

  _initMidi() {
    this.status = 'Initializing MIDI.js...';

    MIDI.loadPlugin({
      soundfontUrl: '../../lib/MIDI.js/soundfont/',
      instrument: "acoustic_grand_piano",
      onsuccess: this.apply(() => {
        this.midiPluginReady = true;
        this.status = 'Midi.js ready';
      }),
      onprogress: this.apply((state, percent) => {
        percent *= 100;
        this.status = `Initializing MIDI.js (${percent.toFixed(2)}%)...`;
      }),
    });
  }

  play() {
    MIDI.Player.currentTime = 0;
    MIDI.Player.start();
  }

  pause() {
    MIDI.Player.pause();
  }

  resume() {
    MIDI.Player.resume();
  }

  stop() {
    MIDI.Player.stop();
  }

  readAudio() {
    this.status = 'Reading audio file...';

    this._getAudioUrlAsync()
    .then(url => {
      MIDI.Player.setAnimation(data => {
        let now = data.now < data.end ? data.now : data.end;
        now = now.toFixed(2);
        let end = data.end.toFixed(2);
        $('#currentTime').text(now);
        $('#endTime').text(end);
      });

      const onsuccess = this.apply(() => {
        this.status = `Sound being generated with ${MIDI.api} ${JSON.stringify(MIDI.supports)}`;
        this.midiPlayerReady = true;
        MIDI.Player.start();
      });

      const onprogress = this.apply((stats, percent) => {
        percent *= 100;
        this.status = `Reading audio file (${percent.toFixed(2)}%)...`;
      });

      const onerror = this.apply(e => {
        this.status = `Error: ${e.message}\n${e.stack}`;
      });

      MIDI.Player.loadFile(url, onsuccess, onprogress, onerror);
    });
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

angular.module('MidiPlaybackApp', [])
.controller('MidiPlaybackController', MidiPlaybackController)
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
