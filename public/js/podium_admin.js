;(function($) {
  window.PodiumAdmin = (function() {
    var state = {
      mainMenuOpen: null
    },

    init = function() {
      /*
      state.mainMenuOpen = localStorage.getItem('mainMenuOpen');

      if(state.mainMenuOpen) {
        $('.off-canvas-wrap').foundation('offcanvas', 'show', 'move-right');
      }
      */
    },

    mainMenuState = function(mainMenuOpen) {
      state.mainMenuOpen = mainMenuOpen;
      localStorage.setItem('mainMenuOpen', state.mainMenuOpen);
    },

    setActiveLinks = function(index) {
      var linkURL = $(this).attr('href');

      if(linkURL === window.location.pathname) {
        $(this).addClass('active');
      }
    },

    slideEditValidate = function() {
      $('.route input').blur(sanitizeRouteField);
    }

    sanitizeRouteField = function(event) {
      var route = $(this).val();
      
      // Add a / to the front of the route if it isn't there
        if(route.charAt(0) !== '/') {
          route = "/" + route;
        }
      // Lowercase and replace spaces with dashes
        route = route.toLowerCase().replace(/\s+/g, '-');

      $(this).val(route);
    },

    deckController = function() {
      var token = localStorage.getItem('token'),
          socket = io.connect('/'),
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
        
          socket.emit('command', {'route' : slidesDeck, 'text': command, 'token': token } );
        }); 
      });
    };

    return {
      state: state,
      init: init,
      mainMenuState: mainMenuState,
      setActiveLinks: setActiveLinks,
      slideEditValidate: slideEditValidate,
      deckController: deckController
    };
  })();

  $(document).ready(function() {
    PodiumAdmin.init();
    
    /*
    $(document).on('open.fndtn.offcanvas', function() {
      PodiumAdmin.mainMenuState(true);
    });
    $(document).on('close.fndtn.offcanvas', function() {
      PodiumAdmin.mainMenuState(false);
    });
    */

    $('.main-menu li a').each(PodiumAdmin.setActiveLinks);

    if ($('.slide-edit-form').length > 0) {
      PodiumAdmin.slideEditValidate();
    } else if ($('.deck-controller').length > 0) {
      PodiumAdmin.deckController();
    }
  });
})(jQuery);