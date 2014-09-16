# [gulp](http://gulpjs.com)-foxy-less

> Keep track of `less` dependencies

With `gulp-foxy-less` you can improve your 
[gulp-less](https://github.com/plus3network/gulp-less) tasks 
to not only react on single file changes, but also run dependent less 
files through your `less`.

The plugin inspects the file event stream and analyses the content of
input `.less` files for `@import` statements. It keeps track of found dependencies 
and will automatically push new [`vinyl`](https://github.com/wearefractal/vinyl)
instances into the stream for any `.less` file that depends on the one 
just changed.


## Install

```sh
$ npm install --save-dev gulp-foxy-less
```

## Usage

Without pre-initialization of the dependencies -- e.g. if a standalone *less* 
task exists besides a *watch-less* task. 

```js
var gulp = require('gulp');
var watch = require('gulp-watch');
var less = require('gulp-less');
var foxy = require('gulp-foxy-less');

var foxy = foxyLess();
var lessFiles = 'app/**/*.less';

gulp.task('less', function() {
	gulp.src(lessFiles)
    .pipe(foxy())
    .pipe(less())
    .pipe(gulp.dest('app/'));
});

gulp.task('watch-less', function() {
  watch(lessFiles, function(files) {
    files
      .pipe(foxy())
      .pipe(less())
      .pipe(gulp.dest('app/'));
  });
});

gulp.task('default', ['less', 'watch-less']);
```

With pre-initialized (`readOnInit`) dependency check when creating an
independent standalone *watch-less* task.

```js
var gulp = require('gulp');
var watch = require('gulp-watch');
var less = require('gulp-less');
var foxyLess = require('gulp-foxy-less');

gulp.task('watch-less', function() {
  var lessFiles = 'app/**/*.less';
  var foxy = foxyLess({readOnInit: lessFiles, verbose: false});

  watch(lessFiles, function(files) {
    files
      .pipe(foxy())
      .pipe(less())
      .pipe(gulp.dest('app/'));
  });
});
```

## API

### foxyLess(opts)

#### opts
##### opts.readOnInit

Type: `String`
Default: `null`

Usually helpful when only using a plain watch task without 
transpiling all `.less` files in a first place (feeding the foxy-less already).

Otherwise, every time `foxyLess` receives a file event it will parse the 
content if the file is not known already. 

##### opts.verbose

Type: `Boolean`
Default: `false`

Prints internal dependency updates and additional generated vinyl file events.


## Todo

* Update dependencies always (not only on first access)
* Support arrays for `readOnInit`

## License

[MIT License](http://en.wikipedia.org/wiki/MIT_License)
