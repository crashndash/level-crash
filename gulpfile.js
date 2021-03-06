'use strict';
var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var sass = require('gulp-sass');
var prefix = require('gulp-autoprefixer');
var spritesmith = require('gulp.spritesmith');
var ngAnnotate = require('gulp-ng-annotate');
var through = require('through2');
var yaml = require('js-yaml');
var fs = require('fs');

var paths = {
  libs: ['static/js/lib/vendor/*.js', 'static/js/lib/*.js'],
  app: ['static/js/app.js', 'static/js/components/**/*.js', 'static/js/controllers.js']
};

var config;

try {
  config = yaml.safeLoad(fs.readFileSync(__dirname + '/config.yml', 'utf8'));
}
catch(err) {
  // So, no analytics either, I take it.
}

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
    .pipe(ngAnnotate())
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
  gulp.watch(['static/css/scss/**/*.scss', 'static/js/*.js', 'static/js/components/**/*'], ['default']);

});

gulp.task('deploy', function() {
  gulp.src('static/index.prod.html.tpl')
  .pipe(through.obj(function(file, encoding, callback) {
    var s = String(file.contents);
    try {
      s = s.replace(/DEPLOY_CACHE/g, Date.now());
      if (config && config.googleAnalytics && config.googleAnalytics.length) {
        s = s.replace(/GOOGLE_ANALYTICS/g, "<script>" +
          "(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){\n" +
          "(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),\n" +
          "m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)\n" +
          "})(window,document,'script','//www.google-analytics.com/analytics.js','ga');\n" +
          "ga('create', '" + config.googleAnalytics + "');\n" +
          "ga('send', 'pageview');\n" +
        "</script>");
      }
      else {
        s = s.replace(/GOOGLE_ANALYTICS/g, '');
      }
      file.contents = new Buffer(s);
      this.push(file);
      callback();
    }
    catch(e) {
      callback(e);
    }
  }))
  // Concat to rename
  .pipe(concat('index.prod.html'))
  .pipe(gulp.dest('static'));

  gulp.src('static/js/build/app/app.min.js')
  .pipe(through.obj(function(file, encoding, callback) {
    var s = String(file.contents);
    try {
      s = s.replace(/DEPLOY_CACHE/g, Date.now());
      file.contents = new Buffer(s);
      this.push(file);
      callback();
    }
    catch(e) {
      callback(e);
    }
  }))
  // Concat to rename
  .pipe(gulp.dest('static/js/build/app'));
});

gulp.task('default', ['scripts', 'scss', 'appscripts']);
