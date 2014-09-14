'use strict';

var should = require('chai').should(),
    through = require('through2'),
    fs = require('fs'),
    path = require('path'),
    sinon = require('sinon'),
    gulpAutolessFilter = require('..');

describe('Running gulp-autoless-filter task with disabled read-on-init', function(){
  var sut, buffer;

  beforeEach(function() {
    buffer = [];

    sut = gulpAutolessFilter();
    sut.on('data', function(data){ 
      buffer.push(data);
    });
  });

  afterEach(function() {  });

  describe('with simple standalone .less file', function() {
    var fileFixture = {path: __dirname+'/fixtures/standalone.less'};

    it('should pass when pushed once to input stream', function(done) {
      // act
      sut.write(fileFixture);

      // assert 
      sut.on('end', function() {
        buffer.length.should.equal(1);
        buffer[0].should.equal(fileFixture);
        done();
      });
      sut.end();
    });

    it('should pass twice when pushed twice to input stream', function(done) {
      // act
      sut.write(fileFixture);
      sut.write(fileFixture);

      // assert 
      sut.on('end', function() {
        buffer.length.should.equal(2);
        buffer[0].should.equal(fileFixture);
        buffer[1].should.equal(fileFixture);
        done();
      });
      sut.end();
    });
  });

  describe('with simple A <- B dependent .less files', function() {
    // B.less imports A.less
    var fileFixture = [
      {path: path.normalize(__dirname+'/fixtures/simple-A.less')},
      {path: path.normalize(__dirname+'/fixtures/simple-B.less')}
    ];

    it('should map from input sequence A-B to A-B', function(done) {
      // act
      sut.write(fileFixture[0]);
      sut.write(fileFixture[1]);

      // assert 
      sut.on('end', function() {
        buffer.length.should.equal(2);
        buffer[0].should.equal(fileFixture[0]);
        buffer[1].should.equal(fileFixture[1]);
        done();
      });
      sut.end();
    });

    it('should map from input sequence B-A to B-A', function(done) {
      // act
      sut.write(fileFixture[1]);
      sut.write(fileFixture[0]);

      // assert 
      sut.on('end', function() {
        buffer.length.should.equal(2);
        buffer[0].should.equal(fileFixture[1]);
        buffer[1].should.equal(fileFixture[0]);
        done();
      });
      sut.end();
    });

    it('should map from input sequence A-B-B to A-B-B', function(done) {
      // act
      sut.write(fileFixture[0]);
      sut.write(fileFixture[1]);
      sut.write(fileFixture[1]);

      // assert 
      sut.on('end', function() {
        buffer.length.should.equal(3);
        buffer[0].should.equal(fileFixture[0]);
        buffer[1].should.equal(fileFixture[1]);
        buffer[2].should.equal(fileFixture[1]);
        done();
      });
      sut.end();
    });

    it('should map from input sequence A-B-A to A-B-A-B', function(done) {
      // act
      sut.write(fileFixture[0]);
      sut.write(fileFixture[1]);
      sut.write(fileFixture[0]);

      // assert 
      sut.on('end', function() {
        buffer.length.should.equal(4);
        buffer[0].should.equal(fileFixture[0]);
        buffer[1].should.equal(fileFixture[1]);
        buffer[2].path.should.equal(fileFixture[0].path);
        buffer[3].path.should.equal(fileFixture[1].path);
        done();
      });
      sut.end();
    });
  });

  describe('with complex scenario: (A <- B <- C <- D) and (A <- D)', function() {
    // A <- B <- C <─┐
    // ^             D
    // └─────────────┘
    var fileFixture = [
      {path: path.normalize(__dirname+'/fixtures/complex-A.less')},
      {path: path.normalize(__dirname+'/fixtures/complex-B.less')},
      {path: path.normalize(__dirname+'/fixtures/complex-C.less')},
      {path: path.normalize(__dirname+'/fixtures/complex-D.less')}
    ];

    it('should map from input sequence A-B-C-D to A-B-C-D', function(done) {
      // act
      sut.write(fileFixture[0]);
      sut.write(fileFixture[1]);
      sut.write(fileFixture[2]);
      sut.write(fileFixture[3]);

      // assert 
      sut.on('end', function() {
        buffer.length.should.equal(4);
        buffer[0].should.equal(fileFixture[0]);
        buffer[1].should.equal(fileFixture[1]);
        buffer[2].should.equal(fileFixture[2]);
        buffer[3].should.equal(fileFixture[3]);
        done();
      });
      sut.end();
    });

    it('should map from input sequence D-C-B-A to D-C-B-A', function(done) {
      // act
      sut.write(fileFixture[3]);
      sut.write(fileFixture[2]);
      sut.write(fileFixture[1]);
      sut.write(fileFixture[0]);

      // assert 
      sut.on('end', function() {
        buffer.length.should.equal(4);
        buffer[0].should.equal(fileFixture[3]);
        buffer[1].should.equal(fileFixture[2]);
        buffer[2].should.equal(fileFixture[1]);
        buffer[3].should.equal(fileFixture[0]);
        done();
      });
      sut.end();
    });

    it('should map from input sequence A-B-C-D-A to A-B-C-D-A-B-C-D', function(done) {
      // act
      sut.write(fileFixture[0]);
      sut.write(fileFixture[1]);
      sut.write(fileFixture[2]);
      sut.write(fileFixture[3]);
      sut.write(fileFixture[0]);

      // assert 
      sut.on('end', function() {
        buffer.length.should.equal(8);
        buffer[0].should.equal(fileFixture[0]);
        buffer[1].should.equal(fileFixture[1]);
        buffer[2].should.equal(fileFixture[2]);
        buffer[3].should.equal(fileFixture[3]);
        buffer[4].path.should.equal(fileFixture[0].path);
        buffer[5].path.should.equal(fileFixture[1].path);
        buffer[6].path.should.equal(fileFixture[2].path);
        buffer[7].path.should.equal(fileFixture[3].path);
        done();
      });
      sut.end();
    });

    it('should map from input sequence A-B-C-D-B to A-B-C-D-B-C-D', function(done) {
      // act
      sut.write(fileFixture[0]);
      sut.write(fileFixture[1]);
      sut.write(fileFixture[2]);
      sut.write(fileFixture[3]);
      sut.write(fileFixture[1]);

      // assert 
      sut.on('end', function() {
        buffer.length.should.equal(7);
        buffer[0].should.equal(fileFixture[0]);
        buffer[1].should.equal(fileFixture[1]);
        buffer[2].should.equal(fileFixture[2]);
        buffer[3].should.equal(fileFixture[3]);
        buffer[4].path.should.equal(fileFixture[1].path);
        buffer[5].path.should.equal(fileFixture[2].path);
        buffer[6].path.should.equal(fileFixture[3].path);
        done();
      });
      sut.end();
    });

    it('should map from input sequence C-D-A-C to C-D-A-C-D', function(done) {
      // act
      sut.write(fileFixture[2]);
      sut.write(fileFixture[3]);
      sut.write(fileFixture[0]);
      sut.write(fileFixture[2]);

      // assert 
      sut.on('end', function() {
        buffer.length.should.equal(5);
        buffer[0].should.equal(fileFixture[2]);
        buffer[1].should.equal(fileFixture[3]);
        buffer[2].should.equal(fileFixture[0]);
        buffer[3].path.should.equal(fileFixture[2].path);
        buffer[4].path.should.equal(fileFixture[3].path);
        done();
      });
      sut.end();
    });
  });
});

