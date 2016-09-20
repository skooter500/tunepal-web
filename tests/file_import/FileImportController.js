'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

(function () {
  "use strict";
  var $$$$$$scripts$transcription$TranscriberAsync$es6lib$$WorkerPath = '/scripts/transcription/TranscriberWorker.js';

  var $$$$$$scripts$transcription$TranscriberAsync$es6lib$$TranscriberAsync = (function () {
    function $$$$$$scripts$transcription$TranscriberAsync$es6lib$$TranscriberAsync() {
      var _this = this;

      _classCallCheck(this, $$$$$$scripts$transcription$TranscriberAsync$es6lib$$TranscriberAsync);

      this._worker = new Worker($$$$$$scripts$transcription$TranscriberAsync$es6lib$$WorkerPath);
      this._worker.addEventListener('message', function (e) {
        return _this._onMessage(e);
      });
      this._callbacks = [];
      this._nextId = 0;
      this.onProgress = function () {};
    }

    _createClass($$$$$$scripts$transcription$TranscriberAsync$es6lib$$TranscriberAsync, [{
      key: 'initAsync',
      value: function initAsync(params) {
        return this._postMessageAsync({
          cmd: 'init',
          msg: params
        });
      }
    }, {
      key: 'resetSignalAsync',
      value: function resetSignalAsync() {
        return this._postMessageAsync({
          cmd: 'resetSignal'
        });
      }
    }, {
      key: 'getSignalAsync',
      value: function getSignalAsync() {
        return this._postMessageAsync({
          cmd: 'getSignal'
        });
      }
    }, {
      key: 'pushSignalAsync',
      value: function pushSignalAsync(signal) {
        return this._postMessageAsync({
          cmd: 'pushSignal',
          msg: signal
        });
      }
    }, {
      key: 'transcribeAsync',
      value: function transcribeAsync(params) {
        return this._postMessageAsync({
          cmd: 'transcribe',
          msg: params
        });
      }
    }, {
      key: 'close',
      value: function close() {
        return this._postMessageAsync({
          cmd: 'close'
        });
      }
    }, {
      key: '_postMessageAsync',
      value: function _postMessageAsync(msg) {
        var _this2 = this;

        return new Promise(function (resolve, reject) {
          var id = _this2._nextId++;
          _this2._callbacks[id] = { resolve: resolve, reject: reject };

          msg.id = id;
          _this2._worker.postMessage(msg);
        });
      }
    }, {
      key: '_onMessage',
      value: function _onMessage(e) {
        var data = e.data;

        switch (data.cmd) {
          case 'onProgress':
            this.onProgress(data.msg);
            break;
          default:
            var id = data.id;

            if (data.result == 'success') {
              this._callbacks[id].resolve(data.msg);
            } else {
              this._callbacks[id].reject(data.msg);
            }

            this._callbacks[id] = null;
        }
      }
    }]);

    return $$$$$$scripts$transcription$TranscriberAsync$es6lib$$TranscriberAsync;
  })();

  var $$$$$$scripts$transcription$TranscriberAsync$es6lib$$default = $$$$$$scripts$transcription$TranscriberAsync$es6lib$$TranscriberAsync;

  var $$BlobUtils$es6lib$$_BlobUtils = (function () {
    function $$BlobUtils$es6lib$$_BlobUtils() {
      _classCallCheck(this, $$BlobUtils$es6lib$$_BlobUtils);
    }

    _createClass($$BlobUtils$es6lib$$_BlobUtils, [{
      key: 'dataURLToBlob',
      value: function dataURLToBlob(dataURL) {
        var BASE64_MARKER = ';base64,';

        if (dataURL.indexOf(BASE64_MARKER) == -1) {
          // percent encoded
          var parts = dataURL.split(',');
          var contentType = parts[0].split(':')[1];
          var raw = parts[1];
          var numPercent = (raw.match(/%/g) || []).length;
          var _length = raw.length - numPercent * 2;
          var uInt8Array = new Uint8Array(_length);

          for (var i = 0, j = 0; i < raw.length; j++) {
            if (raw[i] === '%') {
              var code = raw.substr(i + 1, 2);
              uInt8Array[j] = parseInt(code, 16);
              i += 3;
            } else {
              uInt8Array[j] = raw.charCodeAt(i);
              i++;
            }
          }

          return new Blob([uInt8Array], { type: contentType });
        } else {
          // base64 encoded
          var parts = dataURL.split(BASE64_MARKER);
          var contentType = parts[0].split(':')[1];
          var raw = window.atob(parts[1]);
          var rawLength = raw.length;

          var uInt8Array = new Uint8Array(rawLength);

          for (var i = 0; i < rawLength; ++i) {
            uInt8Array[i] = raw.charCodeAt(i);
          }

          return new Blob([uInt8Array], { type: contentType });
        }
      }
    }]);

    return $$BlobUtils$es6lib$$_BlobUtils;
  })();

  var $$BlobUtils$es6lib$$BlobUtils = new $$BlobUtils$es6lib$$_BlobUtils();
  var $$BlobUtils$es6lib$$default = $$BlobUtils$es6lib$$BlobUtils;

  var $$CacheUtils$es6lib$$_CacheUtils = function $$CacheUtils$es6lib$$_CacheUtils() {
    _classCallCheck(this, $$CacheUtils$es6lib$$_CacheUtils);

    this.europeana = {};
    this.keywordSearch = {};
    this.notesSearch = {};
    this.tune = {};
  };

  var $$CacheUtils$es6lib$$CacheUtils = new $$CacheUtils$es6lib$$_CacheUtils();

  var $$CacheUtils$es6lib$$default = $$CacheUtils$es6lib$$CacheUtils;

  var $$DateUtils$es6lib$$_DateUtils = (function () {
    function $$DateUtils$es6lib$$_DateUtils() {
      _classCallCheck(this, $$DateUtils$es6lib$$_DateUtils);
    }

    _createClass($$DateUtils$es6lib$$_DateUtils, [{
      key: 'format',
      value: function format(timestamp) {
        var year = timestamp.getFullYear();
        var month = timestamp.getMonth() + 1;
        var day = timestamp.getDate();
        var hours = timestamp.getHours();
        var minutes = timestamp.getMinutes();
        var seconds = timestamp.getSeconds();
        return year + "-" + month + "-" + day + "%20" + hours + "%3A" + minutes + "%3A" + seconds;
      }
    }]);

    return $$DateUtils$es6lib$$_DateUtils;
  })();

  var $$DateUtils$es6lib$$DateUtils = new $$DateUtils$es6lib$$_DateUtils();

  var $$DateUtils$es6lib$$default = $$DateUtils$es6lib$$DateUtils;

  var $$LocalStorageUtils$es6lib$$_LocalStorageUtils = (function () {
    function $$LocalStorageUtils$es6lib$$_LocalStorageUtils() {
      _classCallCheck(this, $$LocalStorageUtils$es6lib$$_LocalStorageUtils);
    }

    _createClass($$LocalStorageUtils$es6lib$$_LocalStorageUtils, [{
      key: 'getItem',
      value: function getItem(key) {
        var value = localStorage.getItem(key);
        return value && JSON.parse(value);
      }
    }, {
      key: 'setItem',
      value: function setItem(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
      }
    }]);

    return $$LocalStorageUtils$es6lib$$_LocalStorageUtils;
  })();

  var $$LocalStorageUtils$es6lib$$LocalStorageUtils = new $$LocalStorageUtils$es6lib$$_LocalStorageUtils();

  var $$LocalStorageUtils$es6lib$$default = $$LocalStorageUtils$es6lib$$LocalStorageUtils;

  var $$TranscriberUtils$es6lib$$_TranscriberUtils = (function () {
    function $$TranscriberUtils$es6lib$$_TranscriberUtils() {
      _classCallCheck(this, $$TranscriberUtils$es6lib$$_TranscriberUtils);
    }

    _createClass($$TranscriberUtils$es6lib$$_TranscriberUtils, [{
      key: 'calcFrameSize',
      value: function calcFrameSize(sampleRate) {
        var idealFrameSize = sampleRate / 10;
        var prev = this.prevPow2(idealFrameSize);
        var next = prev * 2;
        return next - idealFrameSize < prev - idealFrameSize ? next : prev;
      }
    }, {
      key: 'prevPow2',
      value: function prevPow2(v) {
        return Math.pow(2, Math.floor(Math.log(v) / Math.log(2)));
      }
    }]);

    return $$TranscriberUtils$es6lib$$_TranscriberUtils;
  })();

  var $$TranscriberUtils$es6lib$$TranscriberUtils = new $$TranscriberUtils$es6lib$$_TranscriberUtils();
  var $$TranscriberUtils$es6lib$$default = $$TranscriberUtils$es6lib$$TranscriberUtils;

  var $$ViewUtils$es6lib$$_ViewUtils = (function () {
    function $$ViewUtils$es6lib$$_ViewUtils() {
      _classCallCheck(this, $$ViewUtils$es6lib$$_ViewUtils);

      this.smallScreen = 600;
      this.mediumScreen = 992;
      this.largeScreen = 1200;
    }

    _createClass($$ViewUtils$es6lib$$_ViewUtils, [{
      key: 'showSideNav',
      value: function showSideNav() {
        $('.hamburger-button').sideNav('show');
      }
    }, {
      key: 'goBack',
      value: function goBack() {
        if (history.length == 1) {
          location.replace('/#!/record');
        } else {
          history.back();
        }
      }
    }, {
      key: 'doubleEncode',
      value: function doubleEncode(component) {
        return encodeURIComponent(encodeURIComponent(component));
      }
    }, {
      key: 'initDropdown',
      value: function initDropdown() {
        $('.dropdown-button').dropdown({
          constrain_width: false
        });
      }
    }, {
      key: 'initTooltips',
      value: function initTooltips() {
        $('.tooltipped').tooltip({
          position: 'bottom',
          delay: 50
        });
      }
    }, {
      key: 'isSmall',
      get: function get() {
        return $(window).width() <= this.smallScreen;
      }
    }, {
      key: 'isMedium',
      get: function get() {
        return $(window).width() > this.smallScreen && $(window).width() <= this.mediumScreen;
      }
    }, {
      key: 'isLarge',
      get: function get() {
        return $(window).width() > this.mediumScreen;
      }
    }, {
      key: 'isMediumOrUp',
      get: function get() {
        return $(window).width() > this.smallScreen;
      }
    }, {
      key: 'isMediumOrDown',
      get: function get() {
        return $(window).width() <= this.mediumScreen;
      }

      // The "240" below is the pixels of sizeNav, see _global.scss:
      // nav, main, footer { padding-left: 240px; }
    }, {
      key: 'isLandscape',
      get: function get() {
        var windowWidth = $(window).width();
        var windowHeight = $(window).height();
        return windowWidth <= this.mediumScreen ? windowWidth > windowHeight : windowWidth - 240 > windowHeight;
      }
    }, {
      key: 'isPortrait',
      get: function get() {
        return !this.isLandscape;
      }
    }]);

    return $$ViewUtils$es6lib$$_ViewUtils;
  })();

  var $$ViewUtils$es6lib$$ViewUtils = new $$ViewUtils$es6lib$$_ViewUtils();
  var $$ViewUtils$es6lib$$default = $$ViewUtils$es6lib$$ViewUtils;

  var $$$$$$scripts$utils$Utils$es6lib$$_Utils = (function () {
    function $$$$$$scripts$utils$Utils$es6lib$$_Utils() {
      _classCallCheck(this, $$$$$$scripts$utils$Utils$es6lib$$_Utils);

      this.blob = $$BlobUtils$es6lib$$default;
      this.cache = $$CacheUtils$es6lib$$default;
      this.date = $$DateUtils$es6lib$$default;
      this.localStorage = $$LocalStorageUtils$es6lib$$default;
      this.transcriber = $$TranscriberUtils$es6lib$$default;
      this.view = $$ViewUtils$es6lib$$default;
      this.tuneCache = null;
      this.europeanaCache = null;
    }

    _createClass($$$$$$scripts$utils$Utils$es6lib$$_Utils, [{
      key: 'makeArray',
      value: function makeArray() {
        var start = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
        var end = arguments.length <= 1 || arguments[1] === undefined ? 10 : arguments[1];
        var step = arguments.length <= 2 || arguments[2] === undefined ? 1 : arguments[2];

        var array = [];
        for (var i = start; i <= end; i += step) {
          array.push(i);
        }
        return array;
      }
    }, {
      key: 'defineProperty',
      value: function defineProperty(className) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _len = arguments.length, names = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            names[_key - 1] = arguments[_key];
          }

          for (var _iterator = names[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            name = _step.value;

            Object.defineProperty(className, name, {
              get: function get() {
                return this['_' + name];
              },
              set: function set(value) {
                this['_' + name] = value;
              }
            });
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator['return']) {
              _iterator['return']();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
      }
    }, {
      key: 'createEnum',
      value: function createEnum(names) {
        var enumClass = {};
        for (var i = 0; i < names.length; i++) {
          enumClass[names[i]] = i + 1;
        }
        return enumClass;
      }
    }, {
      key: 'createPolyfills',
      value: function createPolyfills() {
        if (typeof navigator !== 'undefined') {
          navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
        }

        if (typeof window !== 'undefined') {
          window.AudioContext = window.AudioContext || window.webkitAudioContext;

          window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (callback) {
            return window.setTimeout(callback, 1000 / 60);
          };

          window.cancelAnimationFrame = window.cancelAnimationFrame || window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame || window.oCancelAnimationFrame || window.msCancelAnimationFrame || function (id) {
            window.clearTimeout(id);
          };
        }

        if (typeof AudioBuffer !== 'undefined') {
          AudioBuffer.prototype.copyToChannel = AudioBuffer.prototype.copyToChannel || function (source, channelNumber, startInChannel) {
            this.getChannelData(channelNumber).set(source, startInChannel);
          };
        }

        if (typeof Float32Array !== 'undefined') {
          Float32Array.prototype.slice = Float32Array.prototype.slice || function (begin, end) {
            begin = typeof begin !== 'undefined' ? begin : 0;
            end = typeof end !== 'undefined' ? end : this.length;

            var newArray = this.buffer.slice(4 * begin, 4 * end);
            return new Float32Array(newArray);
          };
        }
      }
    }, {
      key: 'joinSet',
      value: function joinSet(set) {
        var s = '';
        var i = 0;
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = set[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var item = _step2.value;

            if (i != 0) s += ',';
            s += item;
            i++;
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2['return']) {
              _iterator2['return']();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }

        return s;
      }
    }]);

    return $$$$$$scripts$utils$Utils$es6lib$$_Utils;
  })();

  Array.prototype.last = Array.prototype.last || function () {
    return this[this.length - 1];
  };

  var $$$$$$scripts$utils$Utils$es6lib$$Utils = new $$$$$$scripts$utils$Utils$es6lib$$_Utils();
  $$$$$$scripts$utils$Utils$es6lib$$Utils.createPolyfills();
  var $$$$$$scripts$utils$Utils$es6lib$$default = $$$$$$scripts$utils$Utils$es6lib$$Utils;

  var app$tests$file_import$FileImportController$es6$$FileImportController = (function () {
    function app$tests$file_import$FileImportController$es6$$FileImportController($scope) {
      _classCallCheck(this, app$tests$file_import$FileImportController$es6$$FileImportController);

      this.$scope = $scope;

      this._audioContext = new window.AudioContext();

      this.samples = [{ url: '/assets/a440.wav', transcription: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' }, { url: '/assets/happy-birthday.wav', transcription: 'DEDGGGGAGFFFDEDAGACAFGGEDEDDDDBAGFGECBCBAGAGFGGG' }, { url: '/assets/Gan-Ainm.ogg' }, { url: '/assets/Drowsy-Maggie.mp3' }];

      this.source = this.samples[1].url;
      this.realNotes = this.samples[1].transcription;
    }

    _createClass(app$tests$file_import$FileImportController$es6$$FileImportController, [{
      key: 'readAudio',
      value: function readAudio() {
        var _this3 = this;

        this.status = 'Reading audio file...';

        this._getAudioUrlAsync().then(this.apply(function (url) {
          $('audio').attr('src', url);

          var request = new XMLHttpRequest();
          request.open('GET', url, true);
          request.responseType = 'arraybuffer';
          request.onload = _this3.apply(function () {
            return _this3._analyzeAudio(request.response);
          });
          request.onerror = _this3.apply(function () {
            return _this3.status = 'Failed to read or download the file';
          });
          request.send();
        }));
      }
    }, {
      key: '_getAudioUrlAsync',
      value: function _getAudioUrlAsync() {
        var _this4 = this;

        return new Promise(function (resolve, reject) {
          switch (_this4.source) {
            case 'local':
              var reader = new FileReader();
              reader.onload = function (e) {
                return resolve(e.target.result);
              };
              reader.readAsDataURL(_this4.file);
              break;
            default:
              resolve(_this4.source);
              break;
          }
        });
      }
    }, {
      key: '_analyzeAudio',
      value: function _analyzeAudio(audioFile) {
        var _this5 = this;

        this.status = 'Analyzing audio file...';

        this._audioContext.decodeAudioData(audioFile, this.apply(function (audio) {
          return _this5.onAudioDecoded(audio);
        }), this.apply(function () {
          return _this5.status = 'Failed to decode the file';
        }));
      }
    }, {
      key: 'onAudioDecoded',
      value: function onAudioDecoded(audio) {
        var _this6 = this;

        this._audio = audio;
        this._signal = audio.getChannelData(0);

        var transcriber = new $$$$$$scripts$transcription$TranscriberAsync$es6lib$$default();
        var initParams = {
          inputSampleRate: audio.sampleRate,
          sampleTime: audio.duration,
          fundamental: 'D',
          enableSampleRateConversion: this.enableSampleRateConversion
        };
        var transcribeParams = {
          signal: this._signal,
          midi: false
        };

        transcriber.initAsync(initParams).then(function () {
          return transcriber.transcribeAsync(transcribeParams);
        }).then(this.apply(function (result) {
          _this6.result = result;

          _this6.transcription = result.transcription;
          _this6.sampleRate = audio.sampleRate;
          _this6.duration = audio.duration;

          _this6.convertedSampleRate = _this6.enableSampleRateConversion ? result.sampleRate : 'Disabled';

          return transcriber.getSignalAsync();
        })).then(this.apply(function (signal) {
          _this6._resampledSignal = signal;
          _this6._resampledAudio = _this6._audioContext.createBuffer(1, _this6.result.numSamples, _this6.result.sampleRate);
          _this6._resampledAudio.copyToChannel(signal, 0);
          _this6.status = 'Succeeded';
        }));
      }
    }, {
      key: 'playSignal',
      value: function playSignal() {
        var _this7 = this;

        if (this.signalPlayer) {
          this.signalPlayer.stop(0);
          this.signalPlayer = null;
        } else {
          this.signalPlayer = this._audioContext.createBufferSource();
          this.signalPlayer.buffer = this._audio;
          this.signalPlayer.connect(this._audioContext.destination);
          this.signalPlayer.onended = this.apply(function () {
            return _this7.signalPlayer = null;
          });
          this.signalPlayer.start(0, 0, this._audio.duration);
        }
      }
    }, {
      key: 'playResampledSignal',
      value: function playResampledSignal() {
        var _this8 = this;

        if (this.resampledPlayer) {
          this.resampledPlayer.stop(0);
          this.resampledPlayer = null;
        } else {
          this.resampledPlayer = this._audioContext.createBufferSource();
          this.resampledPlayer.buffer = this._resampledAudio;
          this.resampledPlayer.connect(this._audioContext.destination);
          this.resampledPlayer.onended = this.apply(function () {
            return _this8.resampledPlayer = null;
          });
          this.resampledPlayer.start(0, 0, this._resampledAudio.duration);
        }
      }
    }, {
      key: 'downloadSignal',
      value: function downloadSignal() {
        var blob = new Blob([this._signal], { type: 'application/octet-stream' });
        saveAs(blob, 'happy-birthday-insignal.bin');
      }
    }, {
      key: 'downloadResampledSignal',
      value: function downloadResampledSignal() {
        var blob = new Blob([this._resampledSignal], { type: 'application/octet-stream' });
        saveAs(blob, 'happy-birthday-outsignal.bin');
      }

      // apply() is used to execute an expression in angular from outside of the angular framework.
      // See https://docs.angularjs.org/api/ng/type/$rootScope.Scope#$apply
    }, {
      key: 'apply',
      value: function apply(func) {
        return this.$scope.$apply.bind(this.$scope, func);
      }
    }]);

    return app$tests$file_import$FileImportController$es6$$FileImportController;
  })();

  var app$tests$file_import$FileImportController$es6$$default = app$tests$file_import$FileImportController$es6$$FileImportController;

  angular.module('FileImportApp', []).controller('FileImportController', app$tests$file_import$FileImportController$es6$$FileImportController).directive('myfile', [function () {
    return {
      scope: {
        myfile: '='
      },
      link: function link(scope, element, attributes) {
        element.bind('change', function (changeEvent) {
          scope.$apply(function () {
            return scope.myfile = changeEvent.target.files[0];
          });
        });
      }
    };
  }]);
}).call(undefined);