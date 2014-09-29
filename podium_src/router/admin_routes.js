/**
 * This file maps callbacks to admin routes
 */

var Promise = require('bluebird'),
    fileSystem = Promise.promisifyAll(require('fs-extra')),
    ExpressBrute = require('express-brute'),
    store = new ExpressBrute.MemoryStore(),
    passport = require('passport'),
    bruteforce = new ExpressBrute(store);

module.exports = function(app, config, users, slides, baseDir) {
  var configManager = require(baseDir + '/podium_src/config_manager'),
      router = require(baseDir + '/podium_src/router');

  app.get('/login', function(req, res) {
    var error_message = req.flash('error');

    if (req.user) {
      res.redirect('/admin');
    } else {
      res.render(
        'login', {
          loggedIn: false,
          message: error_message
        }
      );
    }
  });

  app.post('/login',
    bruteforce.prevent,
    passport.authenticate(
      'local', {
        successRedirect: '/set-jwt',
        failureRedirect: '/login',
        successFlash: 'Logged In',
        failureFlash: 'Invalid Username or Password'      
      }
    )
  );

  app.get('/set-jwt', userManager.isLoggedIn, function(req, res) {
    var token = null;

    if (req.user) {
      token = userManager.createJWT(config, req.user);

      res.render('set_jwt', {token: token});
    } else {
      res.redirect('/login');
    }
  });

  app.get('/logout', function(req, res){
    res.redirect('/clear-jwt');
  });

  app.get('/clear-jwt', function(req, res){
    res.render('clear_jwt', {});
  });

  app.get('/clear-session', function(req, res){
    req.logout();
    res.redirect('/');
  });

  app.get('/admin', userManager.isLoggedIn, function(req, res) {
    var routeVars = router.setRouteVars(req);

    res.render(
      'dashboard',
      {
        title: 'Welcome ' + req.user.username,
        loggedIn: routeVars.loggedIn,
        error: routeVars.error,
        status: routeVars.status
      }
    );
  });

  app.get('/admin/config', userManager.isLoggedIn, function(req, res) {
    var routeVars = router.setRouteVars(req);

    res.render(
      'config',
      {
        title: 'Configuration',
        loggedIn: routeVars.loggedIn,
        breadcrumbs: routeVars.breadcrumbs,
        config: config,
        slides: slides,
        error: routeVars.error,
        status: routeVars.status
      }
    );
  });

  app.post('/admin/config',
    userManager.isLoggedIn,
    bruteforce.prevent,
    function(req, res) {
      config = configManager.updateConfig(config, req.body);

      fileSystem.writeJsonAsync(baseDir + '/config/config.json', config).then(function() {
        req.flash('status', 'Configuration updated.');
        res.redirect('/admin');  
      });
    }
  );

  // Catch all for other admin routes
  app.get('/admin/*', function (req, res) {
    req.flash('status', 'Page not found.');
    res.redirect('/admin');
  });
};