var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var sass = require('gulp-sass');
var prefix = require('gulp-autoprefixer');
var spritesmith = require('gulp.spritesmith');
var ngmin = require('gulp-ngmin');

var paths = {
  libs: ['static/js/lib/vendor/*.js', 'static/js/lib/*.js'],
  app: ['static/js/app.js', 'static/js/components/**/*.js', 'static/js/controllers.js']
};

// Do things with stylesheets.


gulp.task('scripts', function() {
  // Minify and copy all JavaScript.
  gulp.src(paths.libs)
    .pipe(uglify())
    .pipe(concat('lib.min.js'))
    .pipe(gulp.dest('static/js/build/lib'));
});

gulp.task('appscripts', function() {
  gulp.src(paths.app)
    .pipe(concat('app.min.js'))
    .pipe(ngmin())
    .pipe(uglify())
    .pipe(gulp.dest('static/js/build/app'));
});

gulp.task('sprite', function () {
  var spriteData = gulp.src('src/img/*.png').pipe(spritesmith({
    imgName: 'sprite.png',
    cssName: 'sprite.scss',
    cssFormat: 'css',
    imgPath: '../images/sprite.png',
    cssOpts: {
      cssClass: function (item) {
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
      outputStyle: 'compressed',
      errLogToConsole: true,
      error: function(err) {
        console.log(err);
      }
    }))
    .pipe(prefix("last 1 version", "> 1%", "ie 8", "ie 7"))
    .pipe(gulp.dest('static/css'));
});

// Watch
gulp.task('watch', function() {

  // Watch .scss files
  gulp.watch('static/css/scss/**/*.scss', ['scss']);

});
