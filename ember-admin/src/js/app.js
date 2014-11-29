// Library Dependencies
  var Ember = require('ember');
         
  require('foundation');
              
// App code
  App = Ember.Application.create();

// Load Modules
  require('./bootstrap');
  require('./mixins');
  require('./models');
  require('./controllers');
  require('./growl_notifications');
  require('./config');
  require('./router');
  require('./routes');
  require('./views');
  require('./components');
  require('./templates');
  //require('./fixtures');