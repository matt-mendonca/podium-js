// Library Depencies
  var Ember = require('ember'),
      _ = require('lodash');
      DS = require('ember-data');

// App Code
  module.exports = function(App) {
    App.Models.AppUser = Ember.Object.extend({
      id: null,
      username: null,
      roleName: null,
      loggedIn: null,
      tokenString: null,

      getRole: function() {
        return App.UserRoles[this.get('roleName')];
      },

      getToken: function() {
        return App.AppUserToken;
      },

      // Should this observe something?
      setAjaxHeader: function() {
        Ember.$.ajaxSetup({
          headers: {
            'Authorization': 'Bearer: ' + this.getToken().get('tokenString')
          }
        });
      },

      getRoleData: function() {
        //Make async
        Ember.$.ajax({
          url: "/api/user-roles",
          type: "GET",
          async: false,
          success: function(data) {
            _(data).forEach(function(role, roleName) {
              role.name = roleName;
              App.UserRoles[roleName] = App.Models.UserRole.create(role);
            });
          },
          error: function(error) {
            console.log(error);
          }
        });
      },

      logIn: function(user, token) {
        token = token || {};

        if (this.get('loggedIn')) {
          App.config.token.createdTime = token.createdTime || Date.now();

          App.AppUser.setProperties(user);

          App.config.token.tokenString = this.get('tokenString');
          App.AppUserToken = App.Models.UserToken.create(App.config.token);

          this.setAjaxHeader();

          this.getRoleData();

          App.GNM.push('success', 'Log In Successful!');
        }
      },

      logOut: function() {
        this.get('token').clearToken();
        this.setPropertiest(App.config.defaultUser);
        this.destroy();
      }
    });

    App.Models.UserToken = Ember.Object.extend({
      // This is the localStorage item name
      name: null,

      // when the token was created
      createdTime: null,

      // how many milli seconds until the token will expire
      expireLimit: null,

      // this is the actual jwt string
      tokenString: null,

      // this computes that expire timestamp 
      expiresTime: function() {
        return this.get('createdTime') + this.get('expireLimit');
      }.property('createdTime', 'expireLimit'),

      // sets the token in local storage
      setToken: function() {
        localStorage.setItem(this.get('name'), JSON.stringify({
          id: App.AppUser.get('id'),
          token: this.get('tokenString'),
          expiresTime: this.get('expiresTime'),
          createdTime: this.get('createdTime')
        }));
      }.observes('App.AppUser.id', 'tokenString').on('init'), 

      // gets the token from local storage
      getToken: function() {
        return JSON.parse(localStorage.getItem(this.get('name')));
      },

      // checks the expire time against the current time
      checkExpired: function() {
        var token = this.getToken();

        return token.expires < Date.now();
      },

      // clears out the token
      clearToken: function() {
        localStorage.removeItem(this.get('name'));
        this.destroy();
      }
    });

    App.Models.UserRole = Ember.Object.extend({
      name: null,
      present: null,
      editDecks: null,
      manageUsers: null,
      manageSiteConfig: null
    });

    App.Models.SlideDeck = Ember.Object.extend({
      id: DS.attr(),
      title: DS.attr(),
      route: DS.attr(),
      summary: DS.attr(),
      published: DS.attr()
    });
  }(App);