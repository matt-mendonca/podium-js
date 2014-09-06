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
    };

    return {
      state: state,
      init: init,
      mainMenuState: mainMenuState,
      setActiveLinks: setActiveLinks,
      slideEditValidate: slideEditValidate
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
    }
  });
})(jQuery);