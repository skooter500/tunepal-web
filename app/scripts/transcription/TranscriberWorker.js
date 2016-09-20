'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

(function () {
  "use strict";

  var $$FuzzyHistogram$es6lib$$FuzzyHistogram = (function () {
    function $$FuzzyHistogram$es6lib$$FuzzyHistogram() {
      _classCallCheck(this, $$FuzzyHistogram$es6lib$$FuzzyHistogram);
    }

    _createClass($$FuzzyHistogram$es6lib$$FuzzyHistogram, null, [{
      key: 'calculatePeek',
      value: function calculatePeek(data, fuzz, atLeast) {
        var duration = 0;
        var candidateLengths = [];

        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = data[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var item = _step.value;

            var found = false;

            for (var j = 0; j < candidateLengths.length; j++) {
              var current = candidateLengths[j];
              var upper = current.value * (1.0 + fuzz);
              var lower = current.value * (1.0 - fuzz);

              if (item >= lower && item <= upper) {
                found = true;
                current.count += 2;
                current.value = (current.value * (current.count - 1) + item) / current.count;
                candidateLengths[j] = current;
                break;
              }
            }

            if (!found) {
              candidateLengths.push({
                value: item,
                count: 1
              });
            }
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

        candidateLengths.sort(function (a, b) {
          return b.count - a.count;
        });

        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = candidateLengths[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var candidate = _step2.value;

            var _duration = candidate.value;
            if (_duration >= atLeast) {
              return _duration;
            }
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

        return atLeast;
      }
    }]);

    return $$FuzzyHistogram$es6lib$$FuzzyHistogram;
  })();

  var $$FuzzyHistogram$es6lib$$default = $$FuzzyHistogram$es6lib$$FuzzyHistogram;

  var $$PitchDetector$es6lib$$PitchDetector = (function () {
    function $$PitchDetector$es6lib$$PitchDetector() {
      _classCallCheck(this, $$PitchDetector$es6lib$$PitchDetector);
    }

    _createClass($$PitchDetector$es6lib$$PitchDetector, null, [{
      key: 'mikelsFrequency',
      value: function mikelsFrequency(fftMag, sampleRate, frameSize) {
        var frequency = 0;
        var pitchPeek = 2;

        var peaks = $$PitchDetector$es6lib$$PitchDetector._calculatePeaks(fftMag, pitchPeek, fftMag.length, 0);

        peaks.sort(function (a, b) {
          return fftMag[b] - fftMag[a];
        });

        var NUM_CANDIDATES = 5;
        var NUM_HARMONICS = 10;
        var maxEnergy = 0;
        var maxCandidate = 0;
        var binWidth = sampleRate / frameSize;

        for (var i = 0; i < NUM_CANDIDATES; i++) {
          var candidate = peaks[i];
          var energy = 0;

          for (var j = 0; j < NUM_HARMONICS; j++) {
            var harmonic = candidate + j * candidate;
            var hLow = harmonic - 2;
            var hHigh = harmonic + 2;
            var maxLittleBit = -1;

            for (var k = hLow; k <= hHigh; k++) {
              if (k < fftMag.length) {
                if (fftMag[k] > maxLittleBit) {
                  maxLittleBit = fftMag[k];
                }
              }
            }

            energy += maxLittleBit;
          }

          if (energy > maxEnergy) {
            maxEnergy = energy;
            maxCandidate = candidate;
          }
        }

        frequency = maxCandidate * binWidth;
        return frequency;
      }
    }, {
      key: '_calculatePeaks',
      value: function _calculatePeaks(data, border, howFar, thresholdNormal) {
        var thresholdValue = 0;

        if (thresholdNormal > 0) {
          for (var i = 0; i < howFar; i++) {
            if (data[i] > thresholdValue) {
              thresholdValue = data[i];
            }
          }
        }

        thresholdValue *= thresholdNormal;
        var peaks = [];

        if (howFar >= border) {
          for (var i = border; i < howFar - border; i++) {
            var addPeak = true;

            if (data[i] >= thresholdValue) {
              for (var j = 0; j < border; j++) {
                if (data[i] < data[i - j] || data[i] < data[i + j]) {
                  addPeak = false;
                  break;
                }
              }
            } else {
              addPeak = false;
            }

            if (addPeak) {
              peaks.push(i);
            }
          }
        }

        return peaks;
      }
    }]);

    return $$PitchDetector$es6lib$$PitchDetector;
  })();

  var $$PitchDetector$es6lib$$default = $$PitchDetector$es6lib$$PitchDetector;

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

  var $$$utils$Utils$es6lib$$_Utils = (function () {
    function $$$utils$Utils$es6lib$$_Utils() {
      _classCallCheck(this, $$$utils$Utils$es6lib$$_Utils);

      this.blob = $$BlobUtils$es6lib$$default;
      this.cache = $$CacheUtils$es6lib$$default;
      this.date = $$DateUtils$es6lib$$default;
      this.localStorage = $$LocalStorageUtils$es6lib$$default;
      this.transcriber = $$TranscriberUtils$es6lib$$default;
      this.view = $$ViewUtils$es6lib$$default;
      this.tuneCache = null;
      this.europeanaCache = null;
    }

    _createClass($$$utils$Utils$es6lib$$_Utils, [{
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
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          for (var _len = arguments.length, names = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            names[_key - 1] = arguments[_key];
          }

          for (var _iterator3 = names[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            name = _step3.value;

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
          _didIteratorError3 = true;
          _iteratorError3 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion3 && _iterator3['return']) {
              _iterator3['return']();
            }
          } finally {
            if (_didIteratorError3) {
              throw _iteratorError3;
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
        var _iteratorNormalCompletion4 = true;
        var _didIteratorError4 = false;
        var _iteratorError4 = undefined;

        try {
          for (var _iterator4 = set[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
            var item = _step4.value;

            if (i != 0) s += ',';
            s += item;
            i++;
          }
        } catch (err) {
          _didIteratorError4 = true;
          _iteratorError4 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion4 && _iterator4['return']) {
              _iterator4['return']();
            }
          } finally {
            if (_didIteratorError4) {
              throw _iteratorError4;
            }
          }
        }

        return s;
      }
    }]);

    return $$$utils$Utils$es6lib$$_Utils;
  })();

  Array.prototype.last = Array.prototype.last || function () {
    return this[this.length - 1];
  };

  var $$$utils$Utils$es6lib$$Utils = new $$$utils$Utils$es6lib$$_Utils();
  $$$utils$Utils$es6lib$$Utils.createPolyfills();
  var $$$utils$Utils$es6lib$$default = $$$utils$Utils$es6lib$$Utils;

  var $$PitchSpeller$es6lib$$PitchSpeller = (function () {
    _createClass($$PitchSpeller$es6lib$$PitchSpeller, [{
      key: 'fundamental',
      get: function get() {
        return this._fundamental;
      },
      set: function set(value) {
        this._fundamental = value;
        this._fundamentalFrequency = $$PitchSpeller$es6lib$$PitchSpeller.FUNDAMENTAL_FREQUENCIES[value];
      }
    }]);

    function $$PitchSpeller$es6lib$$PitchSpeller() {
      var fundamental = arguments.length <= 0 || arguments[0] === undefined ? 'D' : arguments[0];
      var mode = arguments.length <= 1 || arguments[1] === undefined ? 'major' : arguments[1];

      _classCallCheck(this, $$PitchSpeller$es6lib$$PitchSpeller);

      this.fundamental = fundamental;

      this._pitchModel = $$PitchSpeller$es6lib$$PitchSpeller.PitchModel.FLUTE;
      this._knownFrequencies = new Array($$PitchSpeller$es6lib$$PitchSpeller.ABC_NOTE_RANGE);
      this._midiNotes = new Array($$PitchSpeller$es6lib$$PitchSpeller.MIDI_NOTE_RANGE);

      this._makeScale(mode);
      this._makeMidiNotes();
    }

    _createClass($$PitchSpeller$es6lib$$PitchSpeller, [{
      key: '_makeScale',
      value: function _makeScale(mode) {
        // W - W - H - W - W - H - H - H
        var majorKeyIntervals = [1, 2, 4, 5];

        if (mode == 'major') {
          if (this._pitchModel == $$PitchSpeller$es6lib$$PitchSpeller.PitchModel.FLUTE) {
            this._knownFrequencies[0] = this._fundamentalFrequency / Math.pow($$PitchSpeller$es6lib$$PitchSpeller.RATIO, 12);
          } else {
            // Use the whistle pitch model
            this._knownFrequencies[0] = this._fundamentalFrequency;
          }

          // W - W - H - W - W - W - H
          for (var i = 1; i < this._knownFrequencies.length; i++) {
            if ($$PitchSpeller$es6lib$$PitchSpeller._isWholeToneInterval(i, majorKeyIntervals)) {
              this._knownFrequencies[i] = this._knownFrequencies[i - 1] * $$PitchSpeller$es6lib$$PitchSpeller.RATIO_SQUARED;
            } else {
              this._knownFrequencies[i] = this._knownFrequencies[i - 1] * $$PitchSpeller$es6lib$$PitchSpeller.RATIO;
            }
          }
        }
      }
    }, {
      key: '_makeMidiNotes',
      value: function _makeMidiNotes() {
        this._midiNotes[0] = 27.5;

        for (var i = 1; i < this._midiNotes.length; i++) {
          this._midiNotes[i] = this._midiNotes[i - 1] * $$PitchSpeller$es6lib$$PitchSpeller.RATIO;
        }
      }
    }, {
      key: 'spellFrequency',
      value: function spellFrequency(frequency) {
        var minIndex = 0;
        var minDiff = Number.MAX_VALUE;

        if (frequency < this._knownFrequencies[0] || frequency > this._knownFrequencies.last()) {
          return 'Z';
        }

        for (var i = 0; i < this._knownFrequencies.length; i++) {
          var difference = Math.abs(frequency - this._knownFrequencies[i]);
          if (difference < minDiff) {
            minIndex = i;
            minDiff = difference;
          }
        }

        return $$PitchSpeller$es6lib$$PitchSpeller.NOTE_NAMES[minIndex];
      }
    }, {
      key: 'spellFrequencyAsMidi',
      value: function spellFrequencyAsMidi(frequency) {
        var minIndex = 0;
        var minDiff = Number.MAX_VALUE;

        if (frequency < this._midiNotes[0] || frequency > this._midiNotes.last()) {
          return 'Z';
        }

        for (var i = 0; i < this._midiNotes.length; i++) {
          var difference = abs(frequency - this._midiNotes[i]);
          if (difference < minDiff) {
            minIndex = i;
            minDiff = difference;
          }
        }

        minIndex += $$PitchSpeller$es6lib$$PitchSpeller.MIDI_OFFSET;
        return minIndex.toString();
      }
    }], [{
      key: '_isWholeToneInterval',
      value: function _isWholeToneInterval(n, intervals) {
        n %= 8;
        return intervals.some(function (interval) {
          return interval == n;
        });
      }
    }]);

    return $$PitchSpeller$es6lib$$PitchSpeller;
  })();

  var $$PitchSpeller$es6lib$$default = $$PitchSpeller$es6lib$$PitchSpeller;

  $$PitchSpeller$es6lib$$PitchSpeller.PitchModel = $$$utils$Utils$es6lib$$default.createEnum(['FLUTE', 'WHISTLE']);

  $$PitchSpeller$es6lib$$PitchSpeller.RANGE = 0.1;
  $$PitchSpeller$es6lib$$PitchSpeller.RATIO = 1.05946309436;
  $$PitchSpeller$es6lib$$PitchSpeller.RATIO_SQUARED = $$PitchSpeller$es6lib$$PitchSpeller.RATIO * $$PitchSpeller$es6lib$$PitchSpeller.RATIO;
  $$PitchSpeller$es6lib$$PitchSpeller.ABC_NOTE_RANGE = 33;
  $$PitchSpeller$es6lib$$PitchSpeller.MIDI_NOTE_RANGE = 87;
  $$PitchSpeller$es6lib$$PitchSpeller.MIDI_OFFSET = 21;

  $$PitchSpeller$es6lib$$PitchSpeller.NOTE_NAMES = ['D', 'E', 'F', 'G', 'A', 'B', 'C', 'C', 'D', 'E', 'F', 'G', 'A', 'B', 'C', 'C', 'D', 'E', 'F', 'G', 'A', 'B', 'C', 'C', 'D', 'E', 'F', 'G', 'A', 'B', 'C', 'C', 'D'];

  $$PitchSpeller$es6lib$$PitchSpeller.FUNDAMENTAL_FREQUENCIES = {
    Bb: 233.08,
    B: 246.94,
    C: 261.63,
    D: 293.66,
    Eb: 311.13,
    F: 349.23,
    G: 392.00
  };

  var $$Transcriber$es6lib$$Transcriber = (function () {
    _createClass($$Transcriber$es6lib$$Transcriber, [{
      key: 'inputSampleRate',
      get: function get() {
        return this._inputSampleRate;
      }
    }, {
      key: 'sampleTime',
      get: function get() {
        return this._sampleTime;
      }
    }, {
      key: 'blankTime',
      get: function get() {
        return this._blankTime;
      }
    }, {
      key: 'fundamental',
      get: function get() {
        return this._fundamental;
      }
    }, {
      key: 'enableSampleRateConversion',
      get: function get() {
        return this._enableSampleRateConversion;
      }
    }, {
      key: 'progress',
      get: function get() {
        return this._progress;
      }
    }, {
      key: 'interrupted',
      get: function get() {
        return this._interrupted;
      }
    }, {
      key: 'signal',
      get: function get() {
        return this._signal;
      }
    }, {
      key: 'outputSampleRate',
      get: function get() {
        return this._outputSampleRate;
      }
    }, {
      key: 'numInputSamples',
      get: function get() {
        return this._numInputSamples;
      }
    }, {
      key: 'numOutputSamples',
      get: function get() {
        return this._numOutputSamples;
      }
    }]);

    function $$Transcriber$es6lib$$Transcriber(params) {
      _classCallCheck(this, $$Transcriber$es6lib$$Transcriber);

      this._inputSampleRate = typeof params.inputSampleRate !== 'undefined' ? params.inputSampleRate : $$Transcriber$es6lib$$Transcriber.DEFAULT_SAMPLE_RATE;

      this._sampleTime = typeof params.sampleTime !== 'undefined' ? params.sampleTime : $$Transcriber$es6lib$$Transcriber.DEFAULT_SAMPLE_TIME;

      this._blankTime = typeof params.blankTime !== 'undefined' ? params.blankTime : $$Transcriber$es6lib$$Transcriber.DEFAULT_BLANK_TIME;

      this._fundamental = typeof params.fundamental !== 'undefined' ? params.fundamental : $$Transcriber$es6lib$$Transcriber.DEFAULT_FUNDAMENTAL;

      this._enableSampleRateConversion = typeof params.enableSampleRateConversion !== 'undefined' ? params.enableSampleRateConversion : false;

      this._frameSize = typeof params.frameSize !== 'undefined' ? params.frameSize : $$Transcriber$es6lib$$Transcriber.DEFAULT_FRAME_SIZE;

      this.onProgress = typeof params.onProgress !== 'undefined' ? params.onProgress : function () {};

      if (this._enableSampleRateConversion) {
        this._outputSampleRate = $$Transcriber$es6lib$$Transcriber.DEFAULT_SAMPLE_RATE;
      } else {
        this._outputSampleRate = this._inputSampleRate;
      }

      this._numInputSamples = this._inputSampleRate * (this._blankTime + this._sampleTime);
      this._numOutputSamples = this._outputSampleRate * (this._blankTime + this._sampleTime);

      if (this._frameSize === 'auto') {
        this._frameSize = $$$utils$Utils$es6lib$$default.transcriber.calcFrameSize(this._outputSampleRate);
      }

      this._hopSize = this._frameSize * (1 - $$Transcriber$es6lib$$Transcriber.OVERLAP);

      console.log('Frame size and hop size:', this._frameSize, this._hopSize);

      this._windowFunction = new WindowFunction(DSP.HANN);
      this._powerSpectrum = new FFT(this._frameSize, this._outputSampleRate);
    }

    _createClass($$Transcriber$es6lib$$Transcriber, [{
      key: 'transcribe',
      value: function transcribe(signal) {
        var midi = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

        if (this._enableSampleRateConversion) {
          this._signal = this._convertSampleRate(signal);
        } else {
          this._signal = signal;
        }

        var speller = new $$PitchSpeller$es6lib$$default(this._fundamental);
        var numHops = Math.floor((this._outputSampleRate * this._sampleTime - this._frameSize) / this._hopSize) + 1;
        var notes = [];
        var lastNote = '';
        var numBlankSamples = this._blankTime * this._outputSampleRate;

        for (var i = 0; i < numHops; i++) {
          if (this._interrupted) {
            return '';
          }

          var startAt = numBlankSamples + this._hopSize * i;
          this._progress = i / numHops;
          this.onProgress(this._progress);

          var frame = this._signal.slice(startAt, startAt + this._frameSize);

          this._windowFunction.process(frame);
          var spectrum = this._powerSpectrum.forward(frame);

          var frequency = $$PitchDetector$es6lib$$default.mikelsFrequency(spectrum, this._outputSampleRate, this._frameSize);

          var currentNote = midi ? speller.spellFrequencyAsMidi(frequency) : speller.spellFrequency(frequency);

          if (currentNote != lastNote) {
            lastNote = currentNote;
            var note = {
              spelling: currentNote,
              frequency: frequency,
              onset: startAt / this._outputSampleRate
            };
            notes.push(note);
          }
        }

        var transcription = this._postProcess(notes, midi);
        return transcription;
      }
    }, {
      key: '_convertSampleRate',
      value: function _convertSampleRate(inSignal) {
        var outSignal = new Float32Array(this.numOutputSamples);
        var end = 0;

        for (var i = 0; i < outSignal.length; i++) {
          //TODO: smooth interpolation
          var begin = end;
          end = Math.floor((i + 1) * this._inputSampleRate / this._outputSampleRate);
          var sum = 0;

          for (var j = begin; j < end; j++) {
            sum += inSignal[j];
          }

          outSignal[i] = sum / (end - begin);
        }

        return outSignal;
      }
    }, {
      key: '_postProcess',
      value: function _postProcess(notes, midi) {
        var transcription = '';

        for (var i = 0; i < notes.length - 1; i++) {
          notes[i].duration = notes[i + 1].onset - notes[i].onset;
          if (notes[i].duration < 0) console.log(notes[i + 1].onset, notes[i].onset);
        }

        notes.last().duration = this._blankTime + this._sampleTime - notes.last().onset;

        var durations = new Array(notes.length);
        for (var i = 0; i < notes.length; i++) {
          durations[i] = notes[i].duration;
        }

        var quaverLength = $$FuzzyHistogram$es6lib$$default.calculatePeek(durations, 0.33, 0.1);

        var _iteratorNormalCompletion5 = true;
        var _didIteratorError5 = false;
        var _iteratorError5 = undefined;

        try {
          for (var _iterator5 = notes[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
            var note = _step5.value;

            if (note.spelling == 'Z') continue;

            note.qq = Math.round(note.duration / quaverLength);

            var spelling = note.spelling;
            if (midi) spelling += ',';
            spelling = spelling.repeat(note.qq);

            transcription += spelling;
          }
        } catch (err) {
          _didIteratorError5 = true;
          _iteratorError5 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion5 && _iterator5['return']) {
              _iterator5['return']();
            }
          } finally {
            if (_didIteratorError5) {
              throw _iteratorError5;
            }
          }
        }

        return transcription;
      }
    }]);

    return $$Transcriber$es6lib$$Transcriber;
  })();

  var $$Transcriber$es6lib$$default = $$Transcriber$es6lib$$Transcriber;

  $$Transcriber$es6lib$$Transcriber.DEFAULT_SAMPLE_RATE = 22050;
  $$Transcriber$es6lib$$Transcriber.DEFAULT_SAMPLE_TIME = 12;
  $$Transcriber$es6lib$$Transcriber.DEFAULT_BLANK_TIME = 2;
  $$Transcriber$es6lib$$Transcriber.DEFAULT_FUNDAMENTAL = 'D';
  $$Transcriber$es6lib$$Transcriber.DEFAULT_FRAME_SIZE = 'auto';
  $$Transcriber$es6lib$$Transcriber.OVERLAP = 0.75;
  var app$scripts$transcription$TranscriberWorker$es6$$ScriptPaths = ['/lib/dsp.js/dsp.js', '/lib/babel/browser-polyfill.js'];

  var app$scripts$transcription$TranscriberWorker$es6$$TranscriberWorker = (function () {
    function app$scripts$transcription$TranscriberWorker$es6$$TranscriberWorker() {
      var _this = this;

      _classCallCheck(this, app$scripts$transcription$TranscriberWorker$es6$$TranscriberWorker);

      for (var i = 0; i < app$scripts$transcription$TranscriberWorker$es6$$ScriptPaths.length; i++) {
        importScripts(app$scripts$transcription$TranscriberWorker$es6$$ScriptPaths[i]);
      }

      self.addEventListener('message', function (e) {
        return _this.onMessage(e);
      });
    }

    _createClass(app$scripts$transcription$TranscriberWorker$es6$$TranscriberWorker, [{
      key: 'onMessage',
      value: function onMessage(e) {
        var _this2 = this;

        var data = e.data;
        var msg = data.msg || {};
        var result = 'success';
        var resultMsg = undefined;

        switch (data.cmd) {
          case 'init':
            msg.onProgress = function (progress) {
              return _this2._onProgress(progress);
            };
            this._transcriber = new $$Transcriber$es6lib$$default(msg);
            this._resetSignal();
            break;
          case 'resetSignal':
            this._resetSignal();
            break;
          case 'getSignal':
            resultMsg = this._transcriber.signal;
            break;
          case 'pushSignal':
            resultMsg = this._pushSignal(msg);
            break;
          case 'transcribe':
            var signal = typeof msg.signal !== 'undefined' ? msg.signal : this._mergeSignal();
            var midi = typeof msg.midi !== 'undefined' ? msg.midi : false;

            var transcription = this._transcriber.transcribe(signal, midi);

            resultMsg = {
              transcription: transcription,
              sampleRate: this._transcriber.outputSampleRate,
              numSamples: this._transcriber.numOutputSamples
            };
            break;
          case 'close':
            self.close();
            break;
        }

        postMessage({
          id: data.id,
          cmd: data.cmd,
          result: result,
          msg: resultMsg
        });
      }
    }, {
      key: '_onProgress',
      value: function _onProgress(progress) {
        postMessage({
          cmd: 'onProgress',
          msg: progress
        });
      }
    }, {
      key: '_resetSignal',
      value: function _resetSignal() {
        this._signal = [];
        this._currNumSamples = 0;
      }
    }, {
      key: '_pushSignal',
      value: function _pushSignal(signal) {
        this._signal.push(signal);
        this._currNumSamples += signal.length;

        var largest = Number.MIN_VALUE;

        var _iteratorNormalCompletion6 = true;
        var _didIteratorError6 = false;
        var _iteratorError6 = undefined;

        try {
          for (var _iterator6 = signal[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
            var sample = _step6.value;

            if (sample > largest) largest = sample;
          }
        } catch (err) {
          _didIteratorError6 = true;
          _iteratorError6 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion6 && _iterator6['return']) {
              _iterator6['return']();
            }
          } finally {
            if (_didIteratorError6) {
              throw _iteratorError6;
            }
          }
        }

        return {
          amplitude: largest,
          timeRecorded: this._currNumSamples / this._transcriber.inputSampleRate,
          isBufferFull: this._currNumSamples >= this._transcriber.numInputSamples
        };
      }
    }, {
      key: '_mergeSignal',
      value: function _mergeSignal() {
        var length = this._transcriber.numInputSamples;
        var signal = new Float32Array(length);
        var currNumSamples = 0;

        var _iteratorNormalCompletion7 = true;
        var _didIteratorError7 = false;
        var _iteratorError7 = undefined;

        try {
          for (var _iterator7 = this._signal[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
            var buffer = _step7.value;

            var newNumSamples = currNumSamples + buffer.length;

            if (newNumSamples <= length) {
              signal.set(buffer, currNumSamples);
            } else {
              signal.set(buffer.subarray(0, length - currNumSamples), currNumSamples);
            }

            currNumSamples = newNumSamples;
          }
        } catch (err) {
          _didIteratorError7 = true;
          _iteratorError7 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion7 && _iterator7['return']) {
              _iterator7['return']();
            }
          } finally {
            if (_didIteratorError7) {
              throw _iteratorError7;
            }
          }
        }

        return signal;
      }
    }]);

    return app$scripts$transcription$TranscriberWorker$es6$$TranscriberWorker;
  })();

  var app$scripts$transcription$TranscriberWorker$es6$$default = app$scripts$transcription$TranscriberWorker$es6$$TranscriberWorker;

  // Web workers only work in the Web worker environment
  // where window is undefined
  if (typeof window === 'undefined') {
    new app$scripts$transcription$TranscriberWorker$es6$$TranscriberWorker();
  }
}).call(undefined);