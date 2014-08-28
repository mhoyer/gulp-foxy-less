'use strict';

var through = require('through2');

module.exports = function() {
  var transformFn = function (file, enc, cb) {
    this.push(file);
    cb();
  };

  return through.obj(transformFn);
}
