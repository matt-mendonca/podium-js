/**
 * This file contains the functions related to authentication and user management.
 */

var fileSystem = require('fs-extra'),
    jwt = require('jsonwebtoken'),
    bcrypt = require('bcrypt');

module.exports = function() {
  var loadUsers = function(usersFilePath) {
        var usersFile = fileSystem.readFileSync(usersFilePath);
        return JSON.parse(usersFile);
      }

      findByUsername = function(username, users, fn) {
        for (var userID in users) {
          var user = users[userID];
          if (user.username === username) {
            return fn(null, user);
          }
        }
        return fn(null, null);
      },

      isLoggedIn = function(req, res, next) {
        if (req.isAuthenticated()) {
          return next();
        }

        res.redirect('/login');
      },

      updateUser = function(users, currentUser, updatedInfo, baseDir) {
        var newPassword = null,
            passwordCorrect = bcrypt.compareSync(updatedInfo.currentPassword, currentUser.password),
            usernameTaken = findByUsername(updatedInfo.username, users, function(err, user) { return user });

        if(!passwordCorrect) {
          return 'currentPassword';
        }

        if(usernameTaken && updatedInfo.username !== currentUser.username) {
          return 'usernameTaken';
        }

        if(updatedInfo.username || updatedInfo.newPassword) {

          if(updatedInfo.username) {
            users[currentUser.id].username = updatedInfo.username;
          }

          if(updatedInfo.newPassword && updatedInfo.newPassword === updatedInfo.confirmNewPassword) {
            newPassword = bcrypt.hashSync(updatedInfo.newPassword, 8);
            users[currentUser.id].password = newPassword;  
          }
          
          fileSystem.writeFileSync(baseDir + '/config/users.json', JSON.stringify(users));

          return null;
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
      };

  return {
    loadUsers: loadUsers,
    findByUsername: findByUsername,
    isLoggedIn: isLoggedIn,
    updateUser: updateUser,
    createJWT: createJWT,
    verifyJWT: verifyJWT
  };
}();