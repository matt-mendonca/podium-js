;(function() {
  var token = localStorage.getItem('token');

  Podium.socket.on('connect', function () {
    Reveal.addEventListener( 'slidechanged', function( event ) {
      Podium.socket.emit(
        'slideChanged', 
        {
          'route' : Podium.deckRoute,
          'indexh': event.indexh,
          'indexv': event.indexv,
          'token': token
        }
      );
    });

    Reveal.addEventListener( 'fragmentshown', function( event ) {
      Podium.socket.emit('fragmentShown', {'route' : Podium.deckRoute, 'token': token });
    });
    Reveal.addEventListener( 'fragmenthidden', function( event ) {
      Podium.socket.emit('fragmentHidden', {'route' : Podium.deckRoute, 'token': token });
    });

    Reveal.addEventListener('overviewshown', function( event ) {
      Podium.socket.emit('overviewShown', {'route' : Podium.deckRoute, 'token': token });
    });

    Reveal.addEventListener('overviewhidden', function( event ) {
      Podium.socket.emit('overviewHidden', {'route' : Podium.deckRoute, 'token': token });
    });    
  });
})();
