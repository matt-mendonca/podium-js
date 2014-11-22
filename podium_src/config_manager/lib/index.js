/**
 * This file contains the contains the configuration management functions.
 */
 
var express = require('express'),
    favicon = require('serve-favicon'),
    session = require('express-session'),
    cookieParser = require('cookie-parser'),
    flash = require('connect-flash'),
    passport = require('passport'),
    //appsec = require('lusca'),
    compression = require('compression'),
    busboy = require('express-busboy');

module.exports = function() {
  var setConfig = function (app, server, config, baseDir) {
        var port = process.env.PORT || config.port;

        app.use(cookieParser(config.cookieParserSecret));
        
        /*
        app.use(bodyParser.urlencoded({
          extended: true
        }));

        app.use(bodyParser.json());
        */

        busboy.extend(app, {
          upload: true,
          path: baseDir + '/temp_uploads'
        });

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

      updateConfig = function(config, updatedConfig) {
        if(updatedConfig.consoleLog === 'on') {
          config.consoleLog = true;
        } else {
          config.consoleLog = false;
        }

        if(updatedConfig.port && !isNaN(updatedConfig.port)) {
          config.port = updatedConfig.port;
        }

        if(updatedConfig.templateDeck) {
          config.templateDeck = updatedConfig.templateDeck;
        }

        if(updatedConfig.staticCacheMilliseconds && !isNaN(updatedConfig.staticCacheMilliseconds)) {
          config.staticCacheMilliseconds = updatedConfig.staticCacheMilliseconds;
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

        return config;
      },

      setStaticDirs = function(app, config, slides, baseDir) {
        app.use('/podium', express.static(baseDir + '/public', { maxAge: config.staticCacheMilliseconds }));
        app.use('/bower', express.static(baseDir + '/bower_components', { maxAge: config.staticCacheMilliseconds }));
        app.use('/ember-admin', express.static(baseDir + '/ember-admin', { maxAge: config.staticCacheMilliseconds }));

        for (var route in slides) {
          // set the public directory in each slide folder so that express
          // doesn't try to route those requests
          app.use(express.static(baseDir + slides[route].location + 'podium_public', { maxAge: config.staticCacheMilliseconds }));
        }
      };

  return {
    setConfig: setConfig,
    updateConfig: updateConfig,
    setStaticDirs: setStaticDirs
  };
}();