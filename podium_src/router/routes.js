/**
 * This file maps callbacks to specific routes
 */

var ExpressBrute = require('express-brute'),
    store = new ExpressBrute.MemoryStore(),
    passport = require('passport'),
    bruteforce = new ExpressBrute(store);

module.exports = function(app, config, users, slides, baseDir) {
  var configManager = require(baseDir + '/podium_src/config_manager'),
      userManager = require(baseDir + '/podium_src/user_manager'),
      slidesManager = require(baseDir + '/podium_src/slides_manager'),
      router = require(baseDir + '/podium_src/router');

  app.get('/', function(req, res) {
    var routeVars = router.setRouteVars(req);
        publishedSlides = slidesManager.getPublishedSlides(slides);

    res.render(
      'index',
      {
        title: 'Podium JS',
        loggedIn: routeVars.loggedIn,
        slides: publishedSlides,
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
        title: 'Welcome',
        loggedIn: routeVars.loggedIn,
        error: routeVars.error,
        status: routeVars.status
      }
    );
  });

  app.get('/admin/controller', userManager.isLoggedIn, function(req, res) {
    var routeVars = router.setRouteVars(req),
        publishedSlides = slidesManager.getPublishedSlides(slides);

    if(Object.keys(publishedSlides).length > 0) {
      res.render(
        'controller',
        {
          title: 'Controller',
          loggedIn: routeVars.loggedIn,
          slides: publishedSlides,
          breadcrumbs: routeVars.breadcrumbs,
          error: routeVars.error,
          status: routeVars.status
        }
      ); 
    } else {
      req.flash('error', 'Please publish at least one slide deck to present.');
      res.redirect('/admin/slides'); 
    }
  });

  app.get('/admin/slides', userManager.isLoggedIn, function(req, res) {
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

  app.param('slideDeck', function (req, res, next, slideDeck) {
    slideDeck = '/' + slideDeck;

    if(slides[slideDeck]) {
      req.slideDeck = slides[slideDeck];
    }

    next();
  });

  app.get('/admin/slide-deck', userManager.isLoggedIn, function(req, res) {
    res.redirect('/admin/slides'); 
  });

  app.get('/admin/slide-deck/create', userManager.isLoggedIn, function(req, res) {
    var routeVars = router.setRouteVars(req);
    
    res.render(
      'slide_new',
      {
        title: 'Create New Slide Deck',
        loggedIn: routeVars.loggedIn,
        breadcrumbs: routeVars.breadcrumbs,
        slideDeck: {
          title: "",
          route: "",
          summary: "",
          published: false
        },
        error: routeVars.error,
        status: routeVars.status
      }
    );  
  });

  app.post('/admin/slide-deck/create',
    userManager.isLoggedIn,
    bruteforce.prevent,
    function(req, res) {
      var slideDeckUpdatedError = slidesManager.createSlideDeck(config, slides, req.body, baseDir);

      if(slideDeckUpdatedError === 'emptyFields') {
        req.flash('error', 'All fields need to be filled out.');
        res.redirect('/admin/slides/create-new-slide-deck');  
      } else if(slideDeckUpdatedError === 'routeTaken') {
        req.flash('error', 'Route is taken.');
        res.redirect('/admin/slides/create-new-slide-deck'); 
      } else if (!slideDeckUpdatedError) {
        req.flash('status', 'Slide Deck created.');
        res.redirect('/admin/slides' + req.body.route); 
      } 
    }
  );

  app.get('/admin/slides/:slideDeck', userManager.isLoggedIn, function(req, res) {
    var routeVars = router.setRouteVars(req);

    if(req.slideDeck) {
      res.render(
        'slide_edit',
        {
          title: 'Edit Slide Deck',
          loggedIn: routeVars.loggedIn,
          breadcrumbs: routeVars.breadcrumbs,
          slideDeck: req.slideDeck,
          error: routeVars.error,
          status: routeVars.status
        }
      );  
    } else {
      req.flash('error', 'Slide Deck not found.');
      res.redirect('/admin/slides');  
    }
  });

  app.post('/admin/slides/:slideDeck',
    userManager.isLoggedIn,
    bruteforce.prevent,
    function(req, res) {
      var slideDeckUpdatedError = slidesManager.updateSlideDeck(slides, req.slideDeck, req.body, baseDir);

      if(slideDeckUpdatedError === 'emptyFields') {
        req.flash('error', 'All fields need to be filled out.');
        res.redirect('/admin/slides/' + req.params.slideDeck);  
      } else if(slideDeckUpdatedError === 'routeTaken') {
        req.flash('error', 'Route is taken.');
        res.redirect('/admin/slides/' + req.params.slideDeck); 
      } else if (!slideDeckUpdatedError) {
        req.flash('status', 'Slide Deck updated.');
        res.redirect('/admin/slides'); 
      } 
    }
  );

  app.get('/admin/slides/:slideDeck/delete', userManager.isLoggedIn, function(req, res) {
    slidesManager.deleteSlideDeck(slides, req.slideDeck, baseDir);

    req.flash('status', 'Slide Deck deleted.');
    res.redirect('/admin/slides'); 
  });

  app.post('/admin/slides/:slideDeck/update-content',
    userManager.isLoggedIn,
    bruteforce.prevent,
    function(req, res) {
      var slideDeckContentUpdatedError = slidesManager.updateSlideDeckContent(config, slides, req.slideDeck, req.body.slidesMarkup, baseDir);

      if(slideDeckContentUpdatedError === 'empty') {
        req.flash('error', 'The slide content was empty.');
        res.redirect('/admin/slides/' + req.params.slideDeck);  
      } else if (!slideDeckContentUpdatedError) {
        req.flash('status', 'Slide Deck Content updated.');
        res.redirect('/admin/slides/' + req.params.slideDeck); 
      } 
    }
  );

  app.get('/admin/user', userManager.isLoggedIn, function(req, res) {
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
    userManager.isLoggedIn,
    bruteforce.prevent,
    function(req, res) {
      var userUpdatedError = userManager.updateUser(users, req.user, req.body, baseDir);

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
      configManager.updateConfig(config, req.body, baseDir);
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