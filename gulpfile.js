'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')({rename: {
  'gulp-strip-debug': 'strip_debug',
  'gulp-es6-module-transpiler': 'concat_module'
}});
var del = require('del');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var merge = require('merge-stream');
var path = require('path');
var fs = require('fs');
var glob = require('glob');
var through = require('through2');
var babelify = require('babelify');
var browserify = require('browserify');
var transform = require('vinyl-transform');

function swallowError(err) {
  console.log(err.toString());
  this.emit('end');
}

// Copy All Files At The Root Level (app)
gulp.task('copy', function () {
  var app = gulp.src('app/*')
    .pipe(gulp.dest('www'));

  return merge(app)
    .pipe($.size({title: 'copy'}));
});

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
    .pipe($.strip_debug())
    .pipe($.concat('materialize.js'))
    //.pipe($.uglify())  //TODO: separate debug and release build
    .pipe($.rename('materialize.min.js'))
    .pipe(gulp.dest('.tmp/lib/materialize/js'))
    .pipe($.size({title: 'Materialize js'}));
});

// Copy Materialize fonts
gulp.task('materialize-fonts', function () {
  return gulp.src('font/**/*', {cwd: 'app/lib/materialize'})
    .pipe(gulp.dest('.tmp/lib/materialize/font'))
    .pipe($.size({title: 'Materialize fonts'}));
});

// Copy Materialize fonts
gulp.task('materialize-styles', function () {
  var sassTask = gulp.src('app/styles/materialize.scss')
    .pipe($.plumber({
      errorHandler: swallowError
    }))
    .pipe($.sass({outputStyle: 'compressed'}).on('error', $.sass.logError))
    .pipe($.rename('materialize.min.css'))
    .pipe(gulp.dest('.tmp/lib/materialize/css'))
    .pipe($.size({title: 'Materialize fonts'}));
});

// Build Materialize
gulp.task('materialize', function (cb) {
  runSequence(
    'materialize-fonts',
    'materialize-js',
    'materialize-styles',
    cb);
});

// Build Materialize and sass
gulp.task('styles', function () {
  var sassTask = gulp.src(['app/styles/**/*.scss', '!app/styles/materialize.scss'])
    .pipe($.plumber({
      errorHandler: swallowError
    }))
    .pipe($.sass({outputStyle: 'compressed'}).on('error', $.sass.logError))
    .pipe(gulp.dest('.tmp/styles'))
    .pipe($.size({title: 'Styles'}));
});

// Build ECMAScript 6
gulp.task('es6', function () {
  return gulp.src(['app/**/*.es6'])
    .pipe($.plumber({
      errorHandler: swallowError
    }))
    .pipe($.concat_module())
    .pipe($.babel())
    .pipe($.rename(function (filePath) {
      filePath.dirname = filePath.dirname.replace('app' + path.sep, '');
      filePath.basename = filePath.basename.replace('.es6', '');
      filePath.extname = '.js';
    }))
    .pipe(gulp.dest('.tmp'))
    .pipe($.size({title: 'ECMAScript 6 Compile'}));
});

// Clean Output Directory
gulp.task('clean', del.bind(null, [
  '.tmp',
  '.tmp_merges',
  'merges',
  'www'
]));

gulp.task('build-debug', function (cb) {
  runSequence(
    'clean',
    ['materialize', 'styles', 'es6'],
    cb);
});

// Watch Files For Changes & Reload
gulp.task('serve', ['build-debug'], function () {
  browserSync({
    notify: false,
    server: {
      baseDir: ['.tmp', 'app']
    }
  });

  gulp.watch(['app/index.html', 'app/pages/**/*.html'], reload);
  gulp.watch(['app/{pages,scripts}/**/*.{es6,es6lib}'], ['es6', reload]);
  gulp.watch(['app/styles/_variables.scss'], ['materialize-styles', 'styles', reload]);
  gulp.watch(['app/styles/materialize.scss'], ['materialize-styles', reload]);
  gulp.watch(['app/styles/**/*.scss', '!app/styles/{_variables,materialize}.scss'], ['styles', reload]);
});

// Build and serve the output from the dist build
gulp.task('serve:dist', ['default'], function () {
  browserSync({
    notify: false,
    server: {
      baseDir: ['www']
    }
  });
});

// Build Production Files, the Default Task
gulp.task('default', ['clean'], function (cb) {
  runSequence(
    ['copy', 'styles', 'es6'],
    cb);
});
