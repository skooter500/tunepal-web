'use strict';

var gulp = require('gulp');
var $ = require('./gulp-plugins');
var runSequence = require('run-sequence');
var swallowError = require('./swallow-error');

// Build MIDI js
gulp.task('midi-js', function () {
  var jsFiles = [
    'inc/shim/Base64.js',
    'inc/shim/Base64binary.js',
    'inc/shim/WebAudioAPI.js',
    'inc/shim/WebMIDIAPI.js',
    'inc/jasmid/midifile.js',
    'inc/jasmid/replayer.js',
    'inc/jasmid/stream.js',
    'js/midi/audioDetect.js',
    'js/midi/gm.js',
    'js/midi/loader.js',
    'js/midi/player.js',
    'js/midi/plugin.audiotag.js',
    'js/midi/plugin.webaudio.js',
    'js/midi/plugin.webmidi.js',
    'js/midi/synesthesia.js',
    'js/util/dom_request_xhr.js',
    'js/util/dom_request_script.js',
  ];

  return gulp.src(jsFiles, {cwd: 'app/lib/midi.js'})
    .pipe($.plumber({
      errorHandler: swallowError
    }))
    .pipe($.concat('MIDI.js'))
    .pipe(gulp.dest('.tmp/lib/midi.js/js'))
    .pipe($.size({title: 'midi-js'}));
});

// Copy MIDI sound fonts to tmp
gulp.task('midi-soundfonts', function () {
  return gulp.src('examples/soundfont/**/*', {cwd: 'app/lib/midi.js'})
    .pipe(gulp.dest('.tmp/lib/midi.js/soundfont'))
    .pipe($.size({title: 'midi-soundfonts'}));
});

// Build MIDI
gulp.task('midi', function (cb) {
  runSequence(
    ['midi-soundfonts', 'midi-js'],
    cb);
});
