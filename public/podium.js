;(function() {
  var socket = io.connect('/'),
      deckRoute = window.location.pathname,
      queryString = window.location.search.replace('?', '').split('&') || [],
      // this var is used to determine is the current client viewing slides
      // can also control the slides for everyone else
      controller = false;

  // Iterate over the querystring properties to see if controller is true 
  // i.e. ?controller=true
  queryString.forEach(function(property, index) {
    queryString[index] = property.split('=');

    if(queryString[index][0] === 'controller' && queryString[index][1] === 'true') {
      controller = true;
    }
  });

  socket.on('connect', function () {
    console.log("Client connected. Requesting current deck data.");
    
    // ask the server for the current settings (slide number) for the deck we are 
    // viewing 
    socket.emit('requestDeck', {'route': deckRoute} );
    
    // when the server sends us it back, set our current slides to whatever the server
    // is set to
    socket.on('initialData', function(data) {
      console.log("Initial deck data: " + JSON.stringify(data) );

      if(data.route == deckRoute) {
        Reveal.navigateTo(data.indexh, data.indexv);
      }
    });
        
    // when the server sends out command from the controller, adjust our slides
    socket.on('updateData', function(data) {
      console.log("Received updated data: " + JSON.stringify(data) );
          
      if(data.route == deckRoute) {
        Reveal.navigateTo(data.indexh, data.indexv);
      }
    });

    // check if we are controlling the sides for the server
    // if we are, let the server know when ever we change slides
    // so the server can broadcast it out
    if(controller) {
      Reveal.addEventListener( 'slidechanged', function( event ) {
        socket.emit(
          'slideChanged', 
          {
            'route' : deckRoute,
            'indexh': event.indexh,
            'indexv': event.indexv
          }
        );
      });

    // only update slides from slideChanged if we aren't controlling
    } else {
      socket.on('recievedSlideChange', function(data) {
        console.log("Received slidechanged data: " + JSON.stringify(data) );
            
        if(data.route == deckRoute) {
          Reveal.navigateTo(data.indexh, data.indexv);
        }
      });  
    }     
  });
})();
