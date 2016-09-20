'use strict';

var gulp = require('gulp');
var $ = require('./gulp-plugins');
var path = require('path');
var swallowError = require('./swallow-error');

// Build ECMAScript 6
gulp.task('es6', function () {
  return gulp.src(['app/scripts/pages/record/Recorder.es6lib', 'app/scripts/Config.es6lib'])
    .pipe($.plumber({
      errorHandler: swallowError
    }))
    .pipe($.es6ModuleTranspiler())
    .pipe($.babel({compact: false}))
    .pipe($.rename(function (filePath) {
      filePath.dirname = filePath.dirname.replace('app' + path.sep, '');
      filePath.basename = filePath.basename.replace('.es6', '');
      filePath.extname = '.js';
    }))
    .pipe(gulp.dest('.tmp'))
    .pipe($.size({title: 'es6'}));
});
