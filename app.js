var fileSystem = require('fs'),
    express = require('express'),
    app = express(),
    server = require('http').Server(app),
    io = require('socket.io')(server),
    basicAuth = require('basic-auth');

    /* 
      Revealing Module Pattern

      This does two things - it allows us to selectively expose properties and 
      methods if we need them later (right now only podium.config is exposed)

      Even better, because var podium is a self calling function, any functions defined 
      in it get access to its top level properties (yay closures).
     */
    podium = function() {
      var bootstrapper = require('./podium_src/bootstrapper'),
          router = require('./podium_src/router'),
          socketHandler = require('./podium_src/socket_handler'),
          config = null,
          socket = null,
          slides = {},

          unauthorized = function (res) {
            res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
            return res.status(401).end();
          },

          auth = function (req, res, next) {
            var user = basicAuth(req);

            if (!user || !user.name || !user.pass) {
              return unauthorized(res);
            }

            if (user.name === config.name && user.pass === config.password) {
              return next();
            } else {
              return unauthorized(res);
            }
          },

          main = function () {
            //self calling function, this kicks everything off
            var configFile = null,
                slidesDirectories = null;

            // Load the config file 
            configFile = fileSystem.readFileSync(__dirname + '/config.json');
            config = bootstrapper.loadConfig(configFile, server, app, __dirname);

            // Load the slides up
            slidesDirectories = fileSystem.readdirSync(__dirname + '/slides');
            slides = bootstrapper.scanSlidesDir(slidesDirectories, slides, __dirname);

            // Set static assets directories 
            app.use(express.static(__dirname + '/public'));

            for (var route in slides) {
              // set the public directory in each slide folder so that express
              // doesn't try to route those requests
              app.use(express.static(__dirname + slides[route].location + 'public'));
            }

            /*
            app.get('/controller', auth, function (req, res) {
              podiumRoute(req, res, 'controller');
            });
            */

            // Front controller for all routing
            app.get('/*', function (req, res) {
              if (req.url === '/' ) {
                router.podiumRoute(req, res, 'index', slides);
              } else if (req.url === '/controller' ) {
                router.podiumRoute(req, res, 'controller', slides);
              } else {
                // everything else is assumed to be a slide deck
                // 404's handled in deckRoute()
                router.deckRoute(req, res, slides, __dirname, config);
              }
            });

            // bootstrap socket connection code
            io.on('connection', function (sock) {
              // setting podium.socket so that it is availible to 
              // other lambda functions in the podium module
              socket = sock;

              // When a client first loads up a deck
              socket.on('requestDeck', function(data) {
                socketHandler.socketOnRequestSlideDeck(socket, slides, data);
              });

              // When the controller view sends a command
              socket.on('command', function(data) {
                slides = socketHandler.socketOnCommand(socket, slides, data);
              });

              // When client deck in controller mode changes slides
              socket.on('slideChanged', function(data) {
                slides = socketHandler.socketOnSlideChanged(socket, slides, data);
              });

              // When client deck in controller mode goes to overview mode
              socket.on('overviewShown', function(data) {
                slides = socketHandler.socketOnOverviewShown(socket, slides, data);
              });

              // When client deck in controller mode leaves overview mode
              socket.on('overviewHidden', function(data) {
                slides = socketHandler.socketOnOverviewHidden(socket, slides, data);
              });
            });
          }();

      return {
        config: config
      };
    }();