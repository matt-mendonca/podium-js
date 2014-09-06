/**
 * Module dependencies.
 */
var jwt = require('jsonwebtoken');

module.exports = function() {
  var socketOnRequestSlideDeck = function(socket, slides, data) {
        if(slides[data.route]) {
          console.log('Sending initial deck data: ' + JSON.stringify(slides[data.route]) );
          socket.emit('initialData', slides[data.route]);
        }
      },

      socketOnCommand = function(socket, slides, controllerCommand) {
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

          return slides;
        }
      },

      socketOnSlideChanged = function(socket, slides, data) {
        console.log("Received slide change: " + JSON.stringify(data));
          
        slides[data.route].indexh = data.indexh;
        slides[data.route].indexv = data.indexv;


        socket.broadcast.emit('recievedSlideChange', data);

        return slides;
      },

      socketOnFragmentShown = function(socket, slides, data) {
        console.log("Received Fragment shown: " + JSON.stringify(data));

        socket.broadcast.emit('recievedFragmentShown', data);

        return slides;
      },

      socketOnFragmentHidden = function(socket, slides, data) {
        console.log("Received Fragment hidden: " + JSON.stringify(data));

        socket.broadcast.emit('recievedFragmentHidden', data);

        return slides;
      },

      socketOnOverviewShown = function(socket, slides, data) {
        console.log("Received overview shown: " + JSON.stringify(data));
        slides[data.route].overview = true;

        socket.broadcast.emit('recievedOverviewShown', data);

        return slides;
      },

      socketOnOverviewHidden = function(socket, slides, data) {
        console.log("Received overview hidden: " + JSON.stringify(data));
        slides[data.route].overview = false;

        socket.broadcast.emit('recievedOverviewHidden', data);

        return slides;
      };

  return {
    socketOnRequestSlideDeck: socketOnRequestSlideDeck,
    socketOnCommand: socketOnCommand,
    socketOnSlideChanged: socketOnSlideChanged,
    socketOnFragmentShown: socketOnFragmentShown,
    socketOnFragmentHidden: socketOnFragmentHidden,
    socketOnOverviewShown: socketOnOverviewShown,
    socketOnOverviewHidden: socketOnOverviewHidden
  };
}();