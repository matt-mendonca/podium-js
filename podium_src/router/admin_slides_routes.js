/**
 * This file maps callbacks to slide deck admin routes
 */

var Promise = require('bluebird'),
    fileSystem = Promise.promisifyAll(require('fs-extra')),
    ExpressBrute = require('express-brute'),
    store = new ExpressBrute.MemoryStore(),
    passport = require('passport'),
    bruteforce = new ExpressBrute(store);

module.exports = function(app, config, users, slides, baseDir) {
  var slidesManager = require(baseDir + '/podium_src/slides_manager'),
      router = require(baseDir + '/podium_src/router');

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
      'create_slide_deck',
      {
        title: 'Create New Slide Deck',
        loggedIn: routeVars.loggedIn,
        breadcrumbs: routeVars.breadcrumbs,
        config: config,
        slides: slides,
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
      var slideDeckCreated = slidesManager.createSlideDeck(slides, req.body, baseDir),
          templateDeckLocation = '',
          newDeckLocation = '';

      if(slideDeckCreated.message === 'emptyFields') {
        req.flash('error', 'All fields need to be filled out.');
        res.redirect('/admin/slides/create-new-slide-deck');  
      } else if(slideDeckCreated.message === 'routeTaken') {
        req.flash('error', 'Route is taken.');
        res.redirect('/admin/slides/create-new-slide-deck'); 
      } else if (!slideDeckCreated.message) {
        templateDeckLocation = slides[slideDeckCreated.slideInfo.templateDeck].location,
        slides[slideDeckCreated.slideInfo.route] = slideDeckCreated.slideInfo;

        newDeckLocation = '/slides' + slideDeckCreated.slideInfo.route + '/';

        fileSystem.copyAsync(baseDir + templateDeckLocation, baseDir + newDeckLocation).then(function() {
          fileSystem.writeJsonAsync(baseDir + newDeckLocation + 'podium.json', slideDeckCreated.slideInfo).then(function() {
            slides[slideDeckCreated.slideInfo.route].location = newDeckLocation;
            slides[slideDeckCreated.slideInfo.route].indexh = 0;  
            slides[slideDeckCreated.slideInfo.route].indexv = 0;
            slides[slideDeckCreated.slideInfo.route].overview = false;

            req.flash('status', 'Slide Deck created.');
            res.redirect('/admin/slides' + req.body.route);
          });
        });
      } 
    }
  );

  app.get('/admin/slides/:slideDeck', userManager.isLoggedIn, function(req, res) {
    var routeVars = router.setRouteVars(req);

    if(req.slideDeck) {
      res.render(
        'edit_slide_deck',
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
      var slideDeckUpdated = slidesManager.updateSlideDeck(slides, req.slideDeck, req.body, baseDir);

      if(slideDeckUpdated.message === 'emptyFields') {
        req.flash('error', 'All fields need to be filled out.');
        res.redirect('/admin/slides/' + req.params.slideDeck);  
      } else if(slideDeckUpdated.message === 'routeTaken') {
        req.flash('error', 'Route is taken.');
        res.redirect('/admin/slides/' + req.params.slideDeck); 
      } else if (!slideDeckUpdated.message) {
        slides[slideDeckUpdated.currentSlideInfo.route] = slideDeckUpdated.currentSlideInfo;
        
        // Writing to file using updatedSlideInfo since it doesn't have properties set by the server (e.g. filesystem location)
        // Strictly meta / config
        fileSystem.writeJsonAsync(baseDir + slideDeckUpdated.currentSlideInfo.location + 'podium.json', slideDeckUpdated.updatedSlideInfo).then(function() {
          req.flash('status', 'Slide Deck updated.');
          res.redirect('/admin/slides');   
        });
      } 
    }
  );

  app.post('/admin/slides/:slideDeck/update-content',
    userManager.isLoggedIn,
    bruteforce.prevent,
    function(req, res) {
      fileSystem.readFileAsync(baseDir + req.slideDeck.location + 'index.html').then(function(currentSlideContent) {
        var slideDeckContentUpdated = slidesManager.updateSlideDeckContent(config, slides, req.slideDeck, currentSlideContent, req.body.slidesMarkup, baseDir);

        fileSystem.writeFileAsync(baseDir + req.slideDeck.location + 'index.html', slideDeckContentUpdated).then(function() {
          req.flash('status', 'Slide Deck Content updated.');
          res.redirect('/admin/slides/' + req.params.slideDeck); 
        });
      });
    }
  );

  app.get('/admin/slides/:slideDeck/delete', userManager.isLoggedIn, function(req, res) {
    delete slides[req.slideDeck.route];

    fileSystem.removeAsync(baseDir + req.slideDeck.location).then(function() {
      req.flash('status', 'Slide Deck deleted.');
      res.redirect('/admin/slides'); 
    });
  });
};