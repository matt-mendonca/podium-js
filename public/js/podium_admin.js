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
    };

    return {
      state: state,
      init: init,
      mainMenuState: mainMenuState,
      setActiveLinks: setActiveLinks
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
  });
})(jQuery);