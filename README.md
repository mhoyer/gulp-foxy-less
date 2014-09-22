# [gulp](http://gulpjs.com)-foxy-less

> Keep track of `less` dependencies

With `gulp-foxy-less` you can improve your 
[gulp-less](https://github.com/plus3network/gulp-less) tasks 
to not only react on single file changes, but also run dependent less 
files through your `less`.

The plugin inspects the file event stream and analyzes the content of
input `.less` files for `@import` statements. It keeps track of found dependencies 
and will automatically push new [`vinyl`](https://github.com/wearefractal/vinyl)
instances into the stream for any `.less` file that depends on the one 
just changed.


## Install

```sh
$ npm install --save-dev gulp-foxy-less
```

## Usage

Without pre-analysis of the dependencies -- e.g. if a standalone *less* 
task exists besides a *watch-less* task. 

```js
var gulp = require('gulp');
var watch = require('gulp-watch');
var less = require('gulp-less');
var foxyLess = require('gulp-foxy-less');

var foxy = foxyLess();
var lessFiles = ['app/**/*.less'];

gulp.task('less', function() {
  gulp.src(lessFiles)
    .pipe(foxy.transform())
    .pipe(less())
    .pipe(gulp.dest('app/'));
});

gulp.task('watch-less', function() {
  watch(lessFiles, function(files) {
    files
      .pipe(foxy.transform())
      .pipe(less())
      .pipe(gulp.dest('app/'));
  });
});

gulp.task('default', ['less', 'watch-less']);
```

With pre-analyzing less dependencies -- e.g. when creating an
independent standalone *watch-less* task.

```js
var gulp = require('gulp');
var watch = require('gulp-watch');
var less = require('gulp-less');
var foxyLess = require('gulp-foxy-less');

gulp.task('watch-less', function() {
  var lessFiles = ['app/**/*.less'];
  var foxy = foxyLess({verbose: true}).preAnalyze(lessFiles);

  watch(lessFiles, function(files) {
    files
      .pipe(foxy.transform())
      .pipe(less())
      .pipe(gulp.dest('app/'));
  });
});
```

## API

### foxyLess(opts)

#### opts
##### opts.verbose

Type: `Boolean`  
Default: `false`

Prints update actions of less dependency and additional generated vinyl file events (pushes).



### Functions


#### .preAnalyze(files, done)

Usually helpful when only using a plain watch task without 
transpiling all `.less` files in a first place (feeding the foxy-less already).

Otherwise, every time the ([`through2`](https://github.com/rvagg/through2)) transform 
stream created by `FoxyLess.transform()` receives a file event it will parse the 
content if the file is not already in the index.

##### files
Type: `String` or `Array`

Single string or array of glob strings that will be evaluated with [`glob-all`](https://github.com/jpillora/node-glob-all).

##### done
Type: `Function`  
Default: `null`

Callback that will be invoked when all glob matched files were analyzed.


#### .transform()

Generates a new [`through2`](https://github.com/rvagg/through2) object stream to be passed into a `.pipe()`.



## Todo

* Update dependencies always/if changed (not only on when missing in internal index)


## License

[MIT License](http://en.wikipedia.org/wiki/MIT_License)
