var express = require('express'),
    app = express(),
    server = require('http').Server(app),
    io = require('socket.io')(server),
    Promise = require('bluebird'),
    fileSystem = Promise.promisifyAll(require('fs-extra')),
    passport = require('passport');
    
    configManager = require(__dirname + '/podium_src/config_manager'),
    userManager = require(__dirname + '/podium_src/user_manager'),
    slidesManager = require(__dirname + '/podium_src/slides_manager'),
    config = null,
    userRoles = null,
    users = null,
    slides = {},
    slidesDirectories = null,

    bootstrap = function () {
      fileSystem.readJsonAsync(__dirname + '/config/config.json').then(function(configFile) {
        config = configManager.setConfig(app, server, configFile, __dirname);

        loadUserRoles();
      });      
    }(),

    loadUserRoles = function() {
      fileSystem.readJsonAsync(__dirname + '/config/user_roles.json').then(function(roleFile) {
        userRoles = roleFile;

        loadUsers();
      });
    },

    loadUsers = function() {
      fileSystem.readJsonAsync(__dirname + '/config/users.json').then(function(userFile) {
        users = userFile;

        loadSlides();
      });
    },

    /**
     * @todo Remove Sync code
     */
    loadSlides = function() {
      fileSystem.readdirAsync(__dirname + '/slides').then(function(directories) {
        // Iterate over the contents of the Slides directory
        directories.forEach(function(slidesDirectory) {
          if(slidesDirectory !== '.DS_Store') {
            // OSX garbage
            if (fileSystem.existsSync(__dirname + "/slides/"+slidesDirectory+"/podium.json")) {
              // parse the podium file and add it to our podium.slides object
              slideDeck = fileSystem.readJsonSync(__dirname + "/slides/"+slidesDirectory+"/podium.json");
            } else {
              console.log("\nNote: There is no podium config file in /slides/"+slidesDirectory+"/\nSlide config will be automatically set.");

              slideDeck = {
                route: "/" + slidesDirectory.replace(/\s+/g, '-').replace(/_/g, '-').toLowerCase(),
                title: slidesDirectory.replace(/-/g, ' ').replace(/_/g, ' '),
                summary: '',
                published: false
              };
            }

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
              published: slideDeck.published,
              route: slideDeck.route,
              // initial slide horizontal index
              indexh : 0,  
              // initial slide veriticlal index
              indexv : 0,
              // if the slides are in overview mode
              overview: false
            }  
          };
        });

        loadPassport();
      });
    },

    loadPassport = function() {
      require('./podium_src/user_manager/passport.js')(passport, users, __dirname);

      setStaticDirs();
    },

    setStaticDirs = function() {
      configManager.setStaticDirs(app, config, slides, __dirname);

      loadRoutes();
    },

    loadRoutes = function() {
      require('./podium_src/router/admin_slides_routes.js')(app, config, users, slides, __dirname);
      require('./podium_src/router/admin_user_routes.js')(app, config, userRoles, users, slides, __dirname);
      require('./podium_src/router/admin_routes.js')(app, config, users, slides, __dirname);
      require('./podium_src/router/routes.js')(app, config, users, slides, __dirname);

      loadSockets();
    },

    loadSockets = function() {
      require('./podium_src/socket_handler/connections.js')(io, app, config, slides, __dirname);
    };
  