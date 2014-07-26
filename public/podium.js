;(function() {
  var socket = io.connect('/'),
      deck_route = window.location.pathname;
      
  socket.on('connect', function () {
    console.log("Client connected. Requesting current deck data.");
        
    socket.emit('requestDeck', {'route': deck_route} );
      
    socket.on('initialData', function(data) {
      console.log("Initial deck data: " + JSON.stringify(data) );

      if(data.route == deck_route) {
        Reveal.navigateTo(data.indexh, data.indexv);
      }
    });
        
    socket.on('updateData', function(data) {
      console.log("Received updated data: " + JSON.stringify(data) );
          
      if(data.route == deck_route) {
        Reveal.navigateTo(data.indexh, data.indexv);
      }
    });     
  });
})();
