// Library Depencies
  var Ember = require('ember'),
      DS = require('ember-data');

// App Code
  module.exports = function(App) {
    App.Models.AppUser = Ember.Object.extend({
      id: null,
      username: null,
      role: null,
      loggedIn: null
    });

    App.Models.SlideDeck = Ember.Object.extend({
      id: DS.attr(),
      title: DS.attr(),
      route: DS.attr(),
      summary: DS.attr(),
      published: DS.attr()
    });
  }(App);