describe('Running gulp-autoless-filter task with enabled read-on-init', function(){
  var sut, buffer;

  beforeEach(function() {
    buffer = [];

    sut = gulpAutolessFilter({readOnInit: __dirname+'/fixtures/*.less'});
    sut.on('data', function(data){ 
      buffer.push(data);
    });
  });

  describe('with simple A <- B dependent .less files', function() {
    // B.less imports A.less
    var fileFixture = [
      {path: path.normalize(__dirname+'/fixtures/simple-A.less')},
      {path: path.normalize(__dirname+'/fixtures/simple-B.less')}
    ];

    it('should map from input sequence A to A-B', function(done) {
      // act
      sut.write(fileFixture[0]);

      // assert 
      sut.on('end', function() {
        buffer.length.should.equal(2);
        buffer[0].path.should.equal(fileFixture[0].path);
        buffer[1].path.should.equal(fileFixture[1].path);
        done();
      });
      sut.end();
    });

    it('should map from input sequence B to B', function(done) {
      // act
      sut.write(fileFixture[1]);

      // assert 
      sut.on('end', function() {
        buffer.length.should.equal(1);
        buffer[0].should.equal(fileFixture[1]);
        done();
      });
      sut.end();
    });

    it('should map from input sequence A-B to A-B-B', function(done) {
      // act
      sut.write(fileFixture[0]);
      sut.write(fileFixture[1]);

      // assert 
      sut.on('end', function() {
        buffer.length.should.equal(3);
        buffer[0].should.equal(fileFixture[0]);
        buffer[1].path.should.equal(fileFixture[1].path);
        buffer[2].path.should.equal(fileFixture[1].path);
        done();
      });
      sut.end();
    });

    it('should map from input sequence B-A to B-A-B', function(done) {
      // act
      sut.write(fileFixture[1]);
      sut.write(fileFixture[0]);

      // assert 
      sut.on('end', function() {
        buffer.length.should.equal(3);
        buffer[0].should.equal(fileFixture[1]);
        buffer[1].should.equal(fileFixture[0]);
        buffer[2].path.should.equal(fileFixture[1].path);
        done();
      });
      sut.end();
    });
  });

  describe('with complex scenario: (A <- B <- C <- D) and (A <- D)', function() {
    // A <- B <- C <─┐
    // ^             D
    // └─────────────┘
    var fileFixture = [
      {path: path.normalize(__dirname+'/fixtures/complex-A.less')},
      {path: path.normalize(__dirname+'/fixtures/complex-B.less')},
      {path: path.normalize(__dirname+'/fixtures/complex-C.less')},
      {path: path.normalize(__dirname+'/fixtures/complex-D.less')}
    ];

    it('should map from input sequence A to A-B-C-D', function(done) {
      // act
      sut.write(fileFixture[0]);

      // assert 
      sut.on('end', function() {
        buffer.length.should.equal(4);
        buffer[0].path.should.equal(fileFixture[0].path);
        buffer[1].path.should.equal(fileFixture[1].path);
        buffer[2].path.should.equal(fileFixture[2].path);
        buffer[3].path.should.equal(fileFixture[3].path);
        done();
      });
      sut.end();
    });

    it('should map from input sequence D-C-B-A to D-(C-D)-(B-C-D)-(A-B-C-D)', function(done) {
      // act
      sut.write(fileFixture[3]);
      sut.write(fileFixture[2]);
      sut.write(fileFixture[1]);
      sut.write(fileFixture[0]);

      // assert 
      sut.on('end', function() {
        buffer.length.should.equal(10);
        buffer[0].path.should.equal(fileFixture[3].path);
        buffer[1].path.should.equal(fileFixture[2].path);
        buffer[2].path.should.equal(fileFixture[3].path);
        buffer[3].path.should.equal(fileFixture[1].path);
        buffer[4].path.should.equal(fileFixture[2].path);
        buffer[5].path.should.equal(fileFixture[3].path);
        buffer[6].path.should.equal(fileFixture[0].path);
        buffer[7].path.should.equal(fileFixture[1].path);
        buffer[8].path.should.equal(fileFixture[2].path);
        buffer[9].path.should.equal(fileFixture[3].path);
        done();
      });
      sut.end();
    });
  });
});
