/**
 * This file contains the slides deck route callback and other routing functions.
 */

var Promise = require('bluebird'),
    fileSystem = Promise.promisifyAll(require('fs-extra')),
    url = require('url'),
    cheerio = require('cheerio');

module.exports = function() {
  var deckRoute = function(req, res, slides, rootDir, config, routeVars) {
        /* 
          express includes the querystring in req.url
          we need just the url since the slides object
          is indexed without it.
        */
        var rawUrl = url.parse(req.url),
            route = rawUrl.pathname,
            queryString = null,
            controller = false,
            editor = false,
            $ = null;

        if(rawUrl.search) {
          queryString = rawUrl.search.replace('?', '').split('&');
          queryString.forEach(function(property, index) {
            queryString[index] = property.split('=');

            if(queryString[index][0] === 'editor' && queryString[index][1] === 'true') {
              editor = true;
            } else if(queryString[index][0] === 'controller' && queryString[index][1] === 'true') {
              controller = true;
            } 
          });
        }
        
        if(slides[route]) {
          // redirect to login if not logged in and try to access the controller or editor
            if(!req.user && (controller || editor || slides[route].published !== true))  {
              res.redirect('/login');

              return null;
            }

          // send the index.html file for the slides
          // append the socket io and podium js to body response
          fileSystem.readFileAsync(rootDir + slides[route].location + 'index.html').then(function(indexFile) {
            $ = cheerio.load(indexFile);
              
            if(editor) {
              $('head').append(config.slidesEditorStyle);
              $('head').append(config.slidesEditorScripts);
              $('body').append(config.podiumScript);
              $('body').append(config.podiumEditorScript);
            } else {
              $('body').append(config.socketScript);
              $('body').append(config.podiumScript);
              $('body').append(config.podiumClientScript);
            }
            
            if(controller) {
              $('head').append(config.slidesEditorStyle);
              $('body').append(config.inPresentationControllerScript);
            }

            res.send($.html());
          });
        } else {
          // not found everything else
          if(config.consoleLog) {
            console.log("\nWarning: no matching slide deck found for request "+route);  
          }
          
          res.render(
            'not_found',
            {
              slides: slides,
              loggedIn: routeVars.loggedIn
            }
          );
        }
      },

      buildBreadcrumbsFromURL = function(url) {
        var breadcrumbs = {},
            breadcrumbPiece = '';

        url = url.split('/'); 

        if (url.length > 1) {
          url.forEach(function(urlPiece, index) {
            if(urlPiece) {

              breadcrumbPiece +=  "/" + urlPiece;

              if(index > 1 && index < (url.length) - 1) {
                // Split words
                  urlPiece = urlPiece.replace(/-/g, " ").replace(/_/g, " ");

                // Upper case first letter in each word
                  urlPiece = urlPiece.replace(
                    /\w\S*/g,
                    function(txt){
                      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
                    }
                  );

                breadcrumbs[breadcrumbPiece] =  urlPiece;
              }
            }
          });
        }

        return breadcrumbs;
      },

      setRouteVars = function(req) {
        var routeVars = {
          loggedIn: false,
          breadcrumbs: {},
          error: req.flash('error'),
          status: req.flash('status')
        };

        if (req.user) {
          routeVars.loggedIn = true;
        }

        if(routeVars.error == '') {
          delete routeVars.error;
        }

        if(routeVars.status == '') {
          delete routeVars.status;
        }

        routeVars.breadcrumbs = buildBreadcrumbsFromURL(req.url);

        return routeVars;
      };

  return {
    deckRoute: deckRoute,
    buildBreadcrumbsFromURL: buildBreadcrumbsFromURL,
    setRouteVars: setRouteVars
  };
}();