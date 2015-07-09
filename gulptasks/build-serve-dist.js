'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var runSequence = require('run-sequence');
var browserSync = require('browser-sync');
var merge = require('merge-stream');

// Copy files to www
gulp.task('copy', function () {
  var assets = gulp.src(['app/assets/**/*'])
    .pipe(gulp.dest('www/assets'));

  var images = gulp.src(['app/images/**/*'])
    .pipe(gulp.dest('www/images'));

  var rootFiles = gulp.src(['app/*'])
    .pipe(gulp.dest('www'));

  var tmpFiles = gulp.src(['.tmp/**/*'])
    .pipe(gulp.dest('www'));

  return merge(assets, images, rootFiles, tmpFiles)
    .pipe($.size({title: 'copy'}));
});

gulp.task('build:dist', function (cb) {
  runSequence(
    'clean',
    ['html', 'materialize', 'midi', 'styles', 'es6'],
    'copy',
    'minify',
    cb);
});

// Build and serve the output from the dist build
gulp.task('serve:dist', ['build:dist'], function () {
  browserSync({
    notify: false,
    server: {
      baseDir: ['www']
    }
  });
});
