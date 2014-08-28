'use strict';

var should = require('chai').should(),
    through = require('through2'),
    autolessFilter = require('..');

describe('gulp-autoless-filter', function(){

  it('should pass input file to output stream', function(done) {
    // arrange
    var fileFixture = {path: 'any-data'};
    var sut = autolessFilter();

    // act
    sut.write(fileFixture);

    // assert
    var buffer = [];
    sut.on('data', function(data) {
      buffer.push(data);
    }).on('end', function() {
      buffer.length.should.equal(1);
      buffer[0].should.equal(fileFixture);
      done();
    });
    
    // cleanup
    sut.end();
  });

});