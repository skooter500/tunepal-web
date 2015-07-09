'use strict';

module.exports = function swallowError(err) {
  console.log(err.toString());
  this.emit('end');
};
