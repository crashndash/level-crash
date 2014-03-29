var gulp = require('gulp');
var gutil = require('gulp-util');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var jshint = require('gulp-jshint');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var spritesmith = require('gulp.spritesmith');

var paths = {
  libs: ['static/js/lib/vendor/*.js', 'static/js/lib/*.js']
};

// Do things with stylesheets.


gulp.task('scripts', function() {
  // Minify and copy all JavaScript.
  return gulp.src(paths.libs)
    .pipe(uglify())
    .pipe(concat('lib.min.js'))
    .pipe(gulp.dest('static/js/build/lib'));
});

gulp.task('sprite', function () {
  var spriteData = gulp.src('src/img/*.png').pipe(spritesmith({
    imgName: 'sprite.png',
    cssName: 'sprite.scss',
    cssFormat: 'css',
    imgPath: '../images/sprite.png',
    cssOpts: {
      cssClass: function (item) {
        // `item` has `x`, `y`, `width`, `height`, `name`, `image`, and more
        // It is suggested to `console.log` output
        return '.sprite-' + item.name;
      }
    }
  }));
  spriteData.img.pipe(gulp.dest('static/images/'));
  spriteData.css.pipe(gulp.dest('static/css/scss'));
});

gulp.task('scss', function() {
  gulp.src('static/css/scss/style.scss')
    .pipe(sass({
      errLogToConsole: true,
      error: function(err) {
        console.log(err);
        console.log('satan');
      }
    }))
    .pipe(gulp.dest('static/css'));
});

// Watch
gulp.task('watch', function() {

  // Watch .scss files
  gulp.watch('static/css/scss/**/*.scss', ['scss']);

});
