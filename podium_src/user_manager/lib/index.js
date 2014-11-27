/**
 * This file contains the functions related to authentication and user management.
 */

var jwt = require('jsonwebtoken'),
    Promise = require('bluebird'),
    bcrypt = Promise.promisifyAll(require('bcryptjs'));

module.exports = function() {
  var findByUsername = function(username, users, fn) {
      // Remove this function woth Passport?
        for (var userID in users) {
          var user = users[userID];
          if (user.username === username) {
            return fn(null, user);
          }
        }
        return fn(null, null);
      },

      findByName = function(username, users) {
        for (var userID in users) {
          var user = users[userID];
          if (user.username === username) {
            return user;
          }
        }
        return null;
      },

      isLoggedIn = function(req, res, next) {
        if (req.isAuthenticated()) {
          return next();
        }

        res.redirect('/login');
      },

      createUser = function(users, newUser, baseDir) {
        var usernameTaken = findByUsername(newUser.username, users, function(err, user) { return user });

        if(usernameTaken) {
          return {'message': 'usernameTaken'};
        }

        if(newUser.password && newUser.confirmPassword && (newUser.password === newUser.confirmPassword)) {
          password = bcrypt.hashSync(newUser.password, 8);
        } else {
          return {'message': 'passwordMatch'};
        }

        newUser.password = password;
        newUser.id = Object.keys(users).length + 1;

        delete newUser.confirmPassword

        users[newUser.id] = newUser;

        return {
          'message': null,
          'users': users
        };
      },

      updateUser = function(users, currentUser, updatedInfo, baseDir) {
        var newPassword = null,
            usernameTaken = findByUsername(updatedInfo.username, users, function(err, user) { return user });

        if (usernameTaken && updatedInfo.username !== currentUser.username) {
          return {'message': 'usernameTaken'};
        }

        if (updatedInfo.role) {
          users[currentUser.id].role = updatedInfo.role;
        } 

        if (updatedInfo.username || updatedInfo.newPassword) {

          if (updatedInfo.username) {
            users[currentUser.id].username = updatedInfo.username;
          }

          if (updatedInfo.newPassword && (updatedInfo.newPassword === updatedInfo.confirmNewPassword)) {
            newPassword = bcrypt.hashSync(updatedInfo.newPassword, 8);
            users[currentUser.id].password = newPassword;  
          }
          
          return {
            'message': null,
            'users': users
          };
        }
      },

      createJWT = function(config, user) {
        var profile = {
              id: user.id,
              name: user.username,
            };

        return jwt.sign(profile, config.jwtSecret, { expiresInMinutes: config.jwtExpireSeconds });
      },

      verifyJWT = function(config, data) {
        var verified = false;

        if(data && data.token) {
          jwt.verify(data.token, config.jwtSecret, function(err, decoded) {

            if(decoded) {
              verified = true;
            }
          });  
        }

        return verified;
      },


      // For use with ember - note that this returns JSON
      checkJWT = function(req, res, next) {
        var token = req.headers.authorization;

        if(token) {
          jwt.verify(token, config.jwtSecret, function(err, decoded) {

            if(decoded) {
              verified = true;
            }
          });  
        }

        if(verified) {
          next();
        } else {
          res.statusCode = 401;
          res.json({ authenticated: false });
        }

        return null;
      };

  return {
    findByUsername: findByUsername,
    findByName: findByName,
    isLoggedIn: isLoggedIn,
    createUser: createUser,
    updateUser: updateUser,
    createJWT: createJWT,
    verifyJWT: verifyJWT,
    checkJWT: checkJWT
  };
}();