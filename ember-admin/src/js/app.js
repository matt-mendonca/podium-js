// Library Dependencies
  var Ember = require('ember');
         
  require('foundation');
              
// App code
  App = Ember.Application.create();

// Load Modules
  require('./bootstrap');
  require('./mixins');
  require('./controllers');
  require('./models');
  require('./router');
  require('./routes');
  require('./growl_notifications');
  require('./views');
  require('./components');
  require('./templates');
  //require('./fixtures');