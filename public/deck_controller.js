;(function($) {
  // connect
  var socket = io.connect('/'); 
  
  socket.on('connect', function () {
    console.log("controller connected.");
    
    $('.controller .nav-buttons .button').click(function() {
      var slidesDeck = $('.slides-deck').val(),
          command = $(this).attr('data-command');
    
      // send command to server
      socket.emit('command', {'route' : slidesDeck, 'text': command } );
    }); 
  });
})(jQuery);