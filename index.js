'use strict';

var through = require('through2');
var fs = require('fs');
var glob = require('glob-all');
var gutil = require('gulp-util');
var path = require('path');
var vinyl = require('vinyl');
var util = require('util');

function FoxyLess(opts) {
  var defaultOpts = { verbose: false, readOnInit: null };
  var opts = util._extend(defaultOpts, opts || {});
  var lessDependencies = {};
  var lessDependenciesInverted = {};

  function fileActionLog(action, filePath) {
    if (!opts.verbose) return;
    gutil.log(gutil.colors.cyan('gulp-foxy-less'), action, gutil.colors.magenta(filePath));
  }

  function updateDependencies(file) {
    var filePath = path.resolve(process.cwd(), file.path);
    fileActionLog('Updating import dependencies for', filePath);

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

  function pushDependentFilesToStream (file, stream, pushed) {
    var filePath = path.resolve(process.cwd(), file.path);
    pushed = pushed || [filePath];

    if(filePath in lessDependenciesInverted) {
      lessDependenciesInverted[filePath].forEach(function(depFilePath) {
        if(pushed.indexOf(depFilePath) >= 0) return;

        fileActionLog('Pushing dependent file to stream', depFilePath);

        var depFile = file.clone();
        depFile.path = depFilePath;
        depFile.contents = file.isStream() ? fs.createReadStream(depFilePath) : fs.readFileSync(depFilePath);

        pushed.push(depFilePath);
        stream.push(depFile);

        pushDependentFilesToStream(depFile, stream, pushed);
      });
    }
  };

  function transformFn(file, enc, cb) {
    var filePath = path.resolve(process.cwd(), file.path);

    this.push(file);

    if(filePath in lessDependencies) {
      pushDependentFilesToStream(file, this);
    } else {
      updateDependencies(file);
    }

    cb();
  };

  // public 
  this.preAnalyze = function(files, done) {
    if(Object.keys(lessDependencies).length > 0) {
      if (typeof done === 'function') done();
      return;
    }

    glob(files, function(err, matches) {
      matches.forEach(function(filePath) { 
        updateDependencies({path: filePath}) 
      });
      if (typeof done === 'function') done();
    });

    return this;
  }

  this.transform = function() {
    return through.obj(transformFn);
  }
};

module.exports = FoxyLess;
