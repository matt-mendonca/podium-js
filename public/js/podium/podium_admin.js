var Podium = Podium || {};

;(function($) {
  Podium.admin = function() {
    var setActiveLinks = function(index) {
          var activeLink = $('a[href="'+(window.location.pathname)+'"]');

          if(activeLink.length > 1) {
            activeLink.not('.trigger-submenu').addClass('active');
          } else {
            activeLink.addClass('active');
          }

          // Hacky way to show active sub menu
            //$('.main-menu .left-submenu .active').parents('.has-submenu').find('.trigger-submenu').click();
        },

        mainMenuHoverLogic = function() {
          $('.main-menu .off-canvas-list > li').not('.has-submenu').mouseenter(function(event) {
            $('.left-submenu.move-right .back').click();
          });

          $('.main-menu .has-submenu').mouseenter(function(event) {
            $(this).find('.trigger-submenu').click();
          });

          $('.main-menu .left-submenu').mouseleave(function(event) {
            $(this).find('.back').click();
          });
        },

        slideEditValidate = function() {
          $('.route input').blur(sanitizeRouteField);
        },

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

        editUserForm = function() {
          $('.delete-user').click(function(event) {
            var editFormAction = $('.edit-user-form').attr('action');

            if($('.current-password input').val()) {
              editFormAction += '/delete';

              $('.edit-user-form').attr('action', editFormAction);
            }

            $('#deleteModal').foundation('reveal', 'close');
            $('.edit-user-form').submit();
          });
        },

        deckController = function() {
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
            
              socket.emit('command', {'route' : slidesDeck, 'text': command, 'token': Podium.token } );
            }); 
          });
        };

    return {
      setActiveLinks: setActiveLinks,
      mainMenuHoverLogic: mainMenuHoverLogic,
      slideEditValidate: slideEditValidate,
      editUserForm: editUserForm,
      deckController: deckController
    };
  }();

  $(document).ready(function() {
    // Hacky way to set active links
      //Podium.admin.setActiveLinks();

      $('a[href="'+(window.location.pathname)+'"]').addClass('active');

    $('.main-menu .left-submenu a[href]').click(function(event) {
      event.stopPropagation();
    });

    $('.main-menu .has-submenu').click(function(event) {
      $('.left-submenu.move-right').removeClass('move-right');
    });
    
    //Podium.admin.mainMenuHoverLogic();

    if ($('.edit-slide-form').length > 0 || $('.create-slide-form').length > 0) {
      Podium.admin.slideEditValidate();
    } else if ($('.edit-user-form').length > 0) {
      Podium.admin.editUserForm();
    } else if ($('.deck-controller').length > 0) {
      Podium.admin.deckController();
    }
  });
})(jQuery);