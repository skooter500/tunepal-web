'use strict';

var gulp = require('gulp');
var $ = require('./gulp-plugins');

gulp.task('html', function() {
  return gulp.src(['app/index.html', 'app/{scripts/pages,tests}/**/*.html'])
  .pipe($.htmlhint())
  .pipe($.htmlhint.reporter())
  .pipe($.size({title: 'html'}));
});
