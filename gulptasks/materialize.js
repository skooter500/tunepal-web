'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var runSequence = require('run-sequence');
var swallowError = require('./swallow-error');

// Build Materialize js
gulp.task('materialize-js', function () {
  var jsFiles = [
    'js/jquery.easing.1.3.js',
    'js/animation.js',
    'js/velocity.min.js',
    'js/hammer.min.js',
    'js/jquery.hammer.js',
    'js/global.js',
    'js/collapsible.js',
    'js/dropdown.js',
    'js/leanModal.js',
    'js/materialbox.js',
    'js/parallax.js',
    'js/tabs.js',
    'js/tooltip.js',
    'js/waves.js',
    'js/toasts.js',
    'js/sideNav.js',
    'js/scrollspy.js',
    'js/forms.js',
    'js/slider.js',
    'js/cards.js',
    'js/pushpin.js',
    'js/buttons.js',
    'js/transitions.js',
    'js/scrollFire.js',
    'js/date_picker/picker.js',
    'js/date_picker/picker.date.js',
    'js/character_counter.js',
  ];

  return gulp.src(jsFiles, {cwd: 'app/lib/materialize'})
    .pipe($.plumber({
      errorHandler: swallowError
    }))
    .pipe($.concat('materialize.js'))
    .pipe(gulp.dest('.tmp/lib/materialize/js'))
    .pipe($.size({title: 'materialize-js'}));
});

// Copy Materialize fonts to tmp
gulp.task('materialize-fonts', function () {
  return gulp.src('font/**/*', {cwd: 'app/lib/materialize'})
    .pipe(gulp.dest('.tmp/lib/materialize/font'))
    .pipe($.size({title: 'materialize-fonts'}));
});

// Copy Materialize fonts to tmp
gulp.task('materialize-styles', function () {
  return gulp.src('app/styles/materialize.scss')
    .pipe($.plumber({
      errorHandler: swallowError
    }))
    .pipe($.sass({
        includePaths: ['./app/styles'],
        outputStyle: 'expanded'
      })
      .on('error', $.sass.logError)
    )
    .pipe(gulp.dest('.tmp/lib/materialize/css'))
    .pipe($.size({title: 'materialize-styles'}));
});

// Build Materialize
gulp.task('materialize', function (cb) {
  runSequence(
    ['materialize-fonts', 'materialize-js', 'materialize-styles'],
    cb);
});
