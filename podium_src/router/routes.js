/**
 * This file maps callbacks to specific routes
 */

var Promise = require('bluebird'),
    fileSystem = Promise.promisifyAll(require('fs-extra')),
    ExpressBrute = require('express-brute'),
    store = new ExpressBrute.MemoryStore(),
    passport = require('passport'),
    bruteforce = new ExpressBrute(store);

module.exports = function(app, config, userRoles, users, slides, baseDir) {
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
        userRoles: userRoles,
        user: req.user,
        slides: publishedSlides,
        error: routeVars.error,
        status: routeVars.status
      }
    );
  });

  // Front controller for all other routing
  app.get('/*', function (req, res) {
    // everything else is assumed to be a slide deck
    // 404's handled in deckRoute()
    var routeVars = router.setRouteVars(req);

    router.deckRoute(req, res, slides, baseDir, config, routeVars);
  });
};