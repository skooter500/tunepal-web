'use strict';

var _get = function get(_x11, _x12, _x13) { var _again = true; _function: while (_again) { var object = _x11, property = _x12, receiver = _x13; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x11 = parent; _x12 = property; _x13 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  "use strict";

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

  var $$utils$Utils$es6lib$$_Utils = (function () {
    function $$utils$Utils$es6lib$$_Utils() {
      _classCallCheck(this, $$utils$Utils$es6lib$$_Utils);

      this.blob = $$BlobUtils$es6lib$$default;
      this.cache = $$CacheUtils$es6lib$$default;
      this.date = $$DateUtils$es6lib$$default;
      this.localStorage = $$LocalStorageUtils$es6lib$$default;
      this.transcriber = $$TranscriberUtils$es6lib$$default;
      this.view = $$ViewUtils$es6lib$$default;
      this.tuneCache = null;
      this.europeanaCache = null;
    }

    _createClass($$utils$Utils$es6lib$$_Utils, [{
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

    return $$utils$Utils$es6lib$$_Utils;
  })();

  Array.prototype.last = Array.prototype.last || function () {
    return this[this.length - 1];
  };

  var $$utils$Utils$es6lib$$Utils = new $$utils$Utils$es6lib$$_Utils();
  $$utils$Utils$es6lib$$Utils.createPolyfills();
  var $$utils$Utils$es6lib$$default = $$utils$Utils$es6lib$$Utils;

  var $$pages$_navbar$NavbarController$es6lib$$NavbarController = function $$pages$_navbar$NavbarController$es6lib$$NavbarController() {
    _classCallCheck(this, $$pages$_navbar$NavbarController$es6lib$$NavbarController);

    this.utils = $$utils$Utils$es6lib$$default;
  };

  var $$pages$_navbar$NavbarController$es6lib$$default = $$pages$_navbar$NavbarController$es6lib$$NavbarController;

  var $$pages$_preloader$PreloaderController$es6lib$$PreloaderController = function $$pages$_preloader$PreloaderController$es6lib$$PreloaderController() {
    _classCallCheck(this, $$pages$_preloader$PreloaderController$es6lib$$PreloaderController);
  };

  var $$pages$_preloader$PreloaderController$es6lib$$default = $$pages$_preloader$PreloaderController$es6lib$$PreloaderController;

  var $$Directive$es6lib$$Directive = function $$Directive$es6lib$$Directive(app) {
    _classCallCheck(this, $$Directive$es6lib$$Directive);

    app.directive('tpNavbar', function () {
      return {
        scope: {
          title: '@',
          goBack: '@'
        },
        controller: $$pages$_navbar$NavbarController$es6lib$$default,
        controllerAs: 'navbar',
        templateUrl: 'scripts/pages/_navbar/navbar.html'
      };
    });

    app.directive('tpPreloader', function () {
      return {
        scope: {
          size: '@'
        },
        controller: $$pages$_preloader$PreloaderController$es6lib$$default,
        controllerAs: 'preloader',
        templateUrl: 'scripts/pages/_preloader/preloader.html'
      };
    });
  };

  var $$Directive$es6lib$$default = $$Directive$es6lib$$Directive;

  var $$$$$$ControllerBase$es6lib$$ControllerBase = (function () {
    function $$$$$$ControllerBase$es6lib$$ControllerBase($scope) {
      _classCallCheck(this, $$$$$$ControllerBase$es6lib$$ControllerBase);

      this.$scope = $scope; // view model
    }

    _createClass($$$$$$ControllerBase$es6lib$$ControllerBase, [{
      key: 'apply',
      value: function apply(func) {
        var that = arguments.length <= 1 || arguments[1] === undefined ? this : arguments[1];

        var wrap = function wrap() {
          var args = arguments;
          return this.$scope.$apply(function () {
            return func.apply(that, args);
          });
        };
        return wrap.bind(this);
      }

      // a failed implementation of apply :(
    }, {
      key: 'applyFailed',
      value: function applyFailed(func) {
        return this.$scope.$apply.bind(this.$scope, func);
      }
    }, {
      key: '_calcPages',
      value: function _calcPages(results, pageSize) {
        var pages = new Array(Math.ceil(results.length / pageSize));

        if (pages.length <= 0) {
          return pages;
        }

        for (var i = 0; i < pages.length; i++) {
          pages[i] = {
            startIndex: i * pageSize,
            start: i * pageSize + 1,
            end: (i + 1) * pageSize
          };
        }

        pages[pages.length - 1].end = results.length;

        return pages;
      }
    }]);

    return $$$$$$ControllerBase$es6lib$$ControllerBase;
  })();

  var $$$$$$ControllerBase$es6lib$$default = $$$$$$ControllerBase$es6lib$$ControllerBase;

  var $$models$Fundamentals$es6lib$$default = ['Bb', 'B', 'C', 'D', 'Eb', 'F', 'G'];

  var $$models$MidiInstruments$es6lib$$default = ['Acoustic Grand Piano', 'Bright Acoustic Piano', 'Electric Grand Piano', 'Honky-tonk Piano', 'Electric Piano 1', 'Electric Piano 2', 'Harpsichord', 'Clavi', 'Celesta', 'Glockenspiel', 'Music Box', 'Vibraphone', 'Marimba', 'Xylophone', 'Tubular Bells', 'Dulcimer', 'Drawbar Organ', 'Percussive Organ', 'Rock Organ', 'Church Organ', 'Reed Organ', 'Accordion', 'Harmonica', 'Tango Accordion', 'Acoustic Guitar (nylon)', 'Acoustic Guitar (steel)', 'Electric Guitar (jazz)', 'Electric Guitar (clean)', 'Electric Guitar (muted)', 'Overdriven Guitar', 'Distortion Guitar', 'Guitar harmonics', 'Acoustic Bass', 'Electric Bass (finger)', 'Electric Bass (pick)', 'Fretless Bass', 'Slap Bass 1', 'Slap Bass 2', 'Synth Bass 1', 'Synth Bass 2', 'Violin', 'Viola', 'Cello', 'Contrabass', 'Tremolo Strings', 'Pizzicato Strings', 'Orchestral Harp', 'Timpani', 'String Ensemble 1', 'String Ensemble 2', 'SynthStrings 1', 'SynthStrings 2', 'Choir Aahs', 'Voice Oohs', 'Synth Voice', 'Orchestra Hit', 'Trumpet', 'Trombone', 'Tuba', 'Muted Trumpet', 'French Horn', 'Brass Section', 'SynthBrass 1', 'SynthBrass 2', 'Soprano Sax', 'Alto Sax', 'Tenor Sax', 'Baritone Sax', 'Oboe', 'English Horn', 'Bassoon', 'Clarinet', 'Piccolo', 'Flute', 'Recorder', 'Pan Flute', 'Blown Bottle', 'Shakuhachi', 'Whistle', 'Ocarina', 'Lead 1 (square)', 'Lead 2 (sawtooth)', 'Lead 3 (calliope)', 'Lead 4 (chiff)', 'Lead 5 (charang)', 'Lead 6 (voice)', 'Lead 7 (fifths)', 'Lead 8 (bass + lead)', 'Pad 1 (new age)', 'Pad 2 (warm)', 'Pad 3 (polysynth)', 'Pad 4 (choir)', 'Pad 5 (bowed)', 'Pad 6 (metallic)', 'Pad 7 (halo)', 'Pad 8 (sweep)', 'FX 1 (rain)', 'FX 2 (soundtrack)', 'FX 3 (crystal)', 'FX 4 (atmosphere)', 'FX 5 (brightness)', 'FX 6 (goblins)', 'FX 7 (echoes)', 'FX 8 (sci-fi)', 'Sitar', 'Banjo', 'Shamisen', 'Koto', 'Kalimba', 'Bag pipe', 'Fiddle', 'Shanai', 'Tinkle Bell', 'Agogo', 'Steel Drums', 'Woodblock', 'Taiko Drum', 'Melodic Tom', 'Synth Drum', 'Reverse Cymbal', 'Guitar Fret Noise', 'Breath Noise', 'Seashore', 'Bird Tweet', 'Telephone Ring', 'Helicopter', 'Applause', 'Gunshot'];

  var $$models$TimeSignatures$es6lib$$default = {
    "all": "All",
    "reels": "C, C|,  4/4,  2/4,  2/2, 4/2 - Reels, hornpipes, polkas etc.",
    "jigs": "6/8, 12/8 - Jigs, slides etc.",
    "slip_jigs": "9/8 - Slip Jigs, hop jigs",
    "waltzes": "3/4 - Waltzes, mazurkas, polskas, minuets etc.",
    "unusual_jigs": "3/8 - Unusual Jigs &amp; Waltzes",
    "unusual_hornpipes": "3/2, 6/4 - Unusual English hornpipes and country dances"
  };

  var $$models$TranscriberFrameSizes$es6lib$$default = ['auto', '2048', '4096'];

  var $$$$$$models$Tunebook$es6lib$$Tunebook = (function () {
    function $$$$$$models$Tunebook$es6lib$$Tunebook(rawTunebook) {
      _classCallCheck(this, $$$$$$models$Tunebook$es6lib$$Tunebook);

      this.id = rawTunebook.id;
      this.fullName = rawTunebook.fullName;
      this.shortName = rawTunebook.shortName;
      this.url = rawTunebook.url;
      this.extra = rawTunebook.extra;
      this.count = rawTunebook.count;
    }

    _createClass($$$$$$models$Tunebook$es6lib$$Tunebook, [{
      key: 'logoUrl',
      get: function get() {
        return 'http://tunepal.org/test/tunepal/source_icons/s' + this.id + '.png';
      }
    }]);

    return $$$$$$models$Tunebook$es6lib$$Tunebook;
  })();

  var $$$$$$models$Tunebook$es6lib$$default = $$$$$$models$Tunebook$es6lib$$Tunebook;

  var $$models$TunebookManager$es6lib$$_TunebookManager = (function () {
    function $$models$TunebookManager$es6lib$$_TunebookManager() {
      _classCallCheck(this, $$models$TunebookManager$es6lib$$_TunebookManager);

      this.DefaultTunebooks = $$models$TunebookManager$es6lib$$DefaultTunebooks;
      this.DefaultSelectedIds = $$models$TunebookManager$es6lib$$DefaultSelectedIds;

      var rawTunebooks = $$utils$Utils$es6lib$$default.localStorage.getItem('tunebooks');

      if (rawTunebooks === null) {
        rawTunebooks = this.DefaultTunebooks;
        $$utils$Utils$es6lib$$default.localStorage.setItem('tunebooks', rawTunebooks);
      }

      this._tunebooks = this._initTunebooks(rawTunebooks);

      this._selectedIds = $$utils$Utils$es6lib$$default.localStorage.getItem('tunebookSelectedIds');

      if (this._selectedIds === null) {
        this._selectedIds = this.DefaultSelectedIds;
        $$utils$Utils$es6lib$$default.localStorage.setItem('tunebookSelectedIds', this._selectedIds);
      }

      this._selectedIds = new Set(this._selectedIds);
    }

    _createClass($$models$TunebookManager$es6lib$$_TunebookManager, [{
      key: '_initTunebooks',
      value: function _initTunebooks(rawTunebooks) {
        var tunebooks = [];

        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          for (var _iterator3 = rawTunebooks[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var rawTunebook = _step3.value;

            tunebooks[rawTunebook.id] = new $$$$$$models$Tunebook$es6lib$$default(rawTunebook);
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

        if (!tunebooks[0]) {
          tunebooks[0] = new $$$$$$models$Tunebook$es6lib$$default({
            id: 0,
            fullName: 'All',
            shortName: 'All'
          });
        }

        return tunebooks;
      }
    }, {
      key: 'updateTunebooks',
      value: function updateTunebooks($http) {
        var _this = this;

        return new Promise(function (resolve, reject) {
          var url = $$$$$$Config$es6lib$$default.ApiDomain + '/api/Sources';

          $http.get(url).success(function (tunebooks) {
            _this._tunebooks = _this._initTunebooks(tunebooks);
            $$utils$Utils$es6lib$$default.localStorage.setItem('tunebooks', tunebooks);
            resolve();
          });
        });
      }
    }, {
      key: 'getById',
      value: function getById(id) {
        return this._tunebooks[id];
      }
    }, {
      key: 'isSelected',
      value: function isSelected(id) {
        return this._selectedIds.has(0) || this._selectedIds.has(parseInt(id));
      }
    }, {
      key: 'select',
      value: function select(id) {
        id = parseInt(id);

        if (id === 0) {
          this._selectedIds = new Set([0]);
        } else {
          this._selectedIds.add(id);
          if (this._selectedIds.size === this._tunebooks.length - 1) {
            this._selectedIds = new Set([0]);
          }
        }

        $$utils$Utils$es6lib$$default.localStorage.setItem('tunebookSelectedIds', this._selectedIds);
      }
    }, {
      key: 'deselect',
      value: function deselect(id) {
        id = parseInt(id);

        if (id === 0) {
          this._selectedIds = new Set();
        } else if (this._selectedIds.has(0)) {
          this._selectedIds = new Set();
          var _iteratorNormalCompletion4 = true;
          var _didIteratorError4 = false;
          var _iteratorError4 = undefined;

          try {
            for (var _iterator4 = this._tunebooks[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
              var tunebook = _step4.value;

              if (tunebook.id != id && tunebook.id != 0) {
                this._selectedIds.add(tunebook.id);
              }
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
        } else {
          this._selectedIds['delete'](id);
        }

        $$utils$Utils$es6lib$$default.localStorage.setItem('tunebookSelectedIds', this._selectedIds);
      }
    }, {
      key: 'toggle',
      value: function toggle(id) {
        id = parseInt(id);
        this.isSelected(id) ? this.deselect(id) : this.select(id);
      }
    }, {
      key: 'selectedIds',
      get: function get() {
        return this._selectedIds;
      }
    }, {
      key: 'selectedShortNames',
      get: function get() {
        if (this._selectedIds.size === 0) {
          return 'None';
        } else {
          var names = '';
          var i = 0;
          var _iteratorNormalCompletion5 = true;
          var _didIteratorError5 = false;
          var _iteratorError5 = undefined;

          try {
            for (var _iterator5 = this._selectedIds[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
              var id = _step5.value;

              if (i != 0) names += ', ';
              names += this._tunebooks[id].shortName;
              i++;
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

          return names;
        }
      }
    }, {
      key: 'all',
      get: function get() {
        return this._tunebooks;
      }
    }]);

    return $$models$TunebookManager$es6lib$$_TunebookManager;
  })();

  var $$models$TunebookManager$es6lib$$DefaultSelectedIds = [0];

  var $$models$TunebookManager$es6lib$$DefaultTunebooks = [{
    "id": 0,
    "fullName": "All",
    "shortName": "All"
  }, {
    "id": 1,
    "fullName": "thesession.org",
    "shortName": "thesession.org",
    "url": "http://thesession.org"
  }, {
    "id": 2,
    "fullName": "Henrik Norbeck",
    "shortName": "Norbeck",
    "url": "http://www.norbeck.nu/abc/"
  }, {
    "id": 3,
    "fullName": "O'Neill's 1001",
    "shortName": "O'Neill's",
    "url": "http://trillian.mit.edu/~jc/music/book/oneills/"
  }, {
    "id": 4,
    "fullName": "Ceol Rince na hÉireann 1",
    "shortName": "CRÉ1",
    "url": "http://www.nigelgatherer.com/books/CRE/cre1.html",
    "extra": "Transcribed by Bill Black"
  }, {
    "id": 5,
    "fullName": "Ceol Rince na hÉireann 2",
    "shortName": "CRÉ2",
    "url": "http://www.nigelgatherer.com/books/CRE/cre2.html",
    "extra": "Transcribed by Bill Black"
  }, {
    "id": 6,
    "fullName": "Ceol Rince na hÉireann 3",
    "shortName": "CRÉ3",
    "url": "http://www.nigelgatherer.com/books/CRE/cre3.html",
    "extra": "Transcribed by Bill Black"
  }, {
    "id": 7,
    "fullName": "Ceol Rince na hÉireann 4",
    "shortName": "CRÉ4",
    "url": "http://www.nigelgatherer.com/books/CRE/cre4.html",
    "extra": "Transcribed by Bill Black"
  }, {
    "id": 8,
    "fullName": "Johnny O'Leary",
    "shortName": "O'Leary",
    "url": "http://www.capeirish.com/webabc/collections/coll-index.html",
    "extra": "Transcribed by Bill Black"
  }, {
    "id": 9,
    "fullName": "Nigel Gatherer",
    "shortName": "Nigel Gatherer",
    "url": "http://www.nigelgatherer.com/tunes/abc.html"
  }, {
    "id": 10,
    "fullName": "The Microphone Rambles",
    "shortName": "The Microphone Rambles",
    "url": "http://archive.org/details/TheMicrophonesRambles"
  }, {
    "id": 11,
    "fullName": "Welsh Music (John Tose)",
    "shortName": "Welsh Music",
    "url": "http://johntose.blogspot.ie/"
  }, {
    "id": 12,
    "fullName": "Scottish Flute Music (Jack Campin)",
    "shortName": "Scottish Flute Music",
    "url": "http://www.campin.me.uk/Flute/Webrelease/Flute/Flute.htm"
  }, {
    "id": 13,
    "fullName": "Company of Fife and Drum",
    "shortName": "Company of Fife and Drum",
    "url": "http://companyoffifeanddrum.org/"
  }, {
    "id": 14,
    "fullName": "Nottingham Music Database",
    "shortName": "Nottingham",
    "url": "http://abc.sourceforge.net/NMD/"
  }, {
    "id": 15,
    "fullName": "Aird's Airs (Jack Campin)",
    "shortName": "Aird's Airs",
    "url": "http://www.campin.me.uk/"
  }, {
    "id": 16,
    "fullName": "Ceol Rince na hÉireann 5",
    "shortName": "CRÉ5",
    "url": "http://www.nigelgatherer.com/books/CRE/cre5.html",
    "extra": "Transcribed by Bill Black"
  }, {
    "id": 17,
    "fullName": "The Bill Black Irish Tune Collection v.1",
    "shortName": "Bill Black Irish Tune Collection",
    "url": "http://www.capeirish.com/webabc/collections/coll-index.html",
    "extra": "Transcribed by Bill Black"
  }, {
    "id": 18,
    "fullName": "The Turoe Stone - Collection of tunes by Vincent Broderick",
    "shortName": "Turroe Stone",
    "url": "http://www.capeirish.com/webabc/collections/coll-index.html",
    "extra": "Transcribed by Bill Black"
  }, {
    "id": 19,
    "fullName": "Harding's Original Collection of Jigs and Reels",
    "shortName": "Harding's",
    "url": "http://www.capeirish.com/webabc/collections/hoc/home.html",
    "extra": "Transcribed by Bill Black"
  }, {
    "id": 20,
    "fullName": "CCE session tunes",
    "shortName": "Comhaltas",
    "url": "http://www.capeirish.com/webabc/collections/coll-index.html",
    "extra": "Transcribed by Bill Black"
  }, {
    "id": 21,
    "fullName": "The Leitrim Fiddler Volume 1 - Joe Liddy",
    "shortName": "Leitrim Fiddler Vol 1",
    "url": "http://www.capeirish.com/webabc/collections/liddy1/liddy1-index.html",
    "extra": "Transcribed by Bill Black"
  }, {
    "id": 22,
    "fullName": "The Leitrim Fiddler Volume 2 - Joe Liddy",
    "shortName": "Leitrim Fiddler - Vol 2",
    "url": " http://www.capeirish.com/webabc/collections/liddy2/liddy2-index.html",
    "extra": "Transcribed by Bill Black"
  }, {
    "id": 23,
    "fullName": "O'Farrell's Pocket Companion for the Irish or Union Pipes - Vol 1",
    "shortName": "O'Farrell's - Vol 1",
    "url": "http://www.capeirish.com/webabc/collections/coll-index.html",
    "extra": "Transcribed by Bill Black"
  }, {
    "id": 24,
    "fullName": "O'Farrell's Pocket Companion for the Irish or Union Pipes - Vol 2",
    "shortName": "O'Farrell's - Vol 2",
    "url": "http://www.capeirish.com/webabc/collections/coll-index.html",
    "extra": "Transcribed by Bill Black"
  }, {
    "id": 25,
    "fullName": "O'Farrell's Pocket Companion for the Irish or Union Pipes - Vol 3",
    "shortName": "O'Farrell's - Vol 3",
    "url": "http://www.capeirish.com/webabc/collections/coll-index.html",
    "extra": "Transcribed by Bill Black"
  }, {
    "id": 26,
    "fullName": "O'Farrell's Pocket Companion for the Irish or Union Pipes - Vol 4",
    "shortName": "O'Farrell's - Vol 4",
    "url": "http://www.capeirish.com/webabc/collections/coll-index.html",
    "extra": "Transcribed by Bill Black"
  }, {
    "id": 27,
    "fullName": "O'Farrell's Collection of National Irish Music for the Union Pipes",
    "shortName": "O'Farrell's Collection",
    "url": "http://www.capeirish.com/webabc/collections/coll-index.html",
    "extra": "Transcribed by Bill Black"
  }, {
    "id": 28,
    "fullName": "The Music of Brendan Tonra",
    "shortName": "Brendan Tonra",
    "url": "http://www.capeirish.com/webabc/collections/coll-index.html",
    "extra": "Transcribed by Bill Black"
  }, {
    "id": 29,
    "fullName": "Luke O'Malley's Collection of Irish Music Volume 1",
    "shortName": "Luke O'Malley",
    "url": "http://www.capeirish.com/webabc/collections/coll-index.html",
    "extra": "Transcribed by Bill Black"
  }, {
    "id": 30,
    "fullName": "Bill Black's Miscellaneous tunes",
    "shortName": "Black's Miscellaneous",
    "url": "http://www.capeirish.com/webabc/collections/coll-index.html",
    "extra": "Transcribed by Bill Black"
  }, {
    "id": 31,
    "fullName": "Mostly Gems",
    "shortName": "Mostly Gems",
    "url": "http://www.capeirish.com/webabc/collections/coll-index.html",
    "extra": "Composed by Bill Black"
  }, {
    "id": 32,
    "fullName": "Paul Hardy's Tunebooks",
    "shortName": "Paul Hardy",
    "url": "http://www.pghardy.net/concertina/tunebooks/index.html",
    "extra": "Traditional Celtic and English Tunes from the British Isles"
  }, {
    "id": 33,
    "fullName": "William Clarke of Feltwell Tunebook",
    "shortName": "William Clarke",
    "url": "http://www.pghardy.net/concertina/tunebooks/#williamclarke",
    "extra": "Transcribed by Paul Hardy"
  }, {
    "id": 34,
    "fullName": "Bulmer and Sharpely \"Music from Ireland\" (1974)",
    "shortName": "Bulmer & Sharpely",
    "url": "http://www.capeirish.com/webabc/collections/bsmi/bsmi_project_home.html",
    "extra": "Transcribed by Bill Black"
  }];

  var $$models$TunebookManager$es6lib$$TunebookManager = new $$models$TunebookManager$es6lib$$_TunebookManager();

  var $$models$TunebookManager$es6lib$$default = $$models$TunebookManager$es6lib$$TunebookManager;

  var $$$$$$Config$es6lib$$_Config = (function () {
    function $$$$$$Config$es6lib$$_Config() {
      _classCallCheck(this, $$$$$$Config$es6lib$$_Config);

      this.Fundamentals = $$models$Fundamentals$es6lib$$default;
      this.MidiInstruments = $$models$MidiInstruments$es6lib$$default;
      this.TimeSignatures = $$models$TimeSignatures$es6lib$$default;
      this.TranscriberFrameSizes = $$models$TranscriberFrameSizes$es6lib$$default;
      this.tunebooks = $$models$TunebookManager$es6lib$$default;

      this.CountdownTime = $$utils$Utils$es6lib$$default.makeArray(0, 10);
      this.PlaybackSpeed = $$utils$Utils$es6lib$$default.makeArray(1, 10);
      this.Transpose = $$utils$Utils$es6lib$$default.makeArray(-12, 12);
      this.ApiDomain = 'https://tunepal.org/tunepal2';
      this.EuropeanaApiDomain = 'https://tunepal.org/europeana';
      this.EuropeanaPortalDomain = 'http://www.europeana.eu/portal/search.html';
      this.EuropeanaApiKey = 'QNbCgzoWb';

      this.Properties = $$$$$$Config$es6lib$$Properties;

      this.audioContext = new window.AudioContext();

      this.isTesting = false;

      this._createProperties();
    }

    _createClass($$$$$$Config$es6lib$$_Config, [{
      key: '_createProperties',
      value: function _createProperties() {
        var _this2 = this;

        this._settings = [];

        var _iteratorNormalCompletion6 = true;
        var _didIteratorError6 = false;
        var _iteratorError6 = undefined;

        try {
          var _loop = function () {
            var property = _step6.value;

            var storedValue = $$utils$Utils$es6lib$$default.localStorage.getItem(property.name);

            if (storedValue == null) {
              storedValue = property['default'];
              $$utils$Utils$es6lib$$default.localStorage.setItem(property.name, storedValue);
            }

            _this2._settings[property.name] = storedValue;

            Object.defineProperty(_this2, property.name, {
              get: function get() {
                return _this2._settings[property.name];
              },
              set: function set(value) {
                if (property.validate != null) {
                  var result = property.validate(value);
                  if (!result.success) return;
                  value = result.value;
                }

                _this2._settings[property.name] = value;
                $$utils$Utils$es6lib$$default.localStorage.setItem(property.name, value);
              }
            });
          };

          for (var _iterator6 = this.Properties[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
            _loop();
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
      }
    }]);

    return $$$$$$Config$es6lib$$_Config;
  })();

  var $$$$$$Config$es6lib$$Properties = [{ name: 'blankTime', 'default': 2 }, { name: 'chords', 'default': $$models$MidiInstruments$es6lib$$default[0] }, { name: 'countdownTime', 'default': 3 }, { name: 'enableSampleRateConversion', 'default': false }, { name: 'fundamental', 'default': 'D' }, { name: 'melody', 'default': $$models$MidiInstruments$es6lib$$default[0] }, { name: 'playbackSpeed', 'default': 5 }, { name: 'sampleTime', 'default': 12 }, { name: 'timeSigs', 'default': 'all' }, { name: 'transcriberFrameSize', 'default': $$models$TranscriberFrameSizes$es6lib$$default[0] }, { name: 'transpose', 'default': 0 }];

  var $$$$$$Config$es6lib$$Config = new $$$$$$Config$es6lib$$_Config();

  var $$$$$$Config$es6lib$$default = $$$$$$Config$es6lib$$Config;

  var $$$$$$models$Tune$es6lib$$Tune = (function () {
    function $$$$$$models$Tune$es6lib$$Tune(rawTune) {
      _classCallCheck(this, $$$$$$models$Tune$es6lib$$Tune);

      if (rawTune.title) {
        var tmp = rawTune.title.replace(/, The$/, '');
        this.title = tmp.length === rawTune.title.length ? tmp : 'The ' + tmp;
        this.title = $$$$$$models$Tune$es6lib$$Tune._convertSpecialChars(this.title);
        this.titleEncoded = encodeURIComponent(this.title);
      }

      if (rawTune.altTitle) {
        var tmp = rawTune.altTitle.replace(/, The$/, '');
        this.altTitle = tmp.length === rawTune.altTitle.length ? tmp : 'The ' + tmp;
        this.altTitle = $$$$$$models$Tune$es6lib$$Tune._convertSpecialChars(this.altTitle);
      }

      this.x = rawTune.x;
      this.id = rawTune.id;
      this.tunepalId = rawTune.tunepalid;
      this.tunepalIdEncoded = encodeURIComponent(this.tunepalId);
      this.tunepalIdDoubleEncoded = encodeURIComponent(this.tunepalIdEncoded);
      this.tunebook = $$models$TunebookManager$es6lib$$default.getById(rawTune.sourceId);
      this.tuneType = rawTune.tuneType;
      this.keySignature = rawTune.keySignature;
      this.confidence = rawTune.confidence;
      this.ed = rawTune.ed;
      this.notation = $$$$$$models$Tune$es6lib$$Tune._convertSpecialChars(rawTune.notation);
    }

    _createClass($$$$$$models$Tune$es6lib$$Tune, null, [{
      key: '_convertSpecialChars',
      value: function _convertSpecialChars(text) {
        if (!text) {
          return text;
        }

        var specialChars = [['À', /\{?(\\`A|&Agrave;|\\u00c0)\}?/g], ['à', /\{?(\\`a|&agrave;|\\u00e0)\}?/g], ['È', /\{?(\\`E|&Egrave;|\\u00c8)\}?/g], ['è', /\{?(\\`e|&egrave;|\\u00e8)\}?/g], ['Ì', /\{?(\\`I|&Igrave;|\\u00cc)\}?/g], ['ì', /\{?(\\`i|&igrave;|\\u00ec)\}?/g], ['Ò', /\{?(\\`O|&Ograve;|\\u00d2)\}?/g], ['ò', /\{?(\\`o|&ograve;|\\u00f2)\}?/g], ['Ù', /\{?(\\`U|&Ugrave;|\\u00d9)\}?/g], ['ù', /\{?(\\`u|&ugrave;|\\u00f9)\}?/g], ['Á', /\{?(\\'A|&Aacute;|\\u00c1)\}?/g], ['á', /\{?(\\'a|&aacute;|\\u00e1)\}?/g], ['É', /\{?(\\'E|&Eacute;|\\u00c9)\}?/g], ['é', /\{?(\\'e|&eacute;|\\u00e9)\}?/g], ['Í', /\{?(\\'I|&Iacute;|\\u00cd)\}?/g], ['í', /\{?(\\'i|&iacute;|\\u00ed)\}?/g], ['Ó', /\{?(\\'O|&Oacute;|\\u00d3)\}?/g], ['ó', /\{?(\\'o|&oacute;|\\u00f3)\}?/g], ['Ú', /\{?(\\'U|&Uacute;|\\u00da)\}?/g], ['ú', /\{?(\\'u|&uacute;|\\u00fa)\}?/g], ['Ý', /\{?(\\'Y|&Yacute;|\\u00dd)\}?/g], ['ý', /\{?(\\'y|&yacute;|\\u00fd)\}?/g], ['Â', /\{?(\\\^A|&Acirc;|\\u00c2)\}?/g], ['â', /\{?(\\\^a|&acirc;|\\u00e2)\}?/g], ['Ê', /\{?(\\\^E|&Ecirc;|\\u00ca)\}?/g], ['ê', /\{?(\\\^e|&ecirc;|\\u00ea)\}?/g], ['Î', /\{?(\\\^I|&Icirc;|\\u00ce)\}?/g], ['î', /\{?(\\\^i|&icirc;|\\u00ee)\}?/g], ['Ô', /\{?(\\\^O|&Ocirc;|\\u00d4)\}?/g], ['ô', /\{?(\\\^o|&ocirc;|\\u00f4)\}?/g], ['Û', /\{?(\\\^U|&Ucirc;|\\u00db)\}?/g], ['û', /\{?(\\\^u|&ucirc;|\\u00fb)\}?/g], ['Ŷ', /\{?(\\\^Y|&Ycirc;|\\u0176)\}?/g], ['ŷ', /\{?(\\\^y|&ycirc;|\\u0177)\}?/g], ['Ã', /\{?(\\~A|&Atilde;|\\u00c3)\}?/g], ['ã', /\{?(\\~a|&atilde;|\\u00e3)\}?/g], ['Ñ', /\{?(\\~N|&Ntilde;|\\u00d1)\}?/g], ['ñ', /\{?(\\~n|&ntilde;|\\u00f1)\}?/g], ['Õ', /\{?(\\~O|&Otilde;|\\u00d5)\}?/g], ['õ', /\{?(\\~o|&otilde;|\\u00f5)\}?/g], ['Ä', /\{?(\\"A|&Auml;|\\u00c4)\}?/g], ['ä', /\{?(\\"a|&auml;|\\u00e4)\}?/g], ['Ë', /\{?(\\"E|&Euml;|\\u00cb)\}?/g], ['ë', /\{?(\\"e|&euml;|\\u00eb)\}?/g], ['Ï', /\{?(\\"I|&Iuml;|\\u00cf)\}?/g], ['ï', /\{?(\\"i|&iuml;|\\u00ef)\}?/g], ['Ö', /\{?(\\"O|&Ouml;|\\u00d6)\}?/g], ['ö', /\{?(\\"o|&ouml;|\\u00f6)\}?/g], ['Ü', /\{?(\\"U|&Uuml;|\\u00dc)\}?/g], ['ü', /\{?(\\"u|&uuml;|\\u00fc)\}?/g], ['Ÿ', /\{?(\\"Y|&Yuml;|\\u0178)\}?/g], ['ÿ', /\{?(\\"y|&yuml;|\\u00ff)\}?/g], ['Ç', /\{?(\\cC|&Ccedil;|\\u00c7)\}?/g], ['ç', /\{?(\\cc|&ccedil;|\\u00e7)\}?/g], ['Å', /\{?(\\AA|&Aring;|\\u00c5)\}?/g], ['å', /\{?(\\aa|&aring;|\\u00e5)\}?/g], ['Ø', /\{?(\\\/O|&Oslash;|\\u00d8)\}?/g], ['ø', /\{?(\\\/o|&oslash;|\\u00f8)\}?/g], ['Ă', /\{?(\\uA|&Abreve;|\\u0102)\}?/g], ['ă', /\{?(\\ua|&abreve;|\\u0103)\}?/g], ['Ĕ', /\{?(\\uE|\\u0114)\}?/g], ['ĕ', /\{?(\\ue|\\u0115)\}?/g], ['Š', /\{?(\\vS|&Scaron;|\\u0160)\}?/g], ['š', /\{?(\\vs|&scaron;|\\u0161)\}?/g], ['Ž', /\{?(\\vZ|&Zcaron;|\\u017d)\}?/g], ['ž', /\{?(\\vz|&zcaron;|\\u017e)\}?/g], ['Ő', /\{?(\\HO|\\u0150)\}?/g], ['ő', /\{?(\\Ho|\\u0151)\}?/g], ['Ű', /\{?(\\HU|\\u0170)\}?/g], ['ű', /\{?(\\Hu|\\u0171)\}?/g], ['Æ', /\{?(\\AE|&AElig;|\\u00c6)\}?/g], ['æ', /\{?(\\ae|&aelig;|\\u00e6)\}?/g], ['Œ', /\{?(\\OE|&OElig;|\\u0152)\}?/g], ['œ', /\{?(\\oe|&oelig;|\\u0153)\}?/g], ['ß', /\{?(\\ss|&szlig;|\\u00df)\}?/g], ['Ð', /\{?(\\DH|&ETH;|\\u00d0)\}?/g], ['ð', /\{?(\\dh|&eth;|\\u00f0)\}?/g], ['Þ', /\{?(\\TH|&THORN;|\\u00de)\}?/g], ['þ', /\{?(\\th|&thorn;|\\u00fe)\}?/g]];

        var _iteratorNormalCompletion7 = true;
        var _didIteratorError7 = false;
        var _iteratorError7 = undefined;

        try {
          for (var _iterator7 = specialChars[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
            var specialChar = _step7.value;

            text = text.replace(specialChar[1], specialChar[0]);
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

        return text;
      }
    }]);

    return $$$$$$models$Tune$es6lib$$Tune;
  })();

  var $$$$$$models$Tune$es6lib$$default = $$$$$$models$Tune$es6lib$$Tune;

  //TODO: automated front-end testing
  if ($$$$$$Config$es6lib$$default.isTesting) {
    (function testConvertSpecialChars() {
      var a = $$$$$$models$Tune$es6lib$$Tune._convertSpecialChars('{\\aa} \\aa &aring; \\u00e5 \\`A \\\'A \\^A \\~A \\"A \\cC \\/O {\\uA}');
      var b = 'å å å å À Á Â Ã Ä Ç Ø Ă';
      console.assert(a === b, a, '!==', b);
    })();
  }

  var $$pages$about$AboutController$es6lib$$AboutController = (function (_$$$$$$ControllerBase$es6lib$$default) {
    _inherits($$pages$about$AboutController$es6lib$$AboutController, _$$$$$$ControllerBase$es6lib$$default);

    function $$pages$about$AboutController$es6lib$$AboutController($scope, $rootScope, $routeParams, $http, $timeout, $location) {
      _classCallCheck(this, $$pages$about$AboutController$es6lib$$AboutController);

      _get(Object.getPrototypeOf($$pages$about$AboutController$es6lib$$AboutController.prototype), 'constructor', this).call(this, $scope);
      this.$routeParams = $routeParams;
      this.$http = $http;
      this.$timeout = $timeout;
      this.$location = $location;
      this.config = $$$$$$Config$es6lib$$default;
      this.utils = $$utils$Utils$es6lib$$default;

      this.showLoading = true;
      this.showNoResults = false;
      this.showResults = false;
      this.showTunebooksLoading = true;
      this.showTunebooksNoResults = false;
      this.showTunebooksResults = false;

      document.title = 'Tunepal.org > About';

      this._fetchDownloads();
      this._fetchTunebooks();
    }

    _createClass($$pages$about$AboutController$es6lib$$AboutController, [{
      key: '_fetchTunebooks',
      value: function _fetchTunebooks() {
        var _this3 = this;

        var url = this.config.ApiDomain + '/api/Sources';

        this.$http.get(url).success(function (rawTunebooks) {
          _this3.tunebooks = [];

          var _iteratorNormalCompletion8 = true;
          var _didIteratorError8 = false;
          var _iteratorError8 = undefined;

          try {
            for (var _iterator8 = rawTunebooks[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
              var rawTunebook = _step8.value;

              _this3.tunebooks.push(new $$$$$$models$Tunebook$es6lib$$default(rawTunebook));
            }
          } catch (err) {
            _didIteratorError8 = true;
            _iteratorError8 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion8 && _iterator8['return']) {
                _iterator8['return']();
              }
            } finally {
              if (_didIteratorError8) {
                throw _iteratorError8;
              }
            }
          }

          _this3._initTunebooks();
        });
      }
    }, {
      key: '_initTunebooks',
      value: function _initTunebooks() {
        if (this.tunebooks.length === 0) {
          this.showNoTunebooksResults = true;
        } else {
          this.showTunebooksResults = true;
        }

        this.showTunebooksLoading = false;
      }
    }, {
      key: '_fetchDownloads',
      value: function _fetchDownloads() {
        var _this4 = this;

        var url = this.config.ApiDomain + '/api/downloads';

        this.$http.get(url).success(function (rawTunes) {
          _this4.tunes = [];

          var _iteratorNormalCompletion9 = true;
          var _didIteratorError9 = false;
          var _iteratorError9 = undefined;

          try {
            for (var _iterator9 = rawTunes[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
              var rawTune = _step9.value;

              _this4.tunes.push(new $$$$$$models$Tune$es6lib$$default(rawTune));
            }
          } catch (err) {
            _didIteratorError9 = true;
            _iteratorError9 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion9 && _iterator9['return']) {
                _iterator9['return']();
              }
            } finally {
              if (_didIteratorError9) {
                throw _iteratorError9;
              }
            }
          }

          _this4._initTunes();
        });
      }
    }, {
      key: '_initTunes',
      value: function _initTunes() {
        if (this.tunes.length === 0) {
          this.showNoResults = true;
        } else {
          this.pageSize = 10;
          this.pages = this._calcPages(this.tunes, this.pageSize);
          this._initUi();
          this.showResults = true;
        }

        this.showLoading = false;
      }
    }, {
      key: '_initUi',
      value: function _initUi() {}
    }]);

    return $$pages$about$AboutController$es6lib$$AboutController;
  })($$$$$$ControllerBase$es6lib$$default);

  var $$pages$about$AboutController$es6lib$$default = $$pages$about$AboutController$es6lib$$AboutController;

  var $$pages$discography$DiscographyController$es6lib$$DiscographyController = (function (_$$$$$$ControllerBase$es6lib$$default2) {
    _inherits($$pages$discography$DiscographyController$es6lib$$DiscographyController, _$$$$$$ControllerBase$es6lib$$default2);

    function $$pages$discography$DiscographyController$es6lib$$DiscographyController($scope, $routeParams, $http) {
      _classCallCheck(this, $$pages$discography$DiscographyController$es6lib$$DiscographyController);

      _get(Object.getPrototypeOf($$pages$discography$DiscographyController$es6lib$$DiscographyController.prototype), 'constructor', this).call(this, $scope);
      this.$routeParams = $routeParams;
      this.$http = $http;

      this.showLoading = true;
      this.showNoResults = false;
      this.showResults = false;

      this.keywordEncoded = $routeParams['keywordEncoded'];
      this.keyword = decodeURIComponent(this.keywordEncoded);

      this._fetchTunes();
    }

    _createClass($$pages$discography$DiscographyController$es6lib$$DiscographyController, [{
      key: '_fetchTunes',
      value: function _fetchTunes() {
        var _this5 = this;

        var q = this.keywordEncoded;
        var url = $$$$$$Config$es6lib$$default.ApiDomain + '/api/Discography?q=' + q;

        this.$http.get(url).success(function (tunes) {
          if (tunes.length === 0) {
            _this5.showNoResults = true;
          } else {
            var _iteratorNormalCompletion10 = true;
            var _didIteratorError10 = false;
            var _iteratorError10 = undefined;

            try {
              for (var _iterator10 = tunes[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
                var tune = _step10.value;

                tune.queryEncoded = encodeURIComponent(tune.title + ' ' + tune.artist);
              }
            } catch (err) {
              _didIteratorError10 = true;
              _iteratorError10 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion10 && _iterator10['return']) {
                  _iterator10['return']();
                }
              } finally {
                if (_didIteratorError10) {
                  throw _iteratorError10;
                }
              }
            }

            _this5.tunes = tunes;
            _this5.pageSize = 10;
            _this5.pages = _this5._calcPages(_this5.tunes, _this5.pageSize);
            _this5.showResults = true;
          }
          _this5.showLoading = false;
        });
      }
    }]);

    return $$pages$discography$DiscographyController$es6lib$$DiscographyController;
  })($$$$$$ControllerBase$es6lib$$default);

  var $$pages$discography$DiscographyController$es6lib$$default = $$pages$discography$DiscographyController$es6lib$$DiscographyController;

  var $$EuropeanaTune$es6lib$$EuropeanaTune = (function () {
    function $$EuropeanaTune$es6lib$$EuropeanaTune() {
      _classCallCheck(this, $$EuropeanaTune$es6lib$$EuropeanaTune);
    }

    _createClass($$EuropeanaTune$es6lib$$EuropeanaTune, null, [{
      key: 'fromSearch',
      value: function fromSearch(rawTune) {
        var tune = new $$EuropeanaTune$es6lib$$EuropeanaTune();

        tune.title = rawTune.title && rawTune.title[0];
        tune.preview = rawTune.edmPreview && rawTune.edmPreview[0] || 'http://europeana.eu/Logo.jpg';
        tune.provider = rawTune.dataProvider && rawTune.dataProvider[0];
        tune.author = rawTune.dcContributor && rawTune.dcContributor[0];
        tune.year = rawTune.year && rawTune.year[0];
        tune.tunePageInProvider = rawTune.edmIsShownAt && rawTune.edmIsShownAt[0] || rawTune.edmIsShownBy && rawTune.edmIsShownBy[0];
        tune.tunePageInEuropeana = rawTune.guid;

        return tune;
      }
    }, {
      key: 'fromRecord',
      value: function fromRecord(rawTune, $sce) {
        var tune = new $$EuropeanaTune$es6lib$$EuropeanaTune();

        tune.title = rawTune.proxies[0].dcTitle && rawTune.proxies[0].dcTitle.def[0];
        tune.preview = rawTune.europeanaAggregation.edmPreview || 'http://europeana.eu/Logo.jpg';
        tune.provider = rawTune.aggregations[0].edmDataProvider && rawTune.aggregations[0].edmDataProvider.def[0];
        tune.year = rawTune.proxies[0].dcDate && rawTune.proxies[0].dcDate.def[0];
        tune.tunePageInProvider = rawTune.aggregations[0].edmIsShownAt || rawTune.aggregations[0].edmIsShownBy;
        tune.tunePageInEuropeana = rawTune.europeanaAggregation.edmLandingPage;
        tune.audioUrl = $sce.trustAsResourceUrl(rawTune.aggregations[0].edmIsShownBy);

        tune.author = tune.provider === 'Irish Traditional Music Archive' ? rawTune.proxies[0].dcCreator && rawTune.proxies[0].dcCreator.def[0] : rawTune.proxies[0].dcContributor && rawTune.proxies[0].dcContributor.def[0];

        return tune;
      }
    }]);

    return $$EuropeanaTune$es6lib$$EuropeanaTune;
  })();

  var $$EuropeanaTune$es6lib$$default = $$EuropeanaTune$es6lib$$EuropeanaTune;

  var $$$$$$models$EuropeanaApi$es6lib$$_EuropeanaApi = (function () {
    function $$$$$$models$EuropeanaApi$es6lib$$_EuropeanaApi() {
      _classCallCheck(this, $$$$$$models$EuropeanaApi$es6lib$$_EuropeanaApi);

      var providers = ['Comhaltas Traditional Music Archive', 'Irish Traditional Music Archive'];
      this._qfProvider = this._getProviders(providers);
    }

    // search tune and return the raw results

    _createClass($$$$$$models$EuropeanaApi$es6lib$$_EuropeanaApi, [{
      key: 'rawSearchAsync',
      value: function rawSearchAsync($http, tune) {
        var _this6 = this;

        var start = arguments.length <= 2 || arguments[2] === undefined ? 1 : arguments[2];
        var maxNumItems = arguments.length <= 3 || arguments[3] === undefined ? 20 : arguments[3];

        return new Promise(function (resolve, reject) {
          var apiDomain = $$$$$$Config$es6lib$$default.EuropeanaApiDomain;
          var apiKey = $$$$$$Config$es6lib$$default.EuropeanaApiKey;
          var profile = 'portal';
          var qfSound = encodeURIComponent('TYPE:SOUND');
          var qfProvider = _this6._qfProvider;
          var query = _this6._getQuery(tune.title, tune.altTitle);

          var url = apiDomain + '/search.json?wskey=' + apiKey + '&query=' + query + '&qf=' + qfSound + '&qf=' + qfProvider + '&start=' + start + '&rows=' + maxNumItems + '&profile=' + profile;

          $http.get(url).success(function (rawResults) {
            return resolve(rawResults);
          });
        });
      }
    }, {
      key: 'fetchRecordAsync',
      value: function fetchRecordAsync($http, europeanaId) {
        return new Promise(function (resolve, reject) {
          var apiDomain = $$$$$$Config$es6lib$$default.EuropeanaApiDomain;
          var apiKey = $$$$$$Config$es6lib$$default.EuropeanaApiKey;

          var url = apiDomain + '/record/' + europeanaId + '.json?wskey=' + apiKey;

          $http.get(url).success(function (rawResult) {
            return resolve(rawResult);
          });
        });
      }
    }, {
      key: 'getPortalUrl',
      value: function getPortalUrl(tune) {
        var domain = $$$$$$Config$es6lib$$default.EuropeanaPortalDomain;
        var query = this._getQuery(tune.title, tune.altTitle);
        var qfSound = encodeURIComponent('TYPE:SOUND');
        var qfProviders = this._qfProvider;

        return domain + '?query=' + query + '&qf=' + qfSound + '&qf=' + qfProviders;
      }

      // search tune and convert raw results to normalized EuropeanaTune objects
    }, {
      key: 'searchAsync',
      value: function searchAsync($http, tune) {
        var start = arguments.length <= 2 || arguments[2] === undefined ? 1 : arguments[2];
        var maxNumItems = arguments.length <= 3 || arguments[3] === undefined ? 20 : arguments[3];

        return this.rawSearchAsync($http, tune, start, maxNumItems).then(function (rawResults) {
          var results = { totalResults: rawResults.totalResults };

          if (!rawResults.items) {
            results.items = [];
            return Promise.resolve(results);
          }

          results.items = new Array(rawResults.items.length);

          for (var i = 0; i < results.items.length; i++) {
            results.items[i] = $$EuropeanaTune$es6lib$$default.fromSearch(rawResults.items[i]);
          }

          return Promise.resolve(results);
        });
      }

      // search tune, fetch audio urls one by one
      // and convert raw results to normalized EuropeanaTune objects
    }, {
      key: 'searchFetchAsync',
      value: function searchFetchAsync($http, tune, $sce) {
        var _this7 = this;

        var start = arguments.length <= 3 || arguments[3] === undefined ? 1 : arguments[3];
        var maxNumItems = arguments.length <= 4 || arguments[4] === undefined ? 20 : arguments[4];

        return this.rawSearchAsync($http, tune, start, maxNumItems).then(function (rawResults) {
          var results = { totalResults: rawResults.totalResults };

          if (!rawResults.items) {
            results.items = [];
            return Promise.resolve(results);
          }

          results.items = new Array(rawResults.items.length);
          var promises = new Array(rawResults.items.length);

          var _loop2 = function (i) {
            promises[i] = _this7.fetchRecordAsync($http, rawResults.items[i].id).then(function (rawResult) {
              results.items[i] = $$EuropeanaTune$es6lib$$default.fromRecord(rawResult.object, $sce);
            });
          };

          for (var i = 0; i < results.items.length; i++) {
            _loop2(i);
          }

          return Promise.all(promises).then(function () {
            //TODO: cache europeana results
            //Utils.cache.europeana = {id: tune.tunepalId, results: results};
            return Promise.resolve(results);
          });
        });
      }
    }, {
      key: '_getQuery',
      value: function _getQuery() {
        for (var _len2 = arguments.length, keywords = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          keywords[_key2] = arguments[_key2];
        }

        if (keywords.length === 0) {
          return '';
        }

        var query = '(' + this._cleanupQuery(keywords[0]) + ')';

        for (var i = 1; i < keywords.length; i++) {
          if (keywords[i]) {
            var keyword = this._cleanupQuery(keywords[i]);
            query += query.length > 0 ? ' OR (' + keyword + ')' : '(' + keyword + ')';
          }
        }

        return encodeURIComponent(query);
      }
    }, {
      key: '_cleanupQuery',
      value: function _cleanupQuery(keyword) {
        if (!keyword) {
          return '';
        }

        keyword = keyword.replace(/\b(reel|jig|hornpipe|polka|waltz|mazurka|THE|AT|AND|OF|TO|BUT|SO|FOR|AN|I|IN|ON|YOUR|A|WITH)\b|[\u2000-\u206F\u2E00-\u2E7F\\'!"#\$%&\(\)\*\+,\-\.\/:;<=>\?@\[\]\^_`\{\|\}~]/gi, '');
        keyword = keyword.replace(/(\s)+/g, ' ');
        keyword = keyword.trim();

        return keyword;
      }
    }, {
      key: '_getProviders',
      value: function _getProviders(providers) {
        if (providers.length === 0) {
          return '';
        }

        var query = 'DATA_PROVIDER:"' + providers[0] + '"';

        for (var i = 1; i < providers.length; i++) {
          query += ' OR "' + providers[i] + '"';
        }

        return encodeURIComponent(query);
      }
    }]);

    return $$$$$$models$EuropeanaApi$es6lib$$_EuropeanaApi;
  })();

  var $$$$$$models$EuropeanaApi$es6lib$$EuropeanaApi = new $$$$$$models$EuropeanaApi$es6lib$$_EuropeanaApi();

  var $$$$$$models$EuropeanaApi$es6lib$$default = $$$$$$models$EuropeanaApi$es6lib$$EuropeanaApi;

  //TODO: automated front-end testing
  if ($$$$$$Config$es6lib$$default.isTesting) {
    (function testCleanupQuery() {
      var a = $$$$$$models$EuropeanaApi$es6lib$$EuropeanaApi._cleanupQuery('ABC DEF reel polka the At I A., | {} HIJ');
      var b = 'ABC DEF HIJ';
      console.assert(a === b, a, '!==', b);
    })();
  }

  var $$$$$$models$TunepalApi$es6lib$$_TunepalApi = (function () {
    function $$$$$$models$TunepalApi$es6lib$$_TunepalApi() {
      _classCallCheck(this, $$$$$$models$TunepalApi$es6lib$$_TunepalApi);
    }

    _createClass($$$$$$models$TunepalApi$es6lib$$_TunepalApi, [{
      key: 'fetchTuneAsync',
      value: function fetchTuneAsync($http, tunepalIdEncoded) {
        return new Promise(function (resolve, reject) {
          var url = $$$$$$Config$es6lib$$default.ApiDomain + '/api/Tunes/' + tunepalIdEncoded;

          $http.get(url).success(function (rawTune) {
            var tune = new $$$$$$models$Tune$es6lib$$default(rawTune);
            $$utils$Utils$es6lib$$default.cache.tune = tune;
            resolve(tune);
          });
        });
      }
    }]);

    return $$$$$$models$TunepalApi$es6lib$$_TunepalApi;
  })();

  var $$$$$$models$TunepalApi$es6lib$$TunepalApi = new $$$$$$models$TunepalApi$es6lib$$_TunepalApi();

  var $$$$$$models$TunepalApi$es6lib$$default = $$$$$$models$TunepalApi$es6lib$$TunepalApi;

  var $$pages$europeana$EuropeanaController$es6lib$$EuropeanaController = (function (_$$$$$$ControllerBase$es6lib$$default3) {
    _inherits($$pages$europeana$EuropeanaController$es6lib$$EuropeanaController, _$$$$$$ControllerBase$es6lib$$default3);

    function $$pages$europeana$EuropeanaController$es6lib$$EuropeanaController($scope, $rootScope, $routeParams, $http, $timeout, $location, $sce) {
      var _this8 = this;

      _classCallCheck(this, $$pages$europeana$EuropeanaController$es6lib$$EuropeanaController);

      _get(Object.getPrototypeOf($$pages$europeana$EuropeanaController$es6lib$$EuropeanaController.prototype), 'constructor', this).call(this, $scope);
      this.config = $$$$$$Config$es6lib$$default;
      this.utils = $$utils$Utils$es6lib$$default;
      this.$http = $http;
      this.$timeout = $timeout;
      this.$location = $location;
      this.$sce = $sce;

      this.showLoading = true;
      this.showNoResults = false;
      this.showResults = false;

      var tunepalIdEncoded = $routeParams['tunepalIdEncoded'];
      var tunepalId = decodeURIComponent(tunepalIdEncoded);

      if ($$utils$Utils$es6lib$$default.cache.tune.tunepalId === tunepalId) {
        this.tune = $$utils$Utils$es6lib$$default.cache.tune;
        this._search();
      } else {
        $$$$$$models$TunepalApi$es6lib$$default.fetchTuneAsync(this.$http, tunepalIdEncoded).then(function (tune) {
          _this8.tune = tune;
          _this8._search();
        });
      }
    }

    _createClass($$pages$europeana$EuropeanaController$es6lib$$EuropeanaController, [{
      key: '_search',
      value: function _search() {
        var _this9 = this;

        if ($$utils$Utils$es6lib$$default.cache.europeana.id === this.tune.tunepalId) {
          this._initResults($$utils$Utils$es6lib$$default.cache.europeana.results);
        } else {
          $$$$$$models$EuropeanaApi$es6lib$$default.searchFetchAsync(this.$http, this.tune, this.$sce).then(this.apply(function (results) {
            return _this9._initResults(results);
          }));
        }

        document.title = 'Tunepal.org > Europeana Search > ' + this.tune.title;
      }
    }, {
      key: '_initResults',
      value: function _initResults(results) {
        this.results = results;

        if (results.items.length > 0) {
          this.pageSize = 10;
          this.pages = this._calcPages(this.results.items, this.pageSize);
          this._initUi();
          this.showResults = true;
        } else {
          this.showNoResults = true;
        }

        this.showLoading = false;
      }
    }, {
      key: '_initUi',
      value: function _initUi() {
        var _this10 = this;

        this.$timeout(function () {
          return _this10.utils.view.initTooltips();
        });
      }
    }]);

    return $$pages$europeana$EuropeanaController$es6lib$$EuropeanaController;
  })($$$$$$ControllerBase$es6lib$$default);

  var $$pages$europeana$EuropeanaController$es6lib$$default = $$pages$europeana$EuropeanaController$es6lib$$EuropeanaController;

  var $$pages$help$HelpController$es6lib$$HelpController = (function (_$$$$$$ControllerBase$es6lib$$default4) {
    _inherits($$pages$help$HelpController$es6lib$$HelpController, _$$$$$$ControllerBase$es6lib$$default4);

    function $$pages$help$HelpController$es6lib$$HelpController($scope, $rootScope, $routeParams, $http, $timeout, $location) {
      _classCallCheck(this, $$pages$help$HelpController$es6lib$$HelpController);

      _get(Object.getPrototypeOf($$pages$help$HelpController$es6lib$$HelpController.prototype), 'constructor', this).call(this, $scope);
      this.$routeParams = $routeParams;
      this.$http = $http;
      this.$timeout = $timeout;
      this.$location = $location;
      this.config = $$$$$$Config$es6lib$$default;
      this.utils = $$utils$Utils$es6lib$$default;

      document.title = 'Tunepal.org > Help';
    }

    return $$pages$help$HelpController$es6lib$$HelpController;
  })($$$$$$ControllerBase$es6lib$$default);

  var $$pages$help$HelpController$es6lib$$default = $$pages$help$HelpController$es6lib$$HelpController;

  var $$pages$index$IndexController$es6lib$$IndexController = (function () {
    function $$pages$index$IndexController$es6lib$$IndexController($scope, $rootScope, $location) {
      _classCallCheck(this, $$pages$index$IndexController$es6lib$$IndexController);

      this.$rootScope = $rootScope;
      this.$location = $location;
      this.config = $$$$$$Config$es6lib$$default;
      this.utils = $$utils$Utils$es6lib$$default;

      $rootScope.$on('$routeChangeStart', function () {
        $('.material-tooltip').remove();
      });
    }

    _createClass($$pages$index$IndexController$es6lib$$IndexController, [{
      key: 'isActive',
      value: function isActive(route) {
        return this.$location.path().indexOf(route) === 0;
      }
    }]);

    return $$pages$index$IndexController$es6lib$$IndexController;
  })();

  var $$pages$index$IndexController$es6lib$$default = $$pages$index$IndexController$es6lib$$IndexController;

  var $$pages$keywordSearch$KeywordSearchController$es6lib$$KeywordSearchController = (function (_$$$$$$ControllerBase$es6lib$$default5) {
    _inherits($$pages$keywordSearch$KeywordSearchController$es6lib$$KeywordSearchController, _$$$$$$ControllerBase$es6lib$$default5);

    function $$pages$keywordSearch$KeywordSearchController$es6lib$$KeywordSearchController($scope, $rootScope, $routeParams, $http, $timeout, $location, $sce) {
      _classCallCheck(this, $$pages$keywordSearch$KeywordSearchController$es6lib$$KeywordSearchController);

      _get(Object.getPrototypeOf($$pages$keywordSearch$KeywordSearchController$es6lib$$KeywordSearchController.prototype), 'constructor', this).call(this, $scope);
      this.$routeParams = $routeParams;
      this.$http = $http;
      this.$timeout = $timeout;
      this.$location = $location;
      this.$sce = $sce;
      this.config = $$$$$$Config$es6lib$$default;
      this.utils = $$utils$Utils$es6lib$$default;

      this.keywordEncoded = $routeParams['keywordEncoded'];
      this.keyword = this.keywordEncoded && decodeURIComponent(this.keywordEncoded);
      this.selectedTunepalIdEncoded = $routeParams['selectedTunepalIdEncoded'];
      this.selectedTunepalId = this.selectedTunepalIdEncoded && decodeURIComponent(this.selectedTunepalIdEncoded);

      this.showLoading = this.keyword != null;
      this.showResults = false;
      this.showNoResults = false;
      this.showEuropeanaLoading = false;
      this.showEuropeanaResults = false;
      this.showEuropeanaNoResults = false;

      if (this.keyword) {
        if ($$utils$Utils$es6lib$$default.cache.keywordSearch.keyword === this.keyword) {
          this.tunes = $$utils$Utils$es6lib$$default.cache.keywordSearch.results;
          this._initTunes();
        } else {
          this._fetchTunes();
        }
        document.title = 'Tunepal.org > Keyword Search > ' + this.keyword;
      } else {
        $timeout(function () {
          return $('#keyword').focus();
        });
        document.title = 'Tunepal.org > Keyword Search';
      }
    }

    _createClass($$pages$keywordSearch$KeywordSearchController$es6lib$$KeywordSearchController, [{
      key: '_fetchTunes',
      value: function _fetchTunes() {
        var _this11 = this;

        var q = this.keywordEncoded;
        var sources = $$utils$Utils$es6lib$$default.joinSet(this.config.tunebooks.selectedIds);
        var latitude = 1; //TODO
        var longitude = 2;
        var client = 'tunepal.org';
        var localTimestamp = $$utils$Utils$es6lib$$default.date.format(new Date());

        var url = this.config.ApiDomain + '/api/keywordSearch' + ('?q=' + q) + ('&sources=' + sources) + ('&latitude=' + latitude) + ('&longitude=' + longitude) + ('&client=' + client) + ('&key_sigs=' + this.config.timeSigs) + ('&local_tstamp=' + localTimestamp);

        this.$http.get(url).success(function (rawTunes) {
          _this11.tunes = [];

          var _iteratorNormalCompletion11 = true;
          var _didIteratorError11 = false;
          var _iteratorError11 = undefined;

          try {
            for (var _iterator11 = rawTunes[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
              var rawTune = _step11.value;

              _this11.tunes.push(new $$$$$$models$Tune$es6lib$$default(rawTune));
            }
          } catch (err) {
            _didIteratorError11 = true;
            _iteratorError11 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion11 && _iterator11['return']) {
                _iterator11['return']();
              }
            } finally {
              if (_didIteratorError11) {
                throw _iteratorError11;
              }
            }
          }

          $$utils$Utils$es6lib$$default.cache.keywordSearch = { keyword: _this11.keyword, results: _this11.tunes };

          _this11._initTunes();
        });
      }
    }, {
      key: '_initTunes',
      value: function _initTunes() {
        if (this.tunes.length === 0) {
          this.showNoResults = true;
        } else {
          this.pageSize = 10;
          this.pages = this._calcPages(this.tunes, this.pageSize);
          this._initUi();
          this.showResults = true;
          this._initEuropeana();
        }

        this.showLoading = false;
      }
    }, {
      key: '_initUi',
      value: function _initUi() {}
    }, {
      key: '_initEuropeana',
      value: function _initEuropeana() {
        var _this12 = this;

        this.showEuropeanaLoading = true;

        if (this.selectedTunepalId) {
          this.selectedTune = this.tunes.find(function (tune) {
            return tune.tunepalId === _this12.selectedTunepalId;
          });

          if (this.selectedTune) {
            this._searchEuropeana();
          } else {
            $$$$$$models$TunepalApi$es6lib$$default.fetchTuneAsync(this.$http, this.selectedTunepalIdEncoded).then(function (tune) {
              _this12.selectedTune = tune;
              _this12._searchEuropeana();
            });
          }
        } else {
          this.selectedTune = new $$$$$$models$Tune$es6lib$$default({ tunepalid: this.keyword, title: this.keyword });
          this._searchEuropeana();
        }
      }
    }, {
      key: '_searchEuropeana',
      value: function _searchEuropeana() {
        var _this13 = this;

        this.europeanaPortalUrl = $$$$$$models$EuropeanaApi$es6lib$$default.getPortalUrl(this.selectedTune);

        if ($$utils$Utils$es6lib$$default.cache.europeana.id === this.selectedTune.tunepalId) {
          this._initEuropeanaResults($$utils$Utils$es6lib$$default.cache.europeana.results);
        } else {
          $$$$$$models$EuropeanaApi$es6lib$$default.searchFetchAsync(this.$http, this.selectedTune, this.$sce).then(this.apply(function (results) {
            return _this13._initEuropeanaResults(results);
          }));
        }
      }
    }, {
      key: '_initEuropeanaResults',
      value: function _initEuropeanaResults(results) {
        var _this14 = this;

        if (results.items.length > 0) {
          this.europeanaPageSize = 10;
          this.europeanaPages = this._calcPages(results.items, this.europeanaPageSize);
          this.europeana = results;
          this.$timeout(function () {
            return _this14.utils.view.initTooltips();
          });
          this.showEuropeanaResults = true;
          this.showEuropeanaLoading = false;
        } else {
          this.showEuropeanaLoading = false;
          this.showEuropeanaNoResults = true;
        }
      }
    }, {
      key: 'searchKeyword',
      value: function searchKeyword() {
        $('#keyword').blur();
        this.$location.url('/keywordSearch/' + $$utils$Utils$es6lib$$default.view.doubleEncode(this.keyword));
      }
    }, {
      key: 'clearKeyword',
      value: function clearKeyword() {
        $('#keyword').focus();
        this.keyword = '';
      }
    }, {
      key: 'select',
      value: function select(tune) {
        if (this.selectedTune.tunepalId === tune.tunepalId) {
          this.$location.url('/keywordSearch/' + $$utils$Utils$es6lib$$default.view.doubleEncode(this.keyword));
        } else {
          this.$location.url('/keywordSearch/' + $$utils$Utils$es6lib$$default.view.doubleEncode(this.keyword) + '/' + tune.tunepalIdDoubleEncoded);
        }
        this.$location.replace();
      }
    }]);

    return $$pages$keywordSearch$KeywordSearchController$es6lib$$KeywordSearchController;
  })($$$$$$ControllerBase$es6lib$$default);

  var $$pages$keywordSearch$KeywordSearchController$es6lib$$default = $$pages$keywordSearch$KeywordSearchController$es6lib$$KeywordSearchController;

  var $$pages$notesSearch$NotesSearchController$es6lib$$NotesSearchController = (function (_$$$$$$ControllerBase$es6lib$$default6) {
    _inherits($$pages$notesSearch$NotesSearchController$es6lib$$NotesSearchController, _$$$$$$ControllerBase$es6lib$$default6);

    function $$pages$notesSearch$NotesSearchController$es6lib$$NotesSearchController($scope, $rootScope, $routeParams, $http, $timeout, $location, $sce) {
      _classCallCheck(this, $$pages$notesSearch$NotesSearchController$es6lib$$NotesSearchController);

      _get(Object.getPrototypeOf($$pages$notesSearch$NotesSearchController$es6lib$$NotesSearchController.prototype), 'constructor', this).call(this, $scope);
      this.$routeParams = $routeParams;
      this.$http = $http;
      this.$timeout = $timeout;
      this.$location = $location;
      this.$sce = $sce;
      this.config = $$$$$$Config$es6lib$$default;
      this.utils = $$utils$Utils$es6lib$$default;

      this.notes = $routeParams['notes'];
      this.selectedTunepalIdEncoded = $routeParams['selectedTunepalIdEncoded'];
      this.selectedTunepalId = this.selectedTunepalIdEncoded && decodeURIComponent(this.selectedTunepalIdEncoded);

      this.showLoading = true;
      this.showResults = false;
      this.showNoResults = false;
      this.showEuropeanaLoading = false;
      this.showEuropeanaResults = false;
      this.showEuropeanaNoResults = false;

      if ($$utils$Utils$es6lib$$default.cache.notesSearch.notes === this.notes) {
        this.tunes = $$utils$Utils$es6lib$$default.cache.notesSearch.results;
        this.showConfidencePopup = false;
        this._initTunes();
      } else {
        this.showConfidencePopup = true;
        this._fetchTunes();
      }

      document.title = 'Tunepal.org > Notes Search';
    }

    _createClass($$pages$notesSearch$NotesSearchController$es6lib$$NotesSearchController, [{
      key: '_fetchTunes',
      value: function _fetchTunes() {
        var _this15 = this;

        var sources = $$utils$Utils$es6lib$$default.joinSet(this.config.tunebooks.selectedIds);
        var latitude = 1; //TODO
        var longitude = 2;
        var client = 'tunepal.org';
        var localTimestamp = $$utils$Utils$es6lib$$default.date.format(new Date());

        var url = this.config.ApiDomain + '/api/mattSearch' + ('?q=' + this.notes) + ('&sources=' + sources) + ('&latitude=' + latitude) + ('&longitude=' + longitude) + ('&client=' + client) + ('&key_sigs=' + this.config.timeSigs) + ('&local_tstamp=' + localTimestamp);

        this.$http.get(url).success(function (rawTunes) {
          _this15.tunes = [];

          var _iteratorNormalCompletion12 = true;
          var _didIteratorError12 = false;
          var _iteratorError12 = undefined;

          try {
            for (var _iterator12 = rawTunes[Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
              var rawTune = _step12.value;

              _this15.tunes.push(new $$$$$$models$Tune$es6lib$$default(rawTune));
            }
          } catch (err) {
            _didIteratorError12 = true;
            _iteratorError12 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion12 && _iterator12['return']) {
                _iterator12['return']();
              }
            } finally {
              if (_didIteratorError12) {
                throw _iteratorError12;
              }
            }
          }

          $$utils$Utils$es6lib$$default.cache.notesSearch = { notes: _this15.notes, results: _this15.tunes };

          _this15._initTunes();
        });
      }
    }, {
      key: '_initTunes',
      value: function _initTunes() {
        if (this.tunes.length === 0) {
          this.showNoResults = true;
        } else {
          this.pageSize = 10;
          this.pages = this._calcPages(this.tunes, this.pageSize);
          this._initUi();
          this.showResults = true;
          this._initEuropeana();
        }

        this.showLoading = false;
      }
    }, {
      key: '_initUi',
      value: function _initUi() {
        if (this.showConfidencePopup) {
          $('#confidence-popup').openModal();
        }
      }
    }, {
      key: '_initEuropeana',
      value: function _initEuropeana() {
        var _this16 = this;

        this.showEuropeanaLoading = true;

        if (this.selectedTunepalId) {
          this.selectedTune = this.tunes.find(function (tune) {
            return tune.tunepalId === _this16.selectedTunepalId;
          });

          if (this.selectedTune) {
            this._searchEuropeana();
          } else {
            $$$$$$models$TunepalApi$es6lib$$default.fetchTuneAsync(this.$http, this.selectedTunepalIdEncoded).then(function (tune) {
              _this16.selectedTune = tune;
              _this16._searchEuropeana();
            });
          }
        } else {
          this.selectedTune = this.tunes[0];
          this._searchEuropeana();
        }
      }
    }, {
      key: '_searchEuropeana',
      value: function _searchEuropeana() {
        var _this17 = this;

        this.europeanaPortalUrl = $$$$$$models$EuropeanaApi$es6lib$$default.getPortalUrl(this.selectedTune);

        if ($$utils$Utils$es6lib$$default.cache.europeana.id === this.selectedTune.tunepalId) {
          this._initEuropeanaResults($$utils$Utils$es6lib$$default.cache.europeana.results);
        } else {
          $$$$$$models$EuropeanaApi$es6lib$$default.searchFetchAsync(this.$http, this.selectedTune, this.$sce).then(this.apply(function (results) {
            return _this17._initEuropeanaResults(results);
          }));
        }
      }
    }, {
      key: '_initEuropeanaResults',
      value: function _initEuropeanaResults(results) {
        var _this18 = this;

        if (results.items.length > 0) {
          this.europeanaPageSize = 10;
          this.europeanaPages = this._calcPages(results.items, this.europeanaPageSize);
          this.europeana = results;
          this.$timeout(function () {
            return _this18.utils.view.initTooltips();
          });
          this.showEuropeanaResults = true;
          this.showEuropeanaLoading = false;
        } else {
          this.showEuropeanaLoading = false;
          this.showEuropeanaNoResults = true;
        }
      }
    }, {
      key: 'select',
      value: function select(tune) {
        this.$location.url('/notesSearch/' + this.notes + '/' + tune.tunepalIdDoubleEncoded);
        this.$location.replace();
      }
    }]);

    return $$pages$notesSearch$NotesSearchController$es6lib$$NotesSearchController;
  })($$$$$$ControllerBase$es6lib$$default);

  var $$pages$notesSearch$NotesSearchController$es6lib$$default = $$pages$notesSearch$NotesSearchController$es6lib$$NotesSearchController;

  var $$pages$randomTune$RandomTuneController$es6lib$$RandomTuneController = (function (_$$$$$$ControllerBase$es6lib$$default7) {
    _inherits($$pages$randomTune$RandomTuneController$es6lib$$RandomTuneController, _$$$$$$ControllerBase$es6lib$$default7);

    function $$pages$randomTune$RandomTuneController$es6lib$$RandomTuneController($scope, $http, $location) {
      _classCallCheck(this, $$pages$randomTune$RandomTuneController$es6lib$$RandomTuneController);

      _get(Object.getPrototypeOf($$pages$randomTune$RandomTuneController$es6lib$$RandomTuneController.prototype), 'constructor', this).call(this, $scope);
      this.config = $$$$$$Config$es6lib$$default;
      this.utils = $$utils$Utils$es6lib$$default;

      var url = this.config.ApiDomain + '/api/RandomTune';

      $http.get(url).success(function (rawTune) {
        var tune = new $$$$$$models$Tune$es6lib$$default(rawTune);
        $$utils$Utils$es6lib$$default.cache.tune = tune;
        $location.url('/tune/' + tune.tunepalIdDoubleEncoded);
        $location.replace();
      });
    }

    return $$pages$randomTune$RandomTuneController$es6lib$$RandomTuneController;
  })($$$$$$ControllerBase$es6lib$$default);

  var $$pages$randomTune$RandomTuneController$es6lib$$default = $$pages$randomTune$RandomTuneController$es6lib$$RandomTuneController;
  var $$$$$$transcription$TranscriberAsync$es6lib$$WorkerPath = '/scripts/transcription/TranscriberWorker.js';

  var $$$$$$transcription$TranscriberAsync$es6lib$$TranscriberAsync = (function () {
    function $$$$$$transcription$TranscriberAsync$es6lib$$TranscriberAsync() {
      var _this19 = this;

      _classCallCheck(this, $$$$$$transcription$TranscriberAsync$es6lib$$TranscriberAsync);

      this._worker = new Worker($$$$$$transcription$TranscriberAsync$es6lib$$WorkerPath);
      this._worker.addEventListener('message', function (e) {
        return _this19._onMessage(e);
      });
      this._callbacks = [];
      this._nextId = 0;
      this.onProgress = function () {};
    }

    _createClass($$$$$$transcription$TranscriberAsync$es6lib$$TranscriberAsync, [{
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
        var _this20 = this;

        return new Promise(function (resolve, reject) {
          var id = _this20._nextId++;
          _this20._callbacks[id] = { resolve: resolve, reject: reject };

          msg.id = id;
          _this20._worker.postMessage(msg);
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

    return $$$$$$transcription$TranscriberAsync$es6lib$$TranscriberAsync;
  })();

  var $$$$$$transcription$TranscriberAsync$es6lib$$default = $$$$$$transcription$TranscriberAsync$es6lib$$TranscriberAsync;

  var $$Recorder$es6lib$$Recorder = (function () {
    _createClass($$Recorder$es6lib$$Recorder, [{
      key: 'sampleTime',
      get: function get() {
        return this.config.sampleTime;
      },
      set: function set(value) {
        this.config.sampleTime = value;
      }
    }, {
      key: 'blankTime',
      get: function get() {
        return this.config.blankTime;
      },
      set: function set(value) {
        this.config.blankTime = value;
      }
    }, {
      key: 'fundamental',
      get: function get() {
        return this.config.fundamental;
      },
      set: function set(value) {
        this.config.fundamental = value;
      }
    }, {
      key: 'enableSampleRateConversion',
      get: function get() {
        return this.config.enableSampleRateConversion;
      },
      set: function set(value) {
        this.config.enableSampleRateConversion = value;
      }
    }, {
      key: 'transcriberFrameSize',
      get: function get() {
        return this.config.transcriberFrameSize;
      },
      set: function set(value) {
        this.config.transcriberFrameSize = value;
      }
    }, {
      key: 'audioContext',
      get: function get() {
        return this._audioContext;
      }
    }, {
      key: 'sampleRate',
      get: function get() {
        return this._audioContext.sampleRate;
      }
    }, {
      key: 'amplitude',
      get: function get() {
        return this._amplitude;
      }
    }, {
      key: 'timeRecorded',
      get: function get() {
        return this._timeRecorded;
      }
    }, {
      key: 'transcription',
      get: function get() {
        return this._transcription;
      }
    }, {
      key: 'progress',
      get: function get() {
        return this._timeRecorded / (this.blankTime + this.sampleTime);
      }
    }, {
      key: 'numSamples',
      get: function get() {
        return this._audioContext.sampleRate * this.sampleTime;
      }
    }, {
      key: 'status',
      get: function get() {
        return this._status;
      }
    }, {
      key: 'signal',
      get: function get() {
        return this._signal;
      }
    }]);

    function $$Recorder$es6lib$$Recorder(config, audioContext) {
      var _this21 = this;

      _classCallCheck(this, $$Recorder$es6lib$$Recorder);

      this.config = config;

      this._status = $$Recorder$es6lib$$Recorder.Status.STOPPED;
      this._audioContext = audioContext;

      // see App.onTranscribed()
      this.onTranscribed = function () {};

      this._transcriber = new $$$$$$transcription$TranscriberAsync$es6lib$$default();

      this._transcriber.onProgress = function (progress) {
        return _this21.analysisProgress = progress;
      };
    }

    _createClass($$Recorder$es6lib$$Recorder, [{
      key: 'initAsync',
      value: function initAsync() {
        var _this22 = this;

        return new Promise(function (resolve, reject) {
          if (_this22._stream) {
            _this22._status = $$Recorder$es6lib$$Recorder.Status.INIT_SUCCEEDED;
            resolve();
          } else {
            _this22._status = $$Recorder$es6lib$$Recorder.Status.INIT;
            navigator.getUserMedia({ audio: true }, function (stream) {
              return _this22._onStream(stream, resolve);
            }, function (error) {
              return _this22._onStreamError(error, reject);
            });
          }
        });
      }
    }, {
      key: 'close',
      value: function close() {
        this._transcriber.close();
      }
    }, {
      key: '_onStream',
      value: function _onStream(stream, resolve) {
        var _this23 = this;

        this._stream = stream;
        this._bufferSize = 4096;

        this._input = this._audioContext.createMediaStreamSource(stream);
        this._processor = this._audioContext.createScriptProcessor(this._bufferSize, 1, 1);

        this._processor.onaudioprocess = function (e) {
          return _this23._update(e);
        };

        this._input.connect(this._processor);
        this._processor.connect(this._audioContext.destination);

        this._status = $$Recorder$es6lib$$Recorder.Status.INIT_SUCCEEDED;
        resolve();
      }
    }, {
      key: '_onStreamError',
      value: function _onStreamError(error, reject) {
        this._status = $$Recorder$es6lib$$Recorder.Status.INIT_FAILED;
        reject(error);
      }
    }, {
      key: 'start',
      value: function start() {
        var _this24 = this;

        if (!this._stream) return;

        var initParams = {
          inputSampleRate: this._audioContext.sampleRate,
          sampleTime: this.sampleTime,
          blankTime: this.blankTime,
          fundamental: this.fundamental,
          enableSampleRateConversion: this.enableSampleRateConversion,
          frameSize: this.transcriberFrameSize
        };

        this._transcriber.initAsync(initParams).then(function () {
          return _this24._status = $$Recorder$es6lib$$Recorder.Status.RECORDING;
        });
      }
    }, {
      key: 'stop',
      value: function stop() {
        this._status = $$Recorder$es6lib$$Recorder.Status.STOPPED;
        this._amplitude = 0;
        this._timeRecorded = 0;
      }
    }, {
      key: 'destroy',
      value: function destroy() {
        this._status = $$Recorder$es6lib$$Recorder.Status.STOPPED;
        this._stream && this._stream.stop();
        this._stream = null;
      }
    }, {
      key: '_update',
      value: function _update(e) {
        var _this25 = this;

        if (this._status != $$Recorder$es6lib$$Recorder.Status.RECORDING) {
          return;
        };

        var audio = e.inputBuffer;
        var signalBuffer = audio.getChannelData(0);

        this._transcriber.pushSignalAsync(signalBuffer).then(function (msg) {
          return _this25._analyzeSignal(msg);
        });
      }
    }, {
      key: '_analyzeSignal',
      value: function _analyzeSignal(msg) {
        var _this26 = this;

        this._amplitude = msg.amplitude;
        this._timeRecorded = msg.timeRecorded;

        if (!msg.isBufferFull) return;

        this.stop();
        this._status = $$Recorder$es6lib$$Recorder.Status.ANALYZING;

        this._transcriber.transcribeAsync().then(function (result) {
          _this26._status = $$Recorder$es6lib$$Recorder.Status.ANALYSIS_SUCCEEDED;
          _this26.onTranscribed(result);
          return _this26._transcriber.getSignalAsync();
        }).then(function (signal) {
          _this26._signal = signal;
        });
      }
    }]);

    return $$Recorder$es6lib$$Recorder;
  })();

  var $$Recorder$es6lib$$default = $$Recorder$es6lib$$Recorder;

  $$Recorder$es6lib$$Recorder.Status = $$utils$Utils$es6lib$$default.createEnum(['STOPPED', 'INIT', 'INIT_SUCCEEDED', 'INIT_FAILED', 'RECORDING', 'ANALYZING', 'ANALYSIS_SUCCEEDED']);
  var $$Renderer$es6lib$$LogoPath = '/images/recording_logo.png';

  var $$Renderer$es6lib$$Renderer = (function () {
    _createClass($$Renderer$es6lib$$Renderer, [{
      key: 'countdownTime',
      get: function get() {
        return this.config.countdownTime;
      },
      set: function set(value) {
        this.config.countdownTime = value;
      }
    }]);

    function $$Renderer$es6lib$$Renderer(config, recorder, canvas, container) {
      var _this27 = this;

      _classCallCheck(this, $$Renderer$es6lib$$Renderer);

      this.config = config;
      this.recorder = recorder;
      this._canvas = canvas;
      this._container = container;

      this._logo = new Image();
      this._logo.addEventListener('load', function () {
        return _this27._updateMetrics();
      });
      this._logo.src = $$Renderer$es6lib$$LogoPath;

      this._canvas.addEventListener('click', function () {
        return _this27._recordClicked();
      });

      this._canvasContext = this._canvas.getContext('2d');
    }

    _createClass($$Renderer$es6lib$$Renderer, [{
      key: '_recordClicked',
      value: function _recordClicked() {
        var _this28 = this;

        if (this._timeLeft > 0) {
          this._timeLeft = 0;
          this.recorder.stop();
          clearInterval(this._timer);
          return;
        }

        switch (this.recorder.status) {
          case $$Recorder$es6lib$$default.Status.STOPPED:
          case $$Recorder$es6lib$$default.Status.ANALYSIS_SUCCEEDED:
            this.recorder.initAsync().then(function () {
              return _this28._startCountingDown();
            });
            break;
          case $$Recorder$es6lib$$default.Status.RECORDING:
            this.recorder.stop();
            break;
        }
      }
    }, {
      key: '_startCountingDown',
      value: function _startCountingDown() {
        var _this29 = this;

        this._timeLeft = this.countdownTime;

        if (this._timeLeft <= 0) {
          this.recorder.start();
        } else {
          this._timer = setInterval(function () {
            return _this29._countdown();
          }, 1000);
        }
      }
    }, {
      key: '_countdown',
      value: function _countdown() {
        this._timeLeft -= 1;
        if (this._timeLeft <= 0) {
          clearInterval(this._timer);
          this.recorder.start();
        }
      }
    }, {
      key: 'draw',
      value: function draw() {
        this._updateCanvasSize();

        this._canvasContext.save();
        this._canvasContext.clearRect(0, 0, this._canvas.width, this._canvas.height);

        this._drawLogo();
        this._drawAmplitude();
        this._drawProgress();
        this._drawStatus();

        this._canvasContext.restore();
      }
    }, {
      key: '_updateCanvasSize',
      value: function _updateCanvasSize() {
        var width = this._container.offsetWidth;
        var height = this._container.offsetHeight;

        this._diameter = width < height ? width : height;

        if (this._canvas.width != this._diameter || this._canvas.height != this._diameter) {
          this._canvas.width = this._diameter;
          this._canvas.height = this._diameter;

          this._updateMetrics();
        }
      }
    }, {
      key: '_updateMetrics',
      value: function _updateMetrics() {
        this._logoCenter = {
          x: this._diameter * 0.5,
          y: this._diameter * 0.4
        };

        // logo
        var logoRadius = this._diameter * 0.3;
        this._logoWidth = logoRadius * 2;
        this._logoHeight = this._logoWidth * this._logo.height / this._logo.width;
        this._logoTopLeft = {
          x: this._logoCenter.x - this._logoWidth / 2,
          y: this._logoCenter.y - this._logoHeight / 2
        };

        // amplitude ring
        this._ringInnerRadius = this._diameter * 0.32;
        this._ringMinWidth = this._diameter * 0.03;
        this._ringMaxWidth = this._diameter * 0.06;

        // progress
        var progressOuterRadius = this._ringInnerRadius;
        this._progressWidth = this._diameter * 0.015;
        this._progressRadius = progressOuterRadius - this._progressWidth / 2;

        // status
        this._statusTop = {
          x: this._logoCenter.x,
          y: this._logoCenter.y + this._ringInnerRadius + this._ringMaxWidth + this._diameter * 0.09
        };
      }
    }, {
      key: '_drawLogo',
      value: function _drawLogo() {
        this._canvasContext.drawImage(this._logo, this._logoTopLeft.x, this._logoTopLeft.y, this._logoWidth, this._logoHeight);
      }
    }, {
      key: '_drawAmplitude',
      value: function _drawAmplitude() {
        var width = this._ringMinWidth;
        var rate = this.recorder.amplitude;

        if (rate) {
          if (rate > 1) rate = 1;
          if (rate < 0) rate = 0;
          width += (this._ringMaxWidth - this._ringMinWidth) * rate;
        }

        var radius = this._ringInnerRadius + width / 2;

        this._canvasContext.beginPath();
        this._canvasContext.arc(this._logoCenter.x, this._logoCenter.y, radius, 0, 2 * Math.PI);
        this._canvasContext.lineWidth = width;
        this._canvasContext.strokeStyle = 'rgb(176, 210, 13)';
        this._canvasContext.stroke();
      }
    }, {
      key: '_drawProgress',
      value: function _drawProgress() {
        if (this.recorder.progress > 0) {
          var angle = 2 * Math.PI * this.recorder.progress;
          var startingAngle = Math.PI / -2;
          var endingAngle = startingAngle + angle;

          this._canvasContext.beginPath();
          this._canvasContext.arc(this._logoCenter.x, this._logoCenter.y, this._progressRadius, startingAngle, endingAngle);
          this._canvasContext.lineWidth = this._progressWidth;
          this._canvasContext.strokeStyle = 'rgba(255, 255, 255, 0.9)';
          this._canvasContext.stroke();
        }
      }
    }, {
      key: '_drawStatus',
      value: function _drawStatus() {
        var status = this._timeLeft > 0 ? 'RECORDING IN ' + this._timeLeft + ' SEC...' : this._getRecorderStatusText();

        this._canvasContext.font = '3vh Roboto';
        this._canvasContext.textBaseline = 'top';
        this._canvasContext.textAlign = 'center';

        this._canvasContext.fillStyle = 'white';
        this._canvasContext.fillText(status, this._statusTop.x, this._statusTop.y);
      }
    }, {
      key: '_getRecorderStatusText',
      value: function _getRecorderStatusText() {
        switch (this.recorder.status) {
          case $$Recorder$es6lib$$default.Status.STOPPED:
            return 'TAP TO RECORD';
          case $$Recorder$es6lib$$default.Status.INIT:
            return 'ACCESSING THE MICROPHONE...';
          case $$Recorder$es6lib$$default.Status.INIT_SUCCEEDED:
            return 'SUCCEEDED';
          case $$Recorder$es6lib$$default.Status.INIT_FAILED:
            return 'ERROR: CANNOT ACCESS THE MICROPHONE. TODO: guide users how to allow microphone access';
          case $$Recorder$es6lib$$default.Status.RECORDING:
            return 'RECORDING... (TAP TO STOP)';
          case $$Recorder$es6lib$$default.Status.ANALYZING:
            return 'ANALYZING... (' + (this.recorder.analysisProgress * 100).toFixed(2) + ' %)';
          case $$Recorder$es6lib$$default.Status.ANALYSIS_SUCCEEDED:
            return 'SUCCEEDED';
        }
      }
    }]);

    return $$Renderer$es6lib$$Renderer;
  })();

  var $$Renderer$es6lib$$default = $$Renderer$es6lib$$Renderer;

  var $$pages$record$RecordController$es6lib$$RecordController = (function (_$$$$$$ControllerBase$es6lib$$default8) {
    _inherits($$pages$record$RecordController$es6lib$$RecordController, _$$$$$$ControllerBase$es6lib$$default8);

    function $$pages$record$RecordController$es6lib$$RecordController($scope, $rootScope, $location) {
      var _this30 = this;

      _classCallCheck(this, $$pages$record$RecordController$es6lib$$RecordController);

      _get(Object.getPrototypeOf($$pages$record$RecordController$es6lib$$RecordController.prototype), 'constructor', this).call(this, $scope);
      this.$location = $location;
      this.config = $$$$$$Config$es6lib$$default;
      this.utils = $$utils$Utils$es6lib$$default;
      this.audioContext = this.config.audioContext;

      this.recorder = new $$Recorder$es6lib$$default(this.config, this.audioContext);
      this.recorder.onTranscribed = function (result) {
        return _this30.onTranscribed(result);
      };

      var canvas = $('#canvas')[0];
      var container = canvas.parentNode;

      this.renderer = new $$Renderer$es6lib$$default(this.config, this.recorder, canvas, container);

      this._requestId = window.requestAnimationFrame(function () {
        return _this30._update();
      });

      $scope.$on('$routeChangeStart', function () {
        window.cancelAnimationFrame(_this30._requestId);
        _this30.recorder.close();
      });

      document.title = 'Tunepal.org > Record';
    }

    _createClass($$pages$record$RecordController$es6lib$$RecordController, [{
      key: '_update',
      value: function _update() {
        var _this31 = this;

        this.renderer.draw();

        this._requestId = window.requestAnimationFrame(function () {
          return _this31._update();
        });
      }
    }, {
      key: 'onTranscribed',
      value: function onTranscribed(result) {
        var _this32 = this;

        this.$scope.$apply(function () {
          _this32.$location.url('/notesSearch/' + result.transcription);
        });
      }
    }, {
      key: 'playSignal',
      value: function playSignal() {
        var _this33 = this;

        if (this.signalPlayer) {
          this.signalPlayer.stop(0);
          this.signalPlayer = null;
        } else {
          if (!this._audio) {
            this._audio = this.audioContext.createBuffer(1, this.recorder.numSamples, this.recorder.sampleRate);
            this._audio.copyToChannel(this.recorder.signal, 0);
          }

          this.signalPlayer = this.audioContext.createBufferSource();
          this.signalPlayer.buffer = this._audio;
          this.signalPlayer.connect(this.audioContext.destination);
          this.signalPlayer.onended = this.apply(function () {
            return _this33.signalPlayer = null;
          });
          this.signalPlayer.start(0, 0, this._audio.duration);
        }
      }
    }]);

    return $$pages$record$RecordController$es6lib$$RecordController;
  })($$$$$$ControllerBase$es6lib$$default);

  var $$pages$record$RecordController$es6lib$$default = $$pages$record$RecordController$es6lib$$RecordController;

  var $$pages$settings$SettingsController$es6lib$$SettingsController = (function (_$$$$$$ControllerBase$es6lib$$default9) {
    _inherits($$pages$settings$SettingsController$es6lib$$SettingsController, _$$$$$$ControllerBase$es6lib$$default9);

    function $$pages$settings$SettingsController$es6lib$$SettingsController($scope, $rootScope, $http, $routeParams, $timeout) {
      var _this34 = this;

      _classCallCheck(this, $$pages$settings$SettingsController$es6lib$$SettingsController);

      _get(Object.getPrototypeOf($$pages$settings$SettingsController$es6lib$$SettingsController.prototype), 'constructor', this).call(this, $scope);
      this.$http = $http;
      this.config = $$$$$$Config$es6lib$$default;
      this.utils = $$utils$Utils$es6lib$$default;

      var options = $routeParams['options'];
      if (options) {
        options = options.split('/');
        this.options = [];
        var _iteratorNormalCompletion13 = true;
        var _didIteratorError13 = false;
        var _iteratorError13 = undefined;

        try {
          for (var _iterator13 = options[Symbol.iterator](), _step13; !(_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
            var option = _step13.value;

            this.options[option] = true;
          }
        } catch (err) {
          _didIteratorError13 = true;
          _iteratorError13 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion13 && _iterator13['return']) {
              _iterator13['return']();
            }
          } finally {
            if (_didIteratorError13) {
              throw _iteratorError13;
            }
          }
        }
      }
      //TODO:
      this.options = this.options || {};
      this.options.dev = true;

      this.showLoading = true;
      this.showTunebooks = false;

      this._initMidiInstruments();
      this.validatePlaybackSpeed();
      $timeout(function () {
        return _this34._initPopupOptions();
      });

      document.title = 'Tunepal.org > Settings';
    }

    _createClass($$pages$settings$SettingsController$es6lib$$SettingsController, [{
      key: '_initPopupOptions',
      value: function _initPopupOptions() {
        var _this35 = this;

        if ($$utils$Utils$es6lib$$default.view.isLarge) {
          $('.modal').removeClass('bottom-sheet');
        }

        // bind modal triggers to their modals
        $('.modal-trigger').leanModal({
          complete: function complete() {
            _this35.showLoading = true;
            _this35.showTunebooks = false;
          }
        });

        // scroll to the first selected item when modal is popping up
        $('.modal-trigger').each(function (i, trigger) {
          $(trigger).click(function () {
            var modal = $(trigger.hash);
            var content = modal.find('.modal-content');
            var current = content.find('.secondary-content').parent();
            if (current == null) return;

            var scrollTop = current[0].offsetTop + current.outerHeight() - content.height() / 2;
            content.animate({ scrollTop: scrollTop }, 500);
          });
        });
      }
    }, {
      key: '_initMidiInstruments',
      value: function _initMidiInstruments() {
        $.each($$$$$$Config$es6lib$$default.MidiInstruments, function (i, item) {
          $('select[model="settings.config.melody"]').append($('<option>', {
            value: item,
            text: item
          }));

          $('select[model="settings.config.chords"]').append($('<option>', {
            value: item,
            text: item
          }));
        });
      }
    }, {
      key: 'set',
      value: function set(key, value) {
        this.config[key] = value;
        $('#' + key + '-sheet').closeModal();
      }
    }, {
      key: 'setTunebooks',
      value: function setTunebooks(id) {
        this.config.tunebooks.toggle(id);
      }
    }, {
      key: 'validatePlaybackSpeed',
      value: function validatePlaybackSpeed() {
        var value = parseInt(this.config.playbackSpeed);
        var input = $('input[ng-model="settings.config.playbackSpeed"]');

        if (isNaN(value) || value <= 0) {
          input.removeClass('valid').addClass('invalid');
        } else {
          input.removeClass('invalid').addClass('valid');
        }
      }
    }, {
      key: 'updateTunebooks',
      value: function updateTunebooks() {
        var _this36 = this;

        this.config.tunebooks.updateTunebooks(this.$http).then(this.apply(function () {
          _this36.showLoading = false;
          _this36.showTunebooks = true;
        }));
      }
    }, {
      key: 'expectedAutoFrameSize',
      get: function get() {
        var sampleRate = this.config.enableSampleRateConversion ? 22050 : this.config.audioContext.sampleRate;
        return $$utils$Utils$es6lib$$default.transcriber.calcFrameSize(sampleRate);
      }
    }]);

    return $$pages$settings$SettingsController$es6lib$$SettingsController;
  })($$$$$$ControllerBase$es6lib$$default);

  var $$pages$settings$SettingsController$es6lib$$default = $$pages$settings$SettingsController$es6lib$$SettingsController;

  var $$MidiPlayer$es6lib$$MidiPlayer = (function (_$$$$$$ControllerBase$es6lib$$default10) {
    _inherits($$MidiPlayer$es6lib$$MidiPlayer, _$$$$$$ControllerBase$es6lib$$default10);

    function $$MidiPlayer$es6lib$$MidiPlayer($scope, $timeout) {
      _classCallCheck(this, $$MidiPlayer$es6lib$$MidiPlayer);

      _get(Object.getPrototypeOf($$MidiPlayer$es6lib$$MidiPlayer.prototype), 'constructor', this).call(this, $scope);
      this.$timeout = $timeout;

      this.ready = false;
      this.isPlaying = false;
      this.isStopped = true;
    }

    _createClass($$MidiPlayer$es6lib$$MidiPlayer, [{
      key: 'initAsync',
      value: function initAsync(tune) {
        var _this37 = this;

        this.tune = tune;
        console.log('Initializing MIDI.js...');

        this._initPluginAsync().then(function () {
          return _this37._generateMidiAsync();
        }).then(function () {
          return _this37._loadMidiAsync();
        }).then(this.apply(function () {
          _this37.ready = true;
          _this37.$timeout(function () {
            return $$utils$Utils$es6lib$$default.view.initTooltips();
          });
        }));
      }
    }, {
      key: '_initPluginAsync',
      value: function _initPluginAsync() {
        return new Promise(function (resolve, reject) {
          MIDI.loadPlugin({
            soundfontUrl: '../../../lib/midi.js/soundfont/',
            instrument: 'acoustic_grand_piano',
            onsuccess: resolve
          });
        });
      }
    }, {
      key: '_generateMidiAsync',
      value: function _generateMidiAsync() {
        var _this38 = this;

        return new Promise(function (resolve, reject) {
          console.log('ABC: ' + _this38.tune.notation);
          _this38._midi = abc2midi(_this38.tune.notation);
          var b64encoded = btoa(String.fromCharCode.apply(null, _this38._midi));
          _this38._midiUrl = 'data:audio/midi;base64,' + b64encoded;
          resolve(_this38._midiUrl);
        });
      }
    }, {
      key: '_loadMidiAsync',
      value: function _loadMidiAsync() {
        var _this39 = this;

        return new Promise(function (resolve, reject) {
          var onsuccess = function onsuccess() {
            console.log('Sound being generated with ' + MIDI.api + ' ' + JSON.stringify(MIDI.supports));
            resolve();
          };

          var onprogress = function onprogress(stats, percent) {
            percent *= 100;
            console.log('Reading audio file (' + percent.toFixed(2) + '%)...');
          };

          var onerror = function onerror(e) {
            console.log('Error: ' + e.message + '\n' + e.stack);
          };

          console.log('MIDI URL: ' + _this39._midiUrl);
          MIDI.Player.loadFile(_this39._midiUrl, onsuccess, onprogress, onerror);

          MIDI.Player.setAnimation(function (data) {
            var now = data.now < data.end ? data.now : data.end;
            var end = data.end;
            if (now === end) {
              _this39.$scope.$apply(function () {
                _this39.isPlaying = false;
                _this39.isStopped = true;
                MIDI.Player.stop();
              });
            }
          });
        });
      }
    }, {
      key: 'togglePlaying',
      value: function togglePlaying() {
        this.isPlaying ? this.pausePlaying() : this.startPlaying();
      }
    }, {
      key: 'startPlaying',
      value: function startPlaying() {
        this.isPlaying = true;
        this.isStopped = false;
        MIDI.Player.resume();
      }
    }, {
      key: 'pausePlaying',
      value: function pausePlaying() {
        this.isPlaying = false;
        this.isStopped = false;
        MIDI.Player.pause();
      }
    }, {
      key: 'stopPlaying',
      value: function stopPlaying() {
        this.isPlaying = false;
        this.isStopped = true;
        MIDI.Player.stop();
      }
    }, {
      key: 'download',
      value: function download() {
        var blob = $$utils$Utils$es6lib$$default.blob.dataURLToBlob(this._midiUrl);
        saveAs(blob, this.tune.title + '.midi');
      }
    }]);

    return $$MidiPlayer$es6lib$$MidiPlayer;
  })($$$$$$ControllerBase$es6lib$$default);

  var $$MidiPlayer$es6lib$$default = $$MidiPlayer$es6lib$$MidiPlayer;

  var $$pages$tune$TuneController$es6lib$$TuneController = (function (_$$$$$$ControllerBase$es6lib$$default11) {
    _inherits($$pages$tune$TuneController$es6lib$$TuneController, _$$$$$$ControllerBase$es6lib$$default11);

    function $$pages$tune$TuneController$es6lib$$TuneController($scope, $rootScope, $routeParams, $http, $timeout, $sce, $localForage) {
      var _this40 = this;

      _classCallCheck(this, $$pages$tune$TuneController$es6lib$$TuneController);

      _get(Object.getPrototypeOf($$pages$tune$TuneController$es6lib$$TuneController.prototype), 'constructor', this).call(this, $scope);
      this.$rootScope = $rootScope;
      this.$timeout = $timeout;
      this.$http = $http;
      this.$sce = $sce;
      this.config = $$$$$$Config$es6lib$$default;
      this.utils = $$utils$Utils$es6lib$$default;

      this.showTune = false;
      this.showEuropeanaResults = false;
      this.showEuropeanaLoading = false;
      this.showEuropeanaNoResults = false;
      this.isEditing = false;

      // MIDI Playback
      this.midi = new $$MidiPlayer$es6lib$$default(this.$scope, this.$timeout);
      this.$scope.$watchCollection('midi', function () {});

      this.tunepalIdEncoded = $routeParams['tunepalIdEncoded'];
      this.tunepalId = decodeURIComponent(this.tunepalIdEncoded);

      if ($$utils$Utils$es6lib$$default.cache.tune.tunepalId === this.tunepalId) {
        this.tune = $$utils$Utils$es6lib$$default.cache.tune;
        this._initTune();
      } else {
        $$$$$$models$TunepalApi$es6lib$$default.fetchTuneAsync(this.$http, this.tunepalIdEncoded).then(function (tune) {
          _this40.tune = tune;
          _this40._initTune();
        });
      }

      this._initUi();

      $scope.$on('$routeChangeStart', function () {
        _this40.midi.stopPlaying();
      });
    }

    _createClass($$pages$tune$TuneController$es6lib$$TuneController, [{
      key: '_initTune',
      value: function _initTune() {
        var _this41 = this;

        this.midi.initAsync(this.tune);
        this._initUi();
        this.$timeout(function () {
          return _this41._createAbcEditor();
        });
        document.title = 'Tunepal.org > Tune > ' + this.tune.title;
        this.showTune = true;

        this.showEuropeanaLoading = true;
        this.europeanaPortalUrl = $$$$$$models$EuropeanaApi$es6lib$$default.getPortalUrl(this.tune);

        $$$$$$models$EuropeanaApi$es6lib$$default.searchFetchAsync(this.$http, this.tune, this.$sce, 1, 5).then(function (results) {
          return _this41._initEuropeanaResults(results);
        });
      }
    }, {
      key: '_initEuropeanaResults',
      value: function _initEuropeanaResults(results) {
        var _this42 = this;

        if (results.items.length > 0) {
          this.europeana = results;
          this.showEuropeanaResults = true;
          this.showEuropeanaLoading = false;
          this.$timeout(function () {
            return _this42.utils.view.initTooltips();
          });
        } else {
          this.showEuropeanaLoading = false;
          this.showEuropeanaNoResults = true;
        }
      }
    }, {
      key: '_initUi',
      value: function _initUi() {
        var _this43 = this;

        this.$timeout(function () {
          _this43.utils.view.initDropdown();
          _this43.utils.view.initTooltips();
        });

        $(window).resize(this.apply(function () {
          _this43._changeLayout();
          _this43._resizeScore();
        }));

        this._changeLayout();
      }
    }, {
      key: '_changeLayout',
      value: function _changeLayout() {
        this.isLandscape = $$utils$Utils$es6lib$$default.view.isLandscape;
      }
    }, {
      key: '_createAbcEditor',
      value: function _createAbcEditor() {
        var _this44 = this;

        $('#abc').val(this.tune.notation);

        this.abcEditor = new ABCJS.Editor('abc', {
          paper_id: 'score',
          onchange: function onchange() {
            return _this44._resizeScore();
          }
        });

        this._resizeScore();
      }
    }, {
      key: '_resizeScore',
      value: function _resizeScore() {
        var cardContent = $('.score.card-content');
        var cardScore = $('#card-score');
        var score = $('#score');

        var windowWidth = $(window).width();
        var windowHeight = $(window).height();
        var scale = cardScore.width() / score.width();

        if (!this.isEditing || this.isLandscape) {
          cardScore.css('transform', 'scale(' + scale + ')');
          cardContent.height(cardScore.height() * scale);
        } else {
          // The "64" below is the pixels of navbar, see _variables.scss:
          // $navbar-height: 64px !default;
          var halfHeight = $$utils$Utils$es6lib$$default.view.isMediumOrDown ? windowHeight / 2 : (windowHeight - 64) / 2;

          var cardContentHeight = cardScore.height() * scale;

          if (cardContentHeight > halfHeight) {
            cardContentHeight = halfHeight;
            scale = cardContentHeight / score.height();
          }

          cardScore.css('transform', 'scale(' + scale + ')');
          cardContent.height(cardContentHeight);
        }
      }
    }, {
      key: 'toggleEditing',
      value: function toggleEditing() {
        var _this45 = this;

        this.isEditing = !this.isEditing;

        this.$timeout(function () {
          _this45._resizeScore();

          if (_this45.isEditing) {
            // scroll to active element
            var scrollTop = $('#card-score').offset().top;
            $('html, body').animate({ scrollTop: scrollTop }, 500);
          }
        });
      }
    }, {
      key: 'showAddThis',
      value: function showAddThis() {
        var addThisButton = document.getElementById('at4m-sb');
        addThisButton.click();
      }
    }, {
      key: 'downloadAbc',
      value: function downloadAbc() {
        var blob = new Blob([this.tune.notation], { type: 'text/vnd.abc' });
        saveAs(blob, this.tune.title + '.abc');
      }
    }]);

    return $$pages$tune$TuneController$es6lib$$TuneController;
  })($$$$$$ControllerBase$es6lib$$default);

  var $$pages$tune$TuneController$es6lib$$default = $$pages$tune$TuneController$es6lib$$TuneController;

  var $$Routing$es6lib$$Routing = function $$Routing$es6lib$$Routing(app) {
    _classCallCheck(this, $$Routing$es6lib$$Routing);

    app.controller('AboutController', $$pages$about$AboutController$es6lib$$default);
    app.controller('DiscographyController', $$pages$discography$DiscographyController$es6lib$$default);
    app.controller('EuropeanaController', $$pages$europeana$EuropeanaController$es6lib$$default);
    app.controller('HelpController', $$pages$help$HelpController$es6lib$$default);
    app.controller('IndexController', $$pages$index$IndexController$es6lib$$default);
    app.controller('KeywordSearchController', $$pages$keywordSearch$KeywordSearchController$es6lib$$default);
    app.controller('NotesSearchController', $$pages$notesSearch$NotesSearchController$es6lib$$default);
    app.controller('RandomTuneController', $$pages$randomTune$RandomTuneController$es6lib$$default);
    app.controller('RecordController', $$pages$record$RecordController$es6lib$$default);
    app.controller('SettingsController', $$pages$settings$SettingsController$es6lib$$default);
    app.controller('TuneController', $$pages$tune$TuneController$es6lib$$default);

    app.config(function ($routeProvider, $locationProvider) {
      $routeProvider.when('/about', {
        controller: 'AboutController',
        controllerAs: 'about',
        templateUrl: 'scripts/pages/about/about.html'
      }).when('/discography/:keywordEncoded', {
        controller: 'DiscographyController',
        controllerAs: 'discography',
        templateUrl: 'scripts/pages/discography/discography.html'
      }).when('/europeana/:tunepalIdEncoded', {
        controller: 'EuropeanaController',
        controllerAs: 'europeana',
        templateUrl: 'scripts/pages/europeana/europeana.html'
      }).when('/help', {
        controller: 'HelpController',
        controllerAs: 'help',
        templateUrl: 'scripts/pages/help/help.html'
      }).when('/keywordSearch/:keywordEncoded?/:selectedTunepalIdEncoded?', {
        controller: 'KeywordSearchController',
        controllerAs: 'keywordSearch',
        templateUrl: 'scripts/pages/keywordSearch/keywordSearch.html'
      }).when('/notesSearch/:notes/:selectedTunepalIdEncoded?', {
        controller: 'NotesSearchController',
        controllerAs: 'notesSearch',
        templateUrl: 'scripts/pages/notesSearch/notesSearch.html'
      }).when('/randomTune', {
        controller: 'RandomTuneController',
        controllerAs: 'randomTune',
        templateUrl: 'scripts/pages/randomTune/randomTune.html'
      }).when('/record', {
        controller: 'RecordController',
        controllerAs: 'record',
        templateUrl: 'scripts/pages/record/record.html'
      }).when('/settings', {
        controller: 'SettingsController',
        controllerAs: 'settings',
        templateUrl: 'scripts/pages/settings/settings.html'
      }).when('/settings/:options*', {
        controller: 'SettingsController',
        controllerAs: 'settings',
        templateUrl: 'scripts/pages/settings/settings.html'
      }).when('/tune/:tunepalIdEncoded', {
        controller: 'TuneController',
        controllerAs: 'tune',
        templateUrl: 'scripts/pages/tune/tune.html'
      }).otherwise('/record');

      $locationProvider.hashPrefix('!');
    });
  };

  var $$Routing$es6lib$$default = $$Routing$es6lib$$Routing;

  var $$utils$SearchParams$es6lib$$SearchParams = (function () {
    function $$utils$SearchParams$es6lib$$SearchParams() {
      _classCallCheck(this, $$utils$SearchParams$es6lib$$SearchParams);

      this.params = [];
      var query = location.search.substring(1);
      var fragments = query.split('&');
      var _iteratorNormalCompletion14 = true;
      var _didIteratorError14 = false;
      var _iteratorError14 = undefined;

      try {
        for (var _iterator14 = fragments[Symbol.iterator](), _step14; !(_iteratorNormalCompletion14 = (_step14 = _iterator14.next()).done); _iteratorNormalCompletion14 = true) {
          var fragment = _step14.value;

          var pair = fragment.split('=');
          this.params[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
        }
      } catch (err) {
        _didIteratorError14 = true;
        _iteratorError14 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion14 && _iterator14['return']) {
            _iterator14['return']();
          }
        } finally {
          if (_didIteratorError14) {
            throw _iteratorError14;
          }
        }
      }
    }

    _createClass($$utils$SearchParams$es6lib$$SearchParams, [{
      key: 'has',
      value: function has(key) {
        return typeof this.params[key] === 'undefined';
      }
    }, {
      key: 'get',
      value: function get(key) {
        return this.params[key];
      }
    }]);

    return $$utils$SearchParams$es6lib$$SearchParams;
  })();

  var $$utils$SearchParams$es6lib$$default = $$utils$SearchParams$es6lib$$SearchParams;

  var $$SeoController$es6lib$$SeoController = (function () {
    function $$SeoController$es6lib$$SeoController() {
      _classCallCheck(this, $$SeoController$es6lib$$SeoController);

      var params = new $$utils$SearchParams$es6lib$$default();
      this._route = params.get('_escaped_fragment_');
    }

    _createClass($$SeoController$es6lib$$SeoController, [{
      key: 'navigate',
      value: function navigate() {
        location.replace('/#!' + this._route);
      }
    }, {
      key: 'enabled',
      get: function get() {
        return this._route != null;
      }
    }]);

    return $$SeoController$es6lib$$SeoController;
  })();

  var $$SeoController$es6lib$$default = $$SeoController$es6lib$$SeoController;

  var app$scripts$App$es6$$seo = new $$SeoController$es6lib$$default();

  if (app$scripts$App$es6$$seo.enabled) {
    app$scripts$App$es6$$seo.navigate();
  } else {
    var app$scripts$App$es6$$app = angular.module('TunepalApp', ['ngCookies', 'ngRoute', 'LocalForageModule']);
    var app$scripts$App$es6$$routing = new $$Routing$es6lib$$default(app$scripts$App$es6$$app);
    var app$scripts$App$es6$$directive = new $$Directive$es6lib$$default(app$scripts$App$es6$$app);
  }

  $(function () {
    FastClick.attach(document.body);

    $(".button-collapse").sideNav();

    // Side Navigation fix
    $('.side-nav li a').on('click', function (e) {
      if ($$utils$Utils$es6lib$$default.view.isMediumOrDown) {
        $('.button-collapse').sideNav('hide');
      }
    });

    $('.drag-target').remove();
  });
