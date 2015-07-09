'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();

// Deploy to GAE
gulp.task('deploy', $.shell.task([
  'appcfg.py update www'
]));
