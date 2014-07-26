var fs = require('fs'),
    express = require('express'),
    ejs = require('ejs'),
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
            console.log('Podium Express server listening on port '+config.port);
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

          socketRequestSlideDeck = function(data) {
            if(slides[data.route]) {
              console.log('sending init presentation data ' + JSON.stringify(slides[data.route]) );
              socket.emit('initdata', slides[data.route]);
            }
          },

          sockectOnCommand = function(command) {
            var route = command.route,
                // command can be 'up', 'down', 'left', 'right'
                command = command.text,   
                currentDeck = null;

            console.log("receive command " + JSON.stringify(command) );

            // TODO: future might need a way to tell how many slides there are

            if(slides[route]) {
              currentDeck = slides[route];
              // update ppt information

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
              
              // send the new data for update
              socket.broadcast.emit('updatedata', currentDeck);
            }
          },

          socketConnect = function (sock) {
            socket = sock;

            // once connected need to broadcast the cur slide data
            socket.on('request_presentation', socketRequestSlideDeck);
            
            // send commands to make slide go previous/ next/etc
            // this should be triggered from the remote controller
            socket.on('command', sockectOnCommand);
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

          init = function () {
            fs.readFile(__dirname + '/config.json', loadConfig);
          }();

      return {
        config: config
      };
    }();