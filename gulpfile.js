'use strict';

var gulp = require('gulp');
var mocha = require('gulp-mocha');

gulp.task('test', function() {
  gulp.src(['test/*.js'], { read: false })
    .pipe(mocha({ timeout: 5000, reporter: 'spec' }))
    .on('error', function (err) {
      if (!/tests? failed/.test(err.stack)) {
      console.log(err.stack);
    }
  });
});

gulp.task('watch', function () {
  gulp.watch(['test/*.js', 'index.js'], ['test']);
});

gulp.task('default', ['test', 'watch']);
