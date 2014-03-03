var gulp = require('gulp');
var gutil = require('gulp-util');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var jshint = require('gulp-jshint');
var gulpsass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');

var paths = {
  libs: ['src/public/js/lib/vendor/*.js', 'src/public/js/lib/*.js'],

};

// Do things with stylesheets.


gulp.task('scripts', function() {
  // Minify and copy all JavaScript.
  return gulp.src(paths.libs)
    .pipe(uglify())
    .pipe(concat('lib.min.js'))
    .pipe(gulp.dest('src/public/js/build/lib'));
});

