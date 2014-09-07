var fileSystem = require('fs'),
    express = require('express'),
    app = express(),
    server = require('http').Server(app),
    io = require('socket.io')(server),
    passport = require('passport'),

    bootstrapper = require('./podium_src/bootstrapper'),
    authenticator = require('./podium_src/authenticator'),
    config = null,
    users = null, 
    slides = {},
    slidesDirectories = null;

  // Load the config file and setup the app configuration
    config = bootstrapper.loadConfig(__dirname + '/config/config.json', server, app, __dirname);

  // Load the users file 
    users = authenticator.loadUsers(__dirname + '/config/users.json');

  // Load the slides up
    slidesDirectories = fileSystem.readdirSync(__dirname + '/slides');
    slides = bootstrapper.scanSlidesDir(slidesDirectories, slides, __dirname);

  // bootstrap Passport JS authentication
    require('./podium_src/authenticator/passport.js')(passport, authenticator, users);

  // Set static assets directories 
    bootstrapper.setStaticDirs(app, config, slides, __dirname);

  // load up the routes
    require('./podium_src/router/routes.js')(app, users, passport, authenticator, __dirname, config, slides);

  // load up the socket connections
    require('./podium_src/socket_handler/connections.js')(io, app, config, passport, __dirname, slides);
