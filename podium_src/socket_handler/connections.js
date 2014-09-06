module.exports = function(io, app, config, passport, baseDir, slides) {
  var socketHandler = require(baseDir + '/podium_src/socket_handler');
  var authenticator = require(baseDir + '/podium_src/authenticator');

  io.on('connection', function (socket) {
    // When a client first loads up a deck
    socket.on('requestDeck', function(data) {
      socketHandler.socketOnRequestSlideDeck(socket, slides, data);
    });

    // When the controller view sends a command
    socket.on('command', function(data) {
      var verified = authenticator.verifyJWT(config, data);

      if(verified) {
        delete data.token;
        slides = socketHandler.socketOnCommand(socket, slides, data);
      }
    });

    // When client deck in controller mode changes slides
    socket.on('slideChanged', function(data) {
      var verified = authenticator.verifyJWT(config, data);

      if(verified) {
        delete data.token;
        slides = socketHandler.socketOnSlideChanged(socket, slides, data);
      }
    });

    // When client deck in controller mode goes to overview mode
    socket.on('overviewShown', function(data) {
      var verified = authenticator.verifyJWT(config, data);

      if(verified) {
        delete data.token;
        slides = socketHandler.socketOnOverviewShown(socket, slides, data);
      }
    });

    // When client deck in controller mode leaves overview mode
    socket.on('overviewHidden', function(data) {
      var verified = authenticator.verifyJWT(config, data);

      if(verified) {
        delete data.token;
        slides = socketHandler.socketOnOverviewHidden(socket, slides, data);
      }
    });
  });
};