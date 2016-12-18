var gulp        = require('gulp');
var rm          = require('gulp-rimraf');
var prettify    = require('gulp-jsbeautifier');
var rename      = require('gulp-rename');
var sourcemaps  = require('gulp-sourcemaps');
var uglify      = require('gulp-uglify');
var minify      = require('gulp-minify');
var gzip        = require('gulp-gzip');
var concat      = require('gulp-concat');
var wrap        = require('gulp-wrap');

var runSequence = require('run-sequence');

var version       = require('./package.json').version;
var filenameBase  = 'blush-' + version;
var beautyOpts    = {
  indent_level: 2,
  js: {
    indent_level: 2,
  }
};

var concatAndWrap = function (sources, name) {
  return gulp.src(sources)
    .pipe(concat(name))
    .pipe(wrap("(function(global) {\n'use strict';\n<%= contents %>\n})(this);"))
    .pipe(gulp.dest('./dist/'));
};

var concatSource = function (sources, name) {
  return gulp.src(sources)
    .pipe(concat(name))
    .pipe(prettify(beautyOpts))
    .pipe(gulp.dest('./dist/'));
};

var minifySource = function (source, name) {
  return gulp.src(source)
    .pipe(rename(name + '.min.js'))
    .pipe(sourcemaps.init())
    .pipe(uglify())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./dist/'));
};

var gzipSource = function (source) {
  return gulp.src(source)
    .pipe(gzip())
    .pipe(gulp.dest('./dist/'));
};

gulp.task('build', function (done) {
  runSequence('clean', 'concatSource', 'concatWithVendor', 'minify', 'gzip', done);
});

gulp.task('clean', function () {
  return gulp.src('./dist', {read: false})
    .pipe(rm({force: true}));
});

gulp.task('concatSource', function () {
  var sources = [
    './src/declaration.js',
    './src/polyfills/array-for-each.js',
    './src/polyfills/object-assign.js',
    './src/base-class.js',
    './src/utils.js',
    './src/view-model.js',
    './src/view.js'
  ];
  return concatAndWrap(sources, 'blush.js');
});

gulp.task('concatWithVendor', function() {
  var sources = ['vendor/*', 'dist/blush.js'];
  return concatSource(sources, filenameBase + '.js');
});

gulp.task('minify', function () {
  var source = './dist/' + filenameBase + '.js';
  return minifySource(source, filenameBase);
});

gulp.task('gzip', function () {
  return gzipSource('./dist/' + filenameBase + '.min.js');
});
