'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var del = require('del');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var merge = require('merge-stream');
var path = require('path');
var fs = require('fs');
var glob = require('glob');
var through = require('through2');
var transform = require('vinyl-transform');

function swallowError(err) {
  console.log(err.toString());
  this.emit('end');
}

gulp.task('html', function() {
  return gulp.src(['app/index.html', 'app/pages/**/*.html'])
  .pipe($.htmlhint())
  .pipe($.htmlhint.reporter())
  .pipe($.size({title: 'materialize-fonts'}));
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

// Build Materialize and SASS
gulp.task('styles', function () {
  return gulp.src(['app/styles/main.scss'])
    .pipe($.plumber({
      errorHandler: swallowError
    }))
    .pipe($.sass({
        includePaths: ['app/styles'],
        outputStyle: 'expanded'
      })
      .on('error', $.sass.logError)
    )
    .pipe(gulp.dest('.tmp/styles'))
    .pipe($.size({title: 'styles'}));
});

// Build ECMAScript 6
gulp.task('es6', function () {
  return gulp.src(['app/**/*.es6'])
    .pipe($.plumber({
      errorHandler: swallowError
    }))
    .pipe($.es6ModuleTranspiler())
    .pipe($.babel())
    .pipe($.rename(function (filePath) {
      filePath.dirname = filePath.dirname.replace('app' + path.sep, '');
      filePath.basename = filePath.basename.replace('.es6', '');
      filePath.extname = '.js';
    }))
    .pipe(gulp.dest('.tmp'))
    .pipe($.size({title: 'es6'}));
});

// Clean output directories
gulp.task('clean', del.bind(null, [
  '.tmp',
  '.tmp_merges',
  'merges',
  'www'
]));

gulp.task('build', function (cb) {
  runSequence(
    'clean',
    ['html', 'materialize', 'styles', 'es6'],
    cb);
});

// Watch files for changes & reload
gulp.task('serve', ['build'], function () {
  browserSync({
    notify: false,
    server: {
      baseDir: ['.tmp', 'app']
    }
  });

  gulp.watch(['app/index.html', 'app/pages/**/*.html'], ['html', reload]);
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

// Copy files to www
gulp.task('copy', function () {
  var images = gulp.src(['app/images/**/*'])
    .pipe(gulp.dest('www/images'));

  var rootFiles = gulp.src(['app/*'])
    .pipe(gulp.dest('www'));

  var tmpFiles = gulp.src(['.tmp/**/*'])
    .pipe(gulp.dest('www'));

  return merge(images, rootFiles, tmpFiles)
    .pipe($.size({title: 'copy'}));
});

// Search and minify html, js, css
gulp.task('minify-search', function () {
  var assets = $.useref.assets({searchPath: ['.tmp', 'app']});

  return gulp.src(['app/**/*.html', '!app/lib/materialize/**/*.html'])
    .pipe(assets)
    .pipe($.debug())
    // Remove console, alert, and debugger statements from code
    .pipe($.if('*.js', $.stripDebug()))
    // Concatenate And Minify JavaScript
    .pipe($.if('**/App.js', $.uglify({mangle: false})))
    .pipe($.if(['**/*.js', '!**/App.js'], $.uglify({mangle: true})))
    // Concatenate And Minify Styles
    // In case you are still using useref build blocks
    .pipe($.if('*.css', $.cssmin()))
    .pipe(assets.restore())
    .pipe($.useref())
    // Minify Any HTML
    .pipe($.if('*.html', $.minifyHtml({
      empty: true,  // do not remove empty attributes
      conditionals: true,  // do not remove conditional internet explorer comments
      spare:true  // do not remove redundant attributes
    })))
    // Output Files
    .pipe(gulp.dest('www'))
    .pipe($.size({title: 'minify-search'}));
});

gulp.task('minify', ['minify-search'], function () {
  //TODO
  //var images = gulp.src(['app/images/**/*'])

  var dsp = gulp.src(['app/scripts/3rdparty/dsp.js'])
    .pipe($.uglify())
    .pipe(gulp.dest('www/scripts/3rdparty'));

  var transcriber = gulp.src(['.tmp/scripts/transcription/TranscriberWorker.js'])
    .pipe($.uglify())
    .pipe(gulp.dest('www/scripts/transcription'));

  return merge(dsp, transcriber)
    .pipe($.size({title: 'minify'}));
});

// Deploy to GAE
gulp.task('deploy', $.shell.task([
  'appcfg.py update www'
]));

// Build production files, the default task
gulp.task('default', function (cb) {
  runSequence(
    'clean',
    ['html', 'materialize', 'styles', 'es6'],
    'copy',
    'minify',
    cb);
});
