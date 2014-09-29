/**
 * This file maps callbacks to user admin routes
 */

var Promise = require('bluebird'),
    fileSystem = Promise.promisifyAll(require('fs-extra')),
    bcrypt = Promise.promisifyAll(require('bcryptjs'));
    ExpressBrute = require('express-brute'),
    store = new ExpressBrute.MemoryStore(),
    passport = require('passport'),
    bruteforce = new ExpressBrute(store);

module.exports = function(app, config, users, slides, baseDir) {
  var userManager = require(baseDir + '/podium_src/user_manager'),
      router = require(baseDir + '/podium_src/router');

  app.get('/admin/user', userManager.isLoggedIn, function(req, res) {
    var routeVars = router.setRouteVars(req);

    res.render(
      'my_account',
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
      bcrypt.compareAsync(req.body.currentPassword, req.user.password).then(function(passwordCorrect) {
        var userUpdated = null;

        if(!passwordCorrect) {
          req.flash('error', 'Wrong current password.');
          res.redirect('/admin/user'); 

          return null;
        }

        userUpdated = userManager.updateUser(users, req.user, req.body, baseDir);

        if(userUpdated.message === 'usernameTaken') {
          req.flash('error', 'Username is taken.');
          res.redirect('/admin/user');  
        } else if (!userUpdated.message) {
          users = userUpdated.users;

          fileSystem.writeJsonAsync(baseDir + '/config/users.json', users).then(function() {
            req.flash('status', 'User account updated.');
            res.redirect('/admin');  
          });
        } 
      });
    }
  );

  app.get('/admin/user-account', userManager.isLoggedIn, function(req, res) {
    res.redirect('/admin/users'); 
  });

  app.get('/admin/user-account/create', userManager.isLoggedIn, function(req, res) {
    var routeVars = router.setRouteVars(req);
    
    res.render(
      'create_user',
      {
        title: 'Create New User Account',
        loggedIn: routeVars.loggedIn,
        breadcrumbs: routeVars.breadcrumbs,
        username: '',
        error: routeVars.error,
        status: routeVars.status
      }
    );  
  });

  app.post('/admin/user-account/create',
    userManager.isLoggedIn,
    bruteforce.prevent,
    function(req, res) {
      var userCreated = userManager.createUser(users, req.body, baseDir);

      if(userCreated.message === 'usernameTaken') {
        req.flash('error', 'Username is taken.');
        res.redirect('/admin/user-account/create');  
      } else if(userCreated.message === 'passwordMatch') {
        req.flash('error', 'The passwords must match.');
        res.redirect('/admin/user-account/create');  
      } else if (!userCreated.message) {
        users = userCreated.users;

        fileSystem.writeJsonAsync(baseDir + '/config/users.json', users).then(function() {
          req.flash('status', 'User account created.');
          res.redirect('/admin/users');  
        });
      }
    }
  );

  app.get('/admin/users', userManager.isLoggedIn, function(req, res) {
    var routeVars = router.setRouteVars(req);

    res.render(
      'users',
      {
        title: 'User Accounts',
        loggedIn: routeVars.loggedIn,
        users: users,
        breadcrumbs: routeVars.breadcrumbs,
        error: routeVars.error,
        status: routeVars.status
      }
    );
  });

  app.param('username', function (req, res, next, username) {
    var user = userManager.findByUsername(username, users, function(err, user) { return user });

    if(user) {
      req.userAccount = user;
    }

    next();
  });

  app.get('/admin/users/:username', userManager.isLoggedIn, function(req, res) {
    var routeVars = router.setRouteVars(req);

    if(req.userAccount.id === req.user.id) {
      res.redirect('/admin/user'); 
    } else if(req.userAccount) {
      res.render(
        'edit_user',
        {
          title: req.userAccount.username,
          loggedIn: routeVars.loggedIn,
          breadcrumbs: routeVars.breadcrumbs,
          username: req.userAccount.username,
          error: routeVars.error,
          status: routeVars.status
        }
      );  
    } else {
      req.flash('error', 'User not found.');
      res.redirect('/admin/users');  
    }
  });

  app.post('/admin/users/:username',
    userManager.isLoggedIn,
    bruteforce.prevent,
    function(req, res) {
      bcrypt.compareAsync(req.body.currentPassword, req.user.password).then(function(passwordCorrect) {
        var userUpdated = null;

        if(!passwordCorrect) {
          req.flash('error', 'Your password is wrong.');
          res.redirect('/admin/users/' + req.userAccount.username); 

          return null;
        }

        user = userManager.findByUsername(req.userAccount.username, users, function(err, user) { return user });

        if(!user) {
          req.flash('error', 'Error updating account.');
          res.redirect('/admin/users/' + req.userAccount.username); 

          return null;
        }

        userUpdated = userManager.updateUser(users, users[user.id], req.body, baseDir);

        if(userUpdated.message === 'usernameTaken') {
          req.flash('error', 'Username is taken.');
          res.redirect('/admin/users/' + req.userAccount.username); 
        } else if (!userUpdated.message) {
          users = userUpdated.users;

          fileSystem.writeJsonAsync(baseDir + '/config/users.json', users).then(function() {
            req.flash('status', 'User account updated.');
            res.redirect('/admin/users');  
          });
        } 
      });
    }
  );
  
  app.post('/admin/users/:username/delete', userManager.isLoggedIn, function(req, res) {
    bcrypt.compareAsync(req.body.currentPassword, req.user.password).then(function(passwordCorrect) {
      if(!passwordCorrect) {
        req.flash('error', 'Your password is wrong.');
        res.redirect('/admin/users/' + req.userAccount.username); 

        return null;
      } else if(req.userAccount.id === req.user.id) {
        req.flash('status', 'You can\'t delete your own account.');
        res.redirect('/admin/user'); 
      } else {
        delete users[req.userAccount.id];

        fileSystem.writeJsonAsync(baseDir + '/config/users.json', users).then(function() {
          req.flash('status', 'User account deleted.');
          res.redirect('/admin/users'); 
        });
      } 
    });
  });
};