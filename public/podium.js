;(function() {
  var controller = false,
      socket = io.connect('/'),
      deckRoute = window.location.pathname,
      queryString = window.location.search.replace('?', '').split('&');

  queryString.forEach(function(property, index) {
    queryString[index] = property.split('=');

    if(queryString[index][0] === 'controller' && queryString[index][1] === 'true') {
      controller = true;
    }
  });

  socket.on('connect', function () {
    console.log("Client connected. Requesting current deck data.");
        
    socket.emit('requestDeck', {'route': deckRoute} );
      
    socket.on('initialData', function(data) {
      console.log("Initial deck data: " + JSON.stringify(data) );

      if(data.route == deckRoute) {
        Reveal.navigateTo(data.indexh, data.indexv);
      }
    });
        
    socket.on('updateData', function(data) {
      console.log("Received updated data: " + JSON.stringify(data) );
          
      if(data.route == deckRoute) {
        Reveal.navigateTo(data.indexh, data.indexv);
      }
    });

    if(!controller) {
      socket.on('recievedSlideChange', function(data) {
        console.log("Received slidechanged data: " + JSON.stringify(data) );
            
        if(data.route == deckRoute) {
          Reveal.navigateTo(data.indexh, data.indexv);
        }
      });  
    } else if(controller) {
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
    }     
  });
})();
