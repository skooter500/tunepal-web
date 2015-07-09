'use strict';

var gulp = require('gulp');
var del = require('del');

// Clean output directories
gulp.task('clean', del.bind(null, [
  '.tmp',
  '.tmp_merges',
  'merges',
  'www'
]));
