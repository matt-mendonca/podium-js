// Library Depencies
  var Ember = require('ember');

// App Code
  module.exports = function(App) {
    var usertoken = null;

    // Token defaults
    App.config.token = {
      name: 'puser',
      // Expire in 30 mins
      expireLimit: 1800000
    };

    // User defaults
    App.config.defaultUser = {
      loggedIn: false 
    };

    userToken = JSON.parse(localStorage.getItem(App.config.token.name));

    // This seems really hacky
    if(!userToken) {
      App.AppUser = App.Models.AppUser.create(App.config.defaultUser);
    } else if (userToken.expiresTime < Date.now()) {
      // Token expired
      localStorage.removeItem(App.config.token.name);
      App.AppUser = App.Models.AppUser.create(App.config.defaultUser);
      App.GNM.push('warning', 'Session expired.');
    } else {
      // Token still good
      Ember.$.ajax({
        url: "/api/user/" + userToken.id,
        type: "GET",
        async: false,
        beforeSend: function(request) {
          request.setRequestHeader('Authorization', 'Bearer: ' + userToken.token);
        },
        success: function(data) {
          data.loggedIn = true;

          App.GNM.push('info', 'Session resumed.');

          App.AppUser = App.Models.AppUser.create(data);
          App.AppUser.logIn(data, userToken);
        },
        error: function(error) {
          console.log(error);
        }
      });
    }

  }(App);