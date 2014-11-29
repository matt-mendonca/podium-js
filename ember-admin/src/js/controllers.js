// Library Depencies
  var Ember = require('ember'),
      $ = require('jquery');

// App Code
  module.exports = function(App) {
    App.LoginController = Ember.Controller.extend({
      actions: {
        authenticate: function() {
          var request = Ember.$.post("/api/login", this.getProperties("username", "password"));
              
          request.then(this.success.bind(this), this.failure.bind(this));
        }
      },

      success: function(data) {
        App.AppUser.set('loggedIn', true);
        App.AppUser.logIn(data.user);

        this.transitionToRoute('index');
      },

      failure: function(data) {
        App.GNM.push('alert', 'Log In Failed!');

        $('.login-form').addClass('animated shake').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(event) {
          $(this).removeClass('animated shake');
        });
      }
    });
  }(App);