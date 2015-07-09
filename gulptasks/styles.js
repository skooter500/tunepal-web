'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var swallowError = require('./swallow-error');

// Build Materialize and SASS
gulp.task('styles', function () {
  return gulp.src(['app/{styles,tests}/**/*.scss'])
    .pipe($.plumber({
      errorHandler: swallowError
    }))
    .pipe($.sass({
        outputStyle: 'expanded'
      })
      .on('error', $.sass.logError)
    )
    .pipe(gulp.dest('.tmp'))
    .pipe($.size({title: 'styles'}));
});
