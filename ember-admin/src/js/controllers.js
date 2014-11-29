// Library Depencies
  var Ember = require('ember'),
      $ = require('jquery');

// App Code
  module.exports = function(App) {
    App.ApplicationController = Ember.Controller.extend({
      actions: {
        refreshModel: function() {
          this.set('model', {
            user: App.AppUser,
            userRole: App.AppUser.getRole()
          });
        }
      }
    });

    App.LoginController = Ember.Controller.extend({
      needs: ["application"],

      actions: {
        authenticate: function() {
          var request = Ember.$.post("/api/login", this.getProperties("username", "password"));
              
          request.then(this.success.bind(this), this.failure.bind(this));
        }
      },

      success: function(data) {
        App.AppUser.set('loggedIn', true);
        App.AppUser.logIn(data.user);

        this.get('controllers.application').send('refreshModel');

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