var fileSystem = require('fs-extra'),
    express = require('express'),
    app = express(),
    server = require('http').Server(app),
    io = require('socket.io')(server),
    passport = require('passport'),

    configManager = require('./podium_src/config_manager'),
    userManager = require('./podium_src/user_manager'),
    slidesManager = require('./podium_src/slides_manager'),
    config = null,
    users = null, 
    slides = {},
    slidesDirectories = null;

  // Load the config file and setup the app configuration
    config = configManager.loadConfig(app, server, __dirname, '/config/config.json');

  // Load the users file 
    users = userManager.loadUsers(__dirname + '/config/users.json');

  // Load the slides up
    slides = slidesManager.scanSlidesDir(slides, __dirname);

  // bootstrap Passport JS authentication
    require('./podium_src/user_manager/passport.js')(passport, users, __dirname);

  // Set static assets directories 
    configManager.setStaticDirs(app, config, slides, __dirname);

  // load up the routes
    require('./podium_src/router/routes.js')(app, config, users, slides, __dirname);

  // load up the socket connections
    require('./podium_src/socket_handler/connections.js')(io, app, config, slides, __dirname);
