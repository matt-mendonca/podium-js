// Library Depencies
  var Ember = require('ember');

// App Code
  module.exports = function(App) {
    App.ApplicationRoute = Ember.Route.extend({
      model: function(params) {
        var user = JSON.parse(localStorage.getItem('puser'));

        if(user) {
          localStorage.setItem('pjwt', user.token);
        } else {
          user = { loggedIn: false };
        }

        App.User = App.Models.AppUser.create(user);

        return Ember.RSVP.hash({
          user: App.User
        });
      }
    });

    App.LogoutRoute = Ember.Route.extend({
      beforeModel: function() {
        localStorage.removeItem('pjwt');
        localStorage.removeItem('puser');

        window.location.href = window.location.origin;
      }
    });

    // There has got to be a better way
      App.IndexRoute = Ember.Route.extend(App.Mixins.AutheticatedRoute);
      App.ControllerRoute = Ember.Route.extend(App.Mixins.AutheticatedRoute);
      App.SlidesRoute = Ember.Route.extend(App.Mixins.AutheticatedRoute);
      App.SlideRoute = Ember.Route.extend(App.Mixins.AutheticatedRoute);
      App.SlidedeckCreateRoute = Ember.Route.extend(App.Mixins.AutheticatedRoute);
      App.SlidedeckImportRoute = Ember.Route.extend(App.Mixins.AutheticatedRoute);
      App.MyaccountRoute = Ember.Route.extend(App.Mixins.AutheticatedRoute);
      App.UsersRoute = Ember.Route.extend(App.Mixins.AutheticatedRoute);
      App.UserRoute = Ember.Route.extend(App.Mixins.AutheticatedRoute);
      App.UseraccountCreateRoute = Ember.Route.extend(App.Mixins.AutheticatedRoute);
      App.UserrolesRoute = Ember.Route.extend(App.Mixins.AutheticatedRoute);
      App.ConfigRoute = Ember.Route.extend(App.Mixins.AutheticatedRoute);

    // Redirect utility routes
      App.SlidedeckIndexRoute = Ember.Route.extend({
        beforeModel: function() {
          this.transitionTo('slides');
        }
      });

      App.UseraccountIndexRoute = Ember.Route.extend({
        beforeModel: function() {
          this.transitionTo('users');
        }
      });
  }(App);