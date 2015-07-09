'use strict';

var gulp = require('gulp');
require('require-dir')('./gulptasks');

// Build production files, the default task
gulp.task('default', ['build:dist'], function () {
});
