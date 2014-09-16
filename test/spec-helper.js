var vinyl = require('vinyl');
var path = require('path');

module.exports = {
	createFixture: function (fileName) {
	  return new vinyl({
	    path: path.resolve(__dirname+'/fixtures/'+fileName)
	  });
	}
}
