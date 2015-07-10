'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var merge = require('merge-stream');

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