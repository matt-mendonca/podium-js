;(function() {
  var socket = io.connect('/'),
      deck_route = window.location.pathname;
      
  socket.on('connect', function () {
    console.log("client connected. Sending cur slide request");
        
    // on connect send presentation request
    socket.emit('request_presentation', {'route': deck_route} );
      
    // init data
    socket.on('initdata', function(data) {
      console.log("Init data: " + JSON.stringify(data) );

      if(data.route == deck_route) {
        // go to the respective slide
        Reveal.navigateTo(data.indexh, data.indexv);
      }
    });
        
    socket.on('updatedata', function(data) {
      console.log("Receive update data: " + JSON.stringify(data) );
          
      if(data.route == deck_route) {
        // go to the respective slide
        Reveal.navigateTo(data.indexh, data.indexv);
      }
    });     
  });
})();
