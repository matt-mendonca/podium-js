var fs = require('fs'),
    express = require('express'),
    app = express(),
    server = require('http').Server(app),
    io = require('socket.io')(server),
    podium = function() {
      var config = null,
          socket = null,
          slides = {},

          loadConfig = function (err, data) {
            if (err) {
              throw err;
            }

            config = JSON.parse(data);
            server.listen(config.port);
            app.set('views', __dirname + '/views');
            app.set('view engine', 'jade');
            app.use(express.static(__dirname + '/public'));
            console.log('podium server listening on port '+config.port);
            fs.readdir(__dirname + '/slides', scanSlidesDir);
          },

          scanSlidesDir = function(err, directories) {
            if (err) {
              throw err;
            }

            directories.forEach(function(slides_directory) {
              if(slides_directory === '.DS_Store') {
                // continue;
              } else if (fs.existsSync(__dirname + "/slides/"+slides_directory+"/podium.json")) {
                var slideDeck = JSON.parse(
                      fs.readFileSync(__dirname + "/slides/"+slides_directory+"/podium.json")
                    );

                /* 
                  Note: route is both the key and a property this 
                  is so we can identify the slide by the client's 
                  window.location.pathname (key) and access it as 
                  a property for templating (property - clean this out?) 
                 */
                slides[slideDeck.route] = {
                  name: slideDeck.name,
                  location: location = "/slides/"+slides_directory+"/",
                  route: slideDeck.route,
                  // initial slide horizontal index
                  indexh : 0,  
                  // initial slide veriticlal index
                  indexv : 0  
                };
              } else {
                console.log("\nWarning: There is no podium config file in /slides/"+slides_directory+"/");
              }
            });

            main();
          },

          main = function () {
            app.get('/', function (req, res) {
              res.render('index', {slides: slides});
            });

            app.get('/controller', function (req, res) {
              res.render('controller', {slides: slides});
            });

            //Map out all of the routes for the slide decks
            for (var route in slides) {
              app.use(express.static(__dirname + slides[route].location + 'public'));

              app.get(route, function (req, res) {
                res.sendfile(__dirname + slides[route].location+'index.html');
              });
            }

            io.on('connection', socketConnect);
          },

          socketConnect = function (sock) {
            // setting podium.socket so that it is availible to other lambda functions
            socket = sock;

            socket.on('requestDeck', socketRequestSlideDeck);
            socket.on('command', sockectOnCommand);
          },

          socketRequestSlideDeck = function(data) {
            if(slides[data.route]) {
              console.log('Sending initial deck data: ' + JSON.stringify(slides[data.route]) );
              socket.emit('initalData', slides[data.route]);
            }
          },

          sockectOnCommand = function(command) {
            var route = command.route,
                command = command.text,   
                currentDeck = null;

            console.log("Received command: " + JSON.stringify(command) );

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

          init = function () {
            //self calling function, this kicks everything off
            fs.readFile(__dirname + '/config.json', loadConfig);
          }();

      return {
        config: config
      };
    }();