// Library Depencies
  var Ember = require('ember');

// App Code
  module.exports = function(App) {
    App.Mixins.AutheticatedRoute = Ember.Mixin.create({
      beforeModel: function() {
        if (!App.User.loggedIn) {
          this.transitionTo('login');
        }
      }
    });

    App.Mixins.FoundationView = Ember.Mixin.create({
      afterRenderEvent: function() {
        $(document).foundation();


        if (App.User.loggedIn) {
          $('body').addClass('logged-in');
        } else {
          $('body').removeClass('logged-in');
        }

        console.log('ready');
      }
    });

  }(App);