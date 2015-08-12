'use strict';

var gulp = require('gulp');
var $ = require('./gulp-plugins');

// Deploy to GAE
gulp.task('deploy', $.shell.task([
  'appcfg.py update www'
]));

// Deploy to GAE production application
gulp.task('deploy:dist', $.shell.task([
  'appcfg.py update www --application=tunepal-js'
]));
