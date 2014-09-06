var ExpressBrute = require('express-brute'),
    store = new ExpressBrute.MemoryStore(),
    bruteforce = new ExpressBrute(store);

module.exports = function(app, users, passport, authenticator, baseDir, config, slides) {
  var bootstrapper = require(baseDir + '/podium_src/bootstrapper'),
      router = require(baseDir + '/podium_src/router');

  app.get('/', function(req, res) {
    var routeVars = router.setRouteVars(req);

    res.render(
      'index',
      {
        title: 'PodiumJS',
        loggedIn: routeVars.loggedIn,
        slides: slides,
        error: routeVars.error,
        status: routeVars.status
      }
    );
  });

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

  app.get('/set-jwt', authenticator.isLoggedIn, function(req, res) {
    var token = null;

    if (req.user) {
      token = authenticator.createJWT(config, req.user);

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

  app.get('/admin', authenticator.isLoggedIn, function(req, res) {
    var routeVars = router.setRouteVars(req);

    res.render(
      'admin',
      {
        title: 'Welcome',
        loggedIn: routeVars.loggedIn,
        error: routeVars.error,
        status: routeVars.status
      }
    );
  });

  app.get('/admin/controller', authenticator.isLoggedIn, function(req, res) {
    var routeVars = router.setRouteVars(req);

    res.render(
      'controller',
      {
        title: 'Controller',
        loggedIn: routeVars.loggedIn,
        slides: slides,
        breadcrumbs: routeVars.breadcrumbs,
        error: routeVars.error,
        status: routeVars.status
      }
    );
  });

  app.get('/admin/slides', authenticator.isLoggedIn, function(req, res) {
    var routeVars = router.setRouteVars(req);

    res.render(
      'slides',
      {
        title: 'Slides',
        loggedIn: routeVars.loggedIn,
        slides: slides,
        breadcrumbs: routeVars.breadcrumbs,
        error: routeVars.error,
        status: routeVars.status
      }
    );
  });

  app.get('/admin/user', authenticator.isLoggedIn, function(req, res) {
    var routeVars = router.setRouteVars(req);

    res.render(
      'user',
      {
        title: 'My Account',
        loggedIn: routeVars.loggedIn,
        breadcrumbs: routeVars.breadcrumbs,
        username: req.user.username,
        error: routeVars.error,
        status: routeVars.status
      }
    );
  });

  app.post('/admin/user',
    authenticator.isLoggedIn,
    bruteforce.prevent,
    function(req, res) {
      var userUpdatedError = authenticator.updateUser(users, req.user, req.body, baseDir);

      if(userUpdatedError === 'currentPassword') {
        req.flash('error', 'Wrong current password.');
        res.redirect('/admin/user');  
      } else if(userUpdatedError === 'usernameTaken') {
        req.flash('error', 'Username is taken.');
        res.redirect('/admin/user');  
      } else if (!userUpdatedError) {
        req.flash('status', 'Account updated.');
        res.redirect('/admin');  
      } 
    }
  );

  app.get('/admin/config', authenticator.isLoggedIn, function(req, res) {
    var routeVars = router.setRouteVars(req);

    res.render(
      'config',
      {
        title: 'Configuration',
        loggedIn: routeVars.loggedIn,
        breadcrumbs: routeVars.breadcrumbs,
        config: config,
        error: routeVars.error,
        status: routeVars.status
      }
    );
  });

  app.post('/admin/config',
    authenticator.isLoggedIn,
    bruteforce.prevent,
    function(req, res) {
      bootstrapper.updateConfig(config, req.body, baseDir);
      req.flash('status', 'Configuration updated. Please restart PodiumJS.');
      res.redirect('/admin');  
    }
  );

  // Front controller for all other routing
  app.get('/*', function (req, res) {
    // everything else is assumed to be a slide deck
    // 404's handled in deckRoute()
    var routeVars = router.setRouteVars(req);

    router.deckRoute(req, res, slides, baseDir, config, routeVars);
  });
};