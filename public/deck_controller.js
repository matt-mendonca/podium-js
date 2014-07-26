;(function($) {
  var socket = io.connect('/'); 
  
  socket.on('connect', function () {
    console.log("Controller connected.");
    
    $('.nav-buttons .button').click(function() {
      var slidesDeck = $('.slide-decks').val(),
          command = $(this).attr('data-command');
    
      socket.emit('command', {'route' : slidesDeck, 'text': command } );
    }); 
  });
})(jQuery);