;(function() {
  Podium.client.socket.on('connect', function () {
    Reveal.addEventListener( 'slidechanged', function( event ) {
      Podium.client.socket.emit(
        'slideChanged', 
        {
          'route' : Podium.client.deckRoute,
          'indexh': event.indexh,
          'indexv': event.indexv,
          'token': Podium.token
        }
      );
    });

    Reveal.addEventListener( 'fragmentshown', function( event ) {
      Podium.client.socket.emit('fragmentShown', {'route' : Podium.client.deckRoute, 'token': Podium.token });
    });
    Reveal.addEventListener( 'fragmenthidden', function( event ) {
      Podium.client.socket.emit('fragmentHidden', {'route' : Podium.client.deckRoute, 'token': Podium.token });
    });

    Reveal.addEventListener('overviewshown', function( event ) {
      Podium.client.socket.emit('overviewShown', {'route' : Podium.client.deckRoute, 'token': Podium.token });
    });

    Reveal.addEventListener('overviewhidden', function( event ) {
      Podium.client.socket.emit('overviewHidden', {'route' : Podium.client.deckRoute, 'token': Podium.token });
    });    
  });
})();
