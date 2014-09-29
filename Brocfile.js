var compass     = require('broccoli-compass'),
    concatenate = require('broccoli-concat'),
    uglifyJs    = require('broccoli-uglify-js'),
    mergeTrees  = require('broccoli-merge-trees'),
    publicTree  = 'public',
    podiumCss,
    podiumEditorCss,
    podiumJs,
    podiumAdminJs,
    podiumClientJs,
    podiumControllerJs,
    podiumEditorJs;

/**
 * concatenate and compress all of our JavaScript files in 
 * the project /app folder into a single app.js file in 
 * the build production folder
 */

// appJs = concatenate(app, {
//     inputFiles : ['**/*.js'],
//     outputFile : '/production/app.js',
//     header     : '/** Copyright Modus Create Inc. 2014 **/'
// });

// podiumJs = uglifyJs(
//   ['public/js/podium.js'],
//   '/public/js/podium.min.js',
//   compress: true
// );

/**
 * compile all of the SASS in the project /resources folder into 
 * a single app.css file in the build production/resources folder
 */
podiumCss = compass(
  'assets', {
    exclude: ['.sass-cache/**', 'ckeditor/**', 'js/**'],
  }
);

// merge HTML, JavaScript and CSS trees into a single tree and export it
module.exports = mergeTrees([podiumCss]);