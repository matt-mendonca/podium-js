/**
 * Module dependencies.
 */
var fileSystem = require('fs'),
    express = require('express'),
    favicon = require('serve-favicon'),
    session = require('express-session'),
    cookieParser = require('cookie-parser'),
    bodyParser   = require('body-parser'),
    flash = require('connect-flash'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    //appsec = require('lusca'),
    compression = require('compression');

module.exports = function() {
  /** 
   * Load up the configuration and fire up the express server.
   * Note that init function at the very bottom is what really
   * starts everything.
   */
  var loadConfig = function (configFilePath, server, app, baseDir) {
        var configFile = fileSystem.readFileSync(configFilePath),
            config = JSON.parse(configFile),
            port = process.env.PORT || config.port;

        app.use(cookieParser(config.cookieParserSecret));
        
        app.use(bodyParser.urlencoded({
          extended: true
        }));

        app.use(bodyParser.json());

        app.use(session({
          secret: config.sessionSecret, 
          saveUninitialized: true,
          resave: true
        }));

        /* 
          //Lusca App Security
          app.use(appsec({
            csrf: true,
            csp: {},
            xframe: 'SAMEORIGIN',
            p3p: 'ABCDEF' 
          }));
        */

        app.use(compression());

        app.use(passport.initialize());
        app.use(passport.session());
        app.use(flash());
        app.use(favicon(baseDir + config.favicon));
        server.listen(port);
        app.set('views', baseDir + '/views');
        app.set('view engine', 'jade');
        console.log('podium server listening on port '+config.port);
        
        return config;
      },

      updateConfig = function(config, updatedConfig, baseDir) {
        if(updatedConfig.port && !isNaN(updatedConfig.port)) {
          config.port = updatedConfig.port;
        }

        if(updatedConfig.cookieParserSecret) {
          config.cookieParserSecret = updatedConfig.cookieParserSecret;
        }

        if(updatedConfig.sessionSecret) {
          config.sessionSecret = updatedConfig.sessionSecret;
        }

        if(updatedConfig.jwtSecret) {
          config.jwtSecret = updatedConfig.jwtSecret;
        }

        if(updatedConfig.jwtExpireMinutes && !isNaN(updatedConfig.jwtExpireMinutes)) {
          config.jwtExpireMinutes = updatedConfig.jwtExpireMinutes;
        }

        fileSystem.writeFileSync(baseDir + '/config/config.json', JSON.stringify(config));
      },

      scanSlidesDir = function(directories, slides, baseDir) {
        var slideDeck = null;

        // Iterate over the contents of the Slides directory
        directories.forEach(function(slidesDirectory) {
          if(slidesDirectory === '.DS_Store') {
            // OSX garbage
            // continue;

          // Check if a podium json file exists in the directory 
          } else if (fileSystem.existsSync(baseDir + "/slides/"+slidesDirectory+"/podium.json")) {
            // parse the podium file and add it to our podium.slides object
            slideDeck = JSON.parse(
              fileSystem.readFileSync(baseDir + "/slides/"+slidesDirectory+"/podium.json")
            );

            /* 
              Note: route is both the key and a property. This 
              is so we can identify the slide by the client's 
              window.location.pathname (key) and access it as 
              a property for templating (property - might rethink 
              this later). 
             */
            slides[slideDeck.route] = {
              title: slideDeck.title,
              summary: slideDeck.summary,
              location: location = "/slides/"+slidesDirectory+"/",
              route: slideDeck.route,
              // initial slide horizontal index
              indexh : 0,  
              // initial slide veriticlal index
              indexv : 0,
              // if the slides are in overview mode
              overview: false  
            };
          } else {
            console.log("\nNote: There is no podium config file in /slides/"+slidesDirectory+"/\nSlide config will be automatically set.");

            slideDeck = {
              route: "/" + slidesDirectory.replace(/\s+/g, '-').replace(/_/g, '-').toLowerCase(),
              title: slidesDirectory.replace(/-/g, ' ').replace(/_/g, ' ')
            };

            slides[slideDeck.route] = {
              title: slideDeck.title,
              summary: slideDeck.title,
              location: location = "/slides/"+slidesDirectory+"/",
              route: slideDeck.route,
              // initial slide horizontal index
              indexh : 0,  
              // initial slide veriticlal index
              indexv : 0,
              // if the slides are in overview mode
              overview: false  
            };
          }
        });

        return slides;
      },

      updateSlideDeck = function(slides, currentSlideInfo, updatedSlideInfo, baseDir) {
        if(!updatedSlideInfo.title || !updatedSlideInfo.route || !updatedSlideInfo.summary) {
          return 'emptyFields';
        }

        // Add a / to the front of the route if it isn't there
          if(updatedSlideInfo.route.charAt(0) !== '/') {
            updatedSlideInfo.route = "/" + updatedSlideInfo.route;
          }
        // Lowercase and replace spaces with dashes
          updatedSlideInfo.route = updatedSlideInfo.route.toLowerCase().replace(/\s+/g, '-');
        
        if(updatedSlideInfo.route === '/' || updatedSlideInfo.route.substring(0, 6) === '/admin') {
          return 'routeTaken';
        }

        for(slideRoutes in slides) {
          if(updatedSlideInfo.route !== currentSlideInfo.route && updatedSlideInfo.route === slideRoutes) {
            return 'routeTaken';
          }
        }

        currentSlideInfo.title = updatedSlideInfo.title;
        currentSlideInfo.summary = updatedSlideInfo.summary;

        if(updatedSlideInfo.route !== currentSlideInfo.route) {
          delete slides[currentSlideInfo.route];

          currentSlideInfo.route = updatedSlideInfo.route;
        } 

        slides[currentSlideInfo.route] = currentSlideInfo;
        
        fileSystem.writeFileSync(baseDir + currentSlideInfo.location + 'podium.json', JSON.stringify(updatedSlideInfo));

        return null;
      },

      setStaticDirs = function(app, slides, baseDir) {
        app.use(express.static(baseDir + '/public'));

        for (var route in slides) {
          // set the public directory in each slide folder so that express
          // doesn't try to route those requests
          app.use(express.static(baseDir + slides[route].location + 'public'));
        }
      };

  return {
    loadConfig: loadConfig,
    updateConfig: updateConfig,
    scanSlidesDir: scanSlidesDir,
    updateSlideDeck: updateSlideDeck,
    setStaticDirs: setStaticDirs
  };
}();