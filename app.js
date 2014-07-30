var fileSystem = require('fs'),
    url = require('url'),
    express = require('express'),
    app = express(),
    server = require('http').Server(app),
    io = require('socket.io')(server),

    /* 
      Revealing Module Pattern

      This does two things - it allows us to selectively expose properties and 
      methods if we need them later (right now only podium.config is exposed)

      Even better, because var podium is a self calling function, any functions defined 
      in it get access to its top level properties (yay closures).
     */
    podium = function() {
      var config = null,
          socket = null,
          slides = {},

          /* 
            Load up the configuration and fire up the express server.
            Note that init function at the very bottom is what really
            starts everything.
           */
          loadConfig = function (err, data) {
            if (err) {
              throw err;
            }

            config = JSON.parse(data);
            server.listen(config.port);
            app.set('views', __dirname + '/views');
            app.set('view engine', 'jade');
            console.log('podium server listening on port '+config.port);
            fileSystem.readdir(__dirname + '/slides', scanSlidesDir);
          },

          scanSlidesDir = function(err, directories) {
            if (err) {
              throw err;
            }

            // Iterate over the contents of the Slides directory
            directories.forEach(function(slidesDirectory) {
              if(slidesDirectory === '.DS_Store') {
                // OSX garbage
                // continue;

              // Check if a podium json file exists in the directory 
              } else if (fileSystem.existsSync(__dirname + "/slides/"+slidesDirectory+"/podium.json")) {
                // parse the podium file and add it to our podium.slides object
                var slideDeck = JSON.parse(
                      fileSystem.readFileSync(__dirname + "/slides/"+slidesDirectory+"/podium.json")
                    );

                /* 
                  Note: route is both the key and a property. This 
                  is so we can identify the slide by the client's 
                  window.location.pathname (key) and access it as 
                  a property for templating (property - might rethink 
                  this later). 
                 */
                slides[slideDeck.route] = {
                  name: slideDeck.name,
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
                console.log("\nWarning: There is no podium config file in /slides/"+slidesDirectory+"/");
              }
            });

            // run main now that all of the bootstapping is complete
            main();
          },

          main = function () {
            // Set static assets directories 
            app.use(express.static(__dirname + '/public'));

            for (var route in slides) {
              // set the public directory in each slide folder so that express
              // doesn't try to route those requests
              app.use(express.static(__dirname + slides[route].location + 'public'));
            }

            // Front controller for all routing
            app.get('/*', function (req, res) {
              if (req.url === '/' ) {
                podiumRoute(req, res, 'index');
              } else if (req.url === '/controller' ) {
                podiumRoute(req, res, 'controller');
              } else {
                // everything else is assumed to be a slide deck
                // 404's handled in deckRoute()
                deckRoute(req, res);
              }
            });

            // bootstrap socket connectio code
            io.on('connection', socketConnect);
          },

          podiumRoute = function(req, res, view) {
            res.render(view, {slides: slides});
          },

          deckRoute = function(req, res) {
            /* 
              express includes the querystring in req.url
              we need just the url since the podium.slides
              is indexed without it.
            */
            var route = url.parse(req.url).pathname;

            if(slides[route]) {
              // send the index.html file for the slides
              res.sendfile(__dirname + slides[route].location + 'index.html');
            } else {
              // not found everything else
              console.log("\nWarning: no matching slide deck found for request "+route);
              res.render('not_found', {slides: slides});
            }
          },

          socketConnect = function (sock) {
            // setting podium.socket so that it is availible to 
            // other lambda functions in the podium module
            socket = sock;

            // When a client first loads up a deck
            socket.on('requestDeck', socketOnRequestSlideDeck);

            // When the controller view sends a command
            socket.on('command', sockectOnCommand);

            // When client deck in controller mode changes slides
            socket.on('slideChanged', sockectOnSlideChanged);

            // When client deck in controller mode goes to overview mode
            socket.on('overviewShown', sockectOnOverviewShown);

            // When client deck in controller mode leaves overview mode
            socket.on('overviewHidden', sockectOnOverviewHidden);
          },

          socketOnRequestSlideDeck = function(data) {
            if(slides[data.route]) {
              console.log('Sending initial deck data: ' + JSON.stringify(slides[data.route]) );
              socket.emit('initialData', slides[data.route]);
            }
          },

          sockectOnCommand = function(controllerCommand) {
            var route = controllerCommand.route,
                command = controllerCommand.text,   
                currentDeck = null;

            console.log("Received command: " + JSON.stringify(command));

            if(slides[route]) {
              currentDeck = slides[route];

              switch(command) {
                case 'up':
                  currentDeck.indexv--;
                  break;
                case 'down':
                  currentDeck.indexv++;
                  break;
                case 'left':
                  currentDeck.indexh--;
                  break;
                case 'right':
                  currentDeck.indexh++;
                  break;
              }
              
              if(currentDeck.indexh < 0 ) {
                currentDeck.indexh = 0;
              }
                
              if(currentDeck.indexv < 0 ) {
                currentDeck.indexv = 0;
              }
              
              slides[route] = currentDeck;
              
              socket.broadcast.emit('updateData', currentDeck);
            }
          },

          sockectOnSlideChanged = function(data) {
            console.log("Received slide change: " + JSON.stringify(data));
              
            slides[data.route].indexh = data.indexh;
            slides[data.route].indexv = data.indexv;

            socket.broadcast.emit('recievedSlideChange', data);
          },

          sockectOnOverviewShown = function(data) {
            console.log("Received overview shown: " + JSON.stringify(data));
              
            slides[data.route].overview = true;

            socket.broadcast.emit('recievedOverviewShown', data);
          },

          sockectOnOverviewHidden = function(data) {
            console.log("Received overview hidden: " + JSON.stringify(data));
              
            slides[data.route].overview = false;

            socket.broadcast.emit('recievedOverviewHidden', data);
          },

          init = function () {
            //self calling function, this kicks everything off
            fileSystem.readFile(__dirname + '/config.json', loadConfig);
          }();

      return {
        config: config
      };
    }();