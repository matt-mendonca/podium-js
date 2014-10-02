var gulp = require('gulp'),
    compass = require('gulp-compass'),
    jshint = require('gulp-jshint'),
    concat = require('gulp-concat'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify');

// Move fonts from bower to public css
  gulp.task('moveFonts', function() {
    gulp.src('bower_components/foundation-icon-fonts/*.{ttf,woff,eot,svg}')
      .pipe(gulp.dest('public/css'));
  });

// Compass / SASS
gulp.task('compass', function() {
  gulp.src('public/sass/*.sass')
    .pipe(compass({
      config_file: 'config.rb',
      css: 'public/css',
      sass: 'public/sass'
    }));
});

// Lint Task
gulp.task('lint', function() {
  return gulp.src('public/js/podium/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

// Concatenate & Minify JS
/*
gulp.task('scripts', function() {
  return gulp.src('public/js/podium/*.js')
    .pipe(concat('all.js'))
    .pipe(gulp.dest('public/js'))
    .pipe(rename('all.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('public/js'));
});
*/

// Minify JS
gulp.task('scripts', function() {
  return gulp.src('public/js/podium/*.js')
    .pipe(uglify())
    .pipe(rename({suffix: ".min"}))
    .pipe(gulp.dest('public/js'));
});

// Watch Files For Changes
gulp.task('watch', function() {
  gulp.watch('public/sass/*.{sass,scss}', ['compass']);
  gulp.watch('public/js/podium/*.js', ['lint', 'scripts']);
});

// Default Task
gulp.task('build', ['moveFonts', 'compass', 'lint', 'scripts']);
gulp.task('default', ['build', 'watch']);