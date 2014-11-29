// Library Depencies
  var Ember = require('ember');

// App Code
  module.exports = function(App) {
    App.Mixins.AutheticatedRoute = Ember.Mixin.create({
      beforeModel: function() {
        if (!App.AppUser.loggedIn) {
          this.transitionTo('login');
        }
      },

      model: function(params) {
        return Ember.RSVP.hash({
          userRole: App.AppUser.getRole()
        });
      }
    });

    App.Mixins.FoundationView = Ember.Mixin.create({
      afterRenderEvent: function() {
        $(document).foundation();


        if (App.AppUser.loggedIn) {
          $('body').addClass('logged-in');
        } else {
          $('body').removeClass('logged-in');
        }

        console.log('ready');
      }
    });

  }(App);