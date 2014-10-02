var Podium = Podium || {};

Podium.client = function() {
  var socket = io.connect('/'),
      deckRoute = window.location.pathname,
      

      main = function() {
        if(!Podium.queryString.editor) {
          socket.on('connect', function () {
            console.log("Client connected. Requesting current deck data.");
            
            // ask the server for the current settings (slide number) for the deck we are 
            // viewing 
            socket.emit('requestDeck', {'route': deckRoute} );
            
            // when the server sends us it back, set our current slides to whatever the server
            // is set to
            socket.on('initialData', function(data) {
              var hash = window.location.hash.replace('#/', '');

              console.log("Initial deck data: " + JSON.stringify(data) );

              if(data.route === deckRoute) {
                if(!hash) {
                  Reveal.navigateTo(data.indexh, data.indexv);  
                }
                
                if(data.overview && !Reveal.isOverview()) {
                  Reveal.toggleOverview();
                }
              }
            });
                
            // when the server sends out command from the controller, adjust our slides
            socket.on('updateData', function(data) {
              console.log("Received updated data: " + JSON.stringify(data) );
                  
              if(data.route == deckRoute) {
                Reveal.navigateTo(data.indexh, data.indexv);
              }
            });

            socket.on('recievedSlideChange', function(data) {
              console.log("Received slidechanged data: " + JSON.stringify(data) );
                  
              if(data.route == deckRoute) {
                Reveal.navigateTo(data.indexh, data.indexv);
              }
            });

            socket.on('recievedFragmentShown', function(data) {
              console.log("Received fragment shown data: " + JSON.stringify(data) );
                  
              Reveal.nextFragment();
            });

            socket.on('recievedFragmentHidden', function(data) {
              console.log("Received fragment hidden data: " + JSON.stringify(data) );
                  
              Reveal.prevFragment();
            });

            socket.on('recievedOverviewShown', function(data) {
              console.log("Received overview shown data: " + JSON.stringify(data) );
                  
              if(!Reveal.isOverview()) {
                Reveal.toggleOverview();
              }
            });

            socket.on('recievedOverviewHidden', function(data) {
              console.log("Received overview hidden data: " + JSON.stringify(data) );
                  
              if(Reveal.isOverview()) {
                Reveal.toggleOverview();
              }
            });    
          });
        }
      }();

  return {
    socket: socket,
    deckRoute: deckRoute
  };
}();