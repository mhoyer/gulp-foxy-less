'use strict';

var through = require('through2');
var fs = require('fs');
var gutil = require('gulp-util');
var path = require('path');
var vinyl = require('vinyl');

module.exports = function() {
  var lessDependencies = {};
  var lessDependenciesInverted = {};

  function updateDependencies(file) {
    gutil.log('Updating import dependencies for:', gutil.colors.cyan(file.path));

    var filePath = path.normalize(file.path);

    var data = fs.readFileSync(filePath, 'utf8');
    var importRegex = /@import\s+["']([^"']*)["'];/g;

    var matches = [];
    var match;
    while(match = importRegex.exec(data)) {
      var dep = path.normalize(path.dirname(filePath) + '/' + match[1]);
      matches.push(dep);

      if (!(dep in lessDependenciesInverted)) {
        lessDependenciesInverted[dep] = [];
      }

      if (!(filePath in lessDependenciesInverted[dep])) {
        lessDependenciesInverted[dep].push(filePath);
      }
    }

    lessDependencies[filePath] = matches;
  }

  var pushDependentFilesToStream = function(sourceFile, stream, pushed) {
    pushed = pushed || [sourceFile];

    if(sourceFile in lessDependenciesInverted) {
      lessDependenciesInverted[sourceFile].forEach(function(dep) {
        if(pushed.indexOf(dep) >= 0) return;

        gutil.log('Pushing dependent file to stream:', gutil.colors.cyan(dep));

        stream.push(new vinyl({path: dep}));
        pushed.push(dep);

        pushDependentFilesToStream(dep, stream, pushed);
      });
    }
  };

  var transformFn = function (file, enc, cb) {
    var filePath = path.normalize(file.path);

    this.push(file);

    if(filePath in lessDependencies) {
      pushDependentFilesToStream(filePath, this);
    } else {
      updateDependencies(file);
    }

    cb();
  };

  return through.obj(transformFn);
}
