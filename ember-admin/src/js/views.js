// Library Depencies
  var Ember = require('ember');

// App Code
  module.exports = function(App) {
    
    // There has got to be a better way
      App.IndexView = Ember.View.extend(App.Mixins.FoundationView);
      App.LogoutView = Ember.View.extend(App.Mixins.FoundationView);
      App.ControllerView = Ember.View.extend(App.Mixins.FoundationView);
      App.SlidesView = Ember.View.extend(App.Mixins.FoundationView);
      App.SlideView = Ember.View.extend(App.Mixins.FoundationView);
      App.SlidedeckView = Ember.View.extend(App.Mixins.FoundationView);
      App.MyaccountView = Ember.View.extend(App.Mixins.FoundationView);
      App.UsersView = Ember.View.extend(App.Mixins.FoundationView);
      App.UserView = Ember.View.extend(App.Mixins.FoundationView);
      App.UseraccountView = Ember.View.extend(App.Mixins.FoundationView);
      App.UserrolesView = Ember.View.extend(App.Mixins.FoundationView);
      App.ConfigView = Ember.View.extend(App.Mixins.FoundationView);

      App.LoginView = Ember.View.extend(App.Mixins.FoundationView);

  }(App);