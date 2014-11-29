var gulp = require('gulp'),
    browserify = require('gulp-browserify'),
    compass = require('gulp-compass'),
    jshint = require('gulp-jshint'),
    concat = require('gulp-concat'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify'),
    autoEmblem = require('gulp-auto-emblem');

// Move fonts from bower to public css
  gulp.task('moveFonts', function() {
    gulp.src('bower_components/foundation-icon-fonts/*.{ttf,woff,eot,svg}')
      .pipe(gulp.dest('public/css'));
  });

// Modernizr Min
  gulp.task('mod-min', function() {
    return gulp.src('bower_components/modernizr/modernizr.js')
      .pipe(uglify())
      .pipe(rename({suffix: ".min"}))
      .pipe(gulp.dest('bower_components/modernizr'));
  });

// Create Animate CSS Sass File
  gulp.task('animate-sass', function() {
    return gulp.src('bower_components/animate-css/animate.css')
      .pipe(rename({
        prefix: "_",
        extname: ".scss"
      }))
      .pipe(gulp.dest('bower_components/animate-css'));
  });

// Compass / SASS
  gulp.task('compass', function() {
    gulp.src('public/sass/**/*.{sass,scss}')
      .pipe(compass({
        config_file: 'public/sass/config.rb',
        css: 'public/css',
        sass: 'public/sass'
      }));
  });

// Lint
  gulp.task('lint', function() {
    return gulp.src('public/js/podium/**/*.js')
      .pipe(jshint())
      .pipe(jshint.reporter('default'));
  });

/*
// Concatenate & Minify JS
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
    return gulp.src('public/js/podium/**/*.js')
      .pipe(uglify())
      .pipe(rename({suffix: ".min"}))
      .pipe(gulp.dest('public/js'));
  });

// Watch Files For Changes
  gulp.task('watch', function() {
    gulp.watch('public/sass/**/*.{sass,scss}', ['compass']);
    gulp.watch('public/js/podium/**/*.js', ['lint', 'scripts']);
  });

gulp.task('build', [
  'moveFonts',
  'mod-min',
  'animate-sass',
  'compass',
  'lint',
  'scripts'
]);
gulp.task('default', ['build', 'watch']);

/***
 * Admin tasks
 */


// Emblem Templates
  gulp.task('admin-templates', function() {
    gulp.src('ember-admin/src/templates/**/*.emblem')
      .pipe(autoEmblem())
      .pipe(concat('templates.js'))
      .pipe(uglify())
      .pipe(gulp.dest('ember-admin/build/js'));
  });

// Lint / min admin App code
  gulp.task('admin-lint-min', function() {
    return gulp.src('ember-admin/src/js/*.js')
      .pipe(jshint())
      .pipe(jshint.reporter('default'))
      .pipe(uglify())
      .pipe(gulp.dest('ember-admin/build/js'));
  });

// Broserfiy app file
gulp.task('admin-build-app-file', ['admin-templates', 'admin-lint-min'], function() {
  // Single entry point to browserify
  gulp.src('ember-admin/build/js/app.js')
    .pipe(browserify({
      shim: {
        modernizr: { 
          path: 'bower_components/modernizr/modernizr.min.js',
          exports: 'Modernizr' 
        }, 
        jquery: { 
          path: 'bower_components/jquery/dist/jquery.min.js',
          exports: '$' 
        }, 
        handlebars: {
          path: 'bower_components/handlebars/handlebars.min.js',
          exports: 'Handlebars'
        },
        ember: {
          path: 'bower_components/ember/ember.min.js',
          exports: 'Ember',
          depends: {
            jquery: '$',
            handlebars: 'Handlebars'
          }
        },
        'ember-data': {
          path: 'bower_components/ember-data/ember-data.min.js',
          exports: 'DS',
          depends: {
            ember: 'Ember',
          }
        },
        foundation: {
          path: 'bower_components/foundation/js/foundation.min.js',
          exports: 'foundation',
          depends: {
            modernizr: 'Modernizr',
            jquery: '$'
          }
        },
        lodash: {
          path: 'bower_components/lodash/dist/lodash.min.js',
          exports: '_'
        },
        templates: {
          path: 'ember-admin/build/js/templates.js',
          exports: 'templates',
          depends: {
            ember: 'Ember'
          }
        }    
      }
    }))
    //.pipe(uglify())
    .pipe(gulp.dest('ember-admin/build'))
});

// Watch Files For Changes
  gulp.task('admin-watch', function() {
    gulp.watch('sass/**/*.{sass,scss}', ['compass']);
    gulp.watch('ember-admin/src/templates/**/*.emblem', ['admin-build-app-file']);
    gulp.watch('ember-admin/src/js/**/*.js', ['admin-build-app-file']);
  });

gulp.task('admin-build', [
  'moveFonts',
  'mod-min',
  'animate-sass',
  'compass',
  'admin-build-app-file'
]);