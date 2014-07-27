;(function($) {
  var socket = io.connect('/'),
      // helper function to set the url of the 'control in presentation' button 
      // when ever the slides select changes value
      setSlideViewRoute = function(deckRoute) {
        $('.slide-view').attr('href', deckRoute+'?controller=true');
      };

  // set it initally
  setSlideViewRoute($('.slide-decks').val());  

  $('.slide-decks').change(function(event) {
    setSlideViewRoute($(this).val());
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