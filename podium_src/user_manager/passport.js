/**
 * This file contains the passport js functions.
 */

var LocalStrategy = require('passport-local').Strategy,
    bcrypt = require('bcryptjs');

module.exports = function(passport, users, baseDir) {
  var userManager = require(baseDir + '/podium_src/user_manager');
  
  // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
      done(null, user.id);
    });

  // used to deserialize the user
    passport.deserializeUser(function(id, done) {
      done(null, users[id]);
    });

  passport.use(new LocalStrategy(
    function(username, password, done) {
      userManager.findByUsername(username, users, function(err, user) {
        var passwordCorrect = false;

        if (err) { 
          return done(err);
        }

        if (!user) { 
          return done(null, false);
        }

        passwordCorrect = bcrypt.compareSync(password, user.password);

        if (!passwordCorrect) {
          return done(null, false);
        }

        return done(null, user);
      });
    }
  ));
};