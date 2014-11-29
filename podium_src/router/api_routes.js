/**
 * This file maps callbacks to admin routes
 */

var Promise = require('bluebird'),
    fileSystem = Promise.promisifyAll(require('fs-extra')),
    ExpressBrute = require('express-brute'),
    store = new ExpressBrute.MemoryStore(),
    passport = require('passport'),
    bruteforce = new ExpressBrute(store),
    bcrypt = require('bcryptjs');

module.exports = function(app, config, userRoles, users, slides, baseDir) {
  var userManager = require(baseDir + '/podium_src/user_manager'),
      configManager = require(baseDir + '/podium_src/config_manager'),
      permissionsManager = require(baseDir + '/podium_src/user_manager/permissions_manager'),
      router = require(baseDir + '/podium_src/router');

  app.get('/api', function(req, res) {
      
    res.json({
      Hola: 'buddy. Check out the list of resources for this api.',
      resources: {
        'public': {
          '/login': {
            'post': 'Post login credentials, returns user data or unauthorized.'
          },
          '/user-roles': {
            'get': 'Returns the user roles and permissions.'
          }
        }, 
        'protected': {
          '/user': {
            '/userid': {
              'get': 'Returns the user data based on the user id, or not found.'
            }
          }
        }
      }
    });

    return;
  });

  //app.post('/api/login', bruteforce.prevent, function(req, res) {
  app.post('/api/login', function(req, res) {
    var user = null,
        passwordCorrect = false,
        responseStatus = 401;
        responseObject = {
          authenticated: false
        };

    if (req.body.username && req.body.password) {
      user = userManager.findByName(req.body.username, users);

      if(user) {
        passwordCorrect = bcrypt.compareSync(req.body.password, user.password);
        

        if(passwordCorrect) {
          responseStatus = 200;
          responseObject.authenticated = true;
          responseObject.user = {
            id: user.id,
            username: user.username,
            roleName: user.role,
            tokenString: userManager.createJWT(config, user)
          };
        }
      }
    } 

    res.statusCode = responseStatus;
    res.json(responseObject);

    return;

  });

  app.param('userid', function (req, res, next, userid) {
    if(userid) {
      req.userid = userid;
    }

    next();
  });

  app.get('/api/user/:userid', userManager.checkJWT, function(req, res) {
    if(users[req.userid]) {
      res.json({
        id: users[req.userid].id,
        username: users[req.userid].username,
        roleName: users[req.userid].role,
        // Reuse token??
        tokenString: userManager.createJWT(config, users[req.userid])
      });  
    } else {
      res.statusCode = 404;
      res.json({error: "User not found."});
    }

    return;
  });

  // This should probably be protected by token
  app.get('/api/user-roles', function(req, res) {
      
    res.json(userRoles);

    return;
  });
};