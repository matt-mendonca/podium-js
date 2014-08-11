;(function() {
  Podium.socket.on('connect', function () {
    Reveal.addEventListener( 'slidechanged', function( event ) {
      Podium.socket.emit(
        'slideChanged', 
        {
          'route' : Podium.deckRoute,
          'indexh': event.indexh,
          'indexv': event.indexv
        }
      );
    });

    Reveal.addEventListener('overviewshown', function( event ) {
      Podium.socket.emit('overviewShown', {'route' : Podium.deckRoute });
    });

    Reveal.addEventListener('overviewhidden', function( event ) {
      Podium.socket.emit('overviewHidden', {'route' : Podium.deckRoute });
    });    
  });
})();
