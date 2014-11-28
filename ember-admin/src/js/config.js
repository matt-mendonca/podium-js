// Library Depencies
  var Ember = require('ember'),
      _ = require('lodash-node');

// App Code
  module.exports = function(App) {
    console.log('config code');

    var user = JSON.parse(localStorage.getItem('puser'));

    if(!user) {
      user = { loggedIn: false };
    }

    App.User = App.Models.AppUser.create(user);

    Ember.$.ajaxSetup({
      headers: {
        'Authorization': 'Bearer: ' + user.token
      }
    });

    Ember.$.get("/ember-user-roles").then(
      function(data) {
        _(data).forEach(function(role, roleName) {
          
          role.name = roleName;

          App.UserRoles[roleName] = App.Models.UserRole.create(role);
          
        });

        App.User.set('role', App.UserRoles[user.role]);
      },
      function(err) {
        console.log(err);
      }
    );

  }(App);