;(function($) {
  var socket = io.connect('/'),
      deckRoute = $('.slide-decks').val(),
      setSlideViewRoute = function(deckRoute) {
        $('.slide-view').attr('href', deckRoute+'?controller=true');
      };

  setSlideViewRoute(deckRoute);  

  $('.slide-decks').change(function(event) {
    deckRoute = $(this).val();

    setSlideViewRoute(deckRoute);
  });
  
  socket.on('connect', function () {
    console.log("Controller connected.");
    
    $('.nav-buttons .button').click(function() {
      var slidesDeck = $('.slide-decks').val(),
          command = $(this).attr('data-command');
    
      socket.emit('command', {'route' : slidesDeck, 'text': command } );
    }); 
  });
})(jQuery);