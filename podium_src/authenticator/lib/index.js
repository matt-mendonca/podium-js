/**
 * Module dependencies.
 */
var fileSystem = require('fs'),
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
            passwordCorrect = bcrypt.compareSync(updatedInfo.currentPassword, currentUser.password);

        if(!passwordCorrect) {
          return false;
        } else if(passwordCorrect && updatedInfo.newPassword && updatedInfo.newPassword === updatedInfo.confirmNewPassword) {
          newPassword = bcrypt.hashSync(updatedInfo.newPassword, 8);
          users[currentUser.id].password = newPassword;
          fileSystem.writeFileSync(baseDir + '/config/users.json', JSON.stringify(users));

          return true;
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