// Library Depencies
  var Ember = require('ember');

// App Code
  module.exports = function(App) {
    App.Router.map(function() {
      this.resource('index', { path: '/' });

      this.resource('login');
      this.resource('logout');

      this.resource('controller');

      this.resource('slides');
      this.resource('slide', { path: '/slide/:slide_route' });
      this.resource('slidedeck', { path: '/slide-deck' }, function() {
        this.route('create');
        this.route('import');
      });

      this.resource('myaccount', { path: '/my-account' });
      this.resource('users');
      this.resource('user', { path: 'users/:user_id' });
      this.resource('useraccount', { path: '/user-account' }, function() {
        this.route('create');
      });
      this.resource('userroles', { path: '/user-roles' });

      this.resource('config');
    });
  }(App);