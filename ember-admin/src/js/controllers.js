// Library Depencies
  var Ember = require('ember'),
      $ = require('jquery');

// App Code
  module.exports = function(App) {
    App.LoginController = Ember.Controller.extend({
      actions: {
        authenticate: function() {
          var request = Ember.$.post("/ember-login", this.getProperties("username", "password"));
              
          request.then(this.success.bind(this), this.failure.bind(this));
        }
      },

      success: function(data) {
        data.user.loggedIn = true;
        App.User.setProperties(data.user);
        // expire in 30 mins
        data.user.expires = Date.now() + 1800000;
        localStorage.setItem('puser', JSON.stringify(data.user));

        App.GNM.push('success', 'Log In Successful!');

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