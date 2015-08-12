'use strict';

var gulp = require('gulp');
var $ = require('./gulp-plugins');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync');
var reload = browserSync.reload;

gulp.task('build', function (cb) {
  runSequence(
    'clean',
    ['html', 'materialize', 'midi', 'styles', 'es6'],
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

  gulp.watch(['app/index.html', 'app/{scripts/pages,tests}/**/*.html'], ['html', reload]);
  gulp.watch(['app/{scripts,tests}/**/*.{es6,es6lib}'], ['es6', reload]);
  gulp.watch(['app/styles/_variables.scss'], ['materialize-styles', 'styles', reload]);
  gulp.watch(['app/styles/materialize.scss'], ['materialize-styles', reload]);
  gulp.watch(['app/{styles,tests}/**/*.scss', '!app/styles/{_variables,materialize}.scss'], ['styles', reload]);
});
