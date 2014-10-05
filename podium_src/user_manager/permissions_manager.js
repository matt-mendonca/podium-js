module.exports = function(userRoles) {
  var checkPermission = function(permission) {
        return checkPermission[permission] || (checkPermission[permission] = function(req, res, next) {
          if(userRoles[req.user.role][permission]) {
            next();
          } else {
            req.flash('error', 'You are not authorized to access this.');
            res.redirect('/admin');
          }

          return null;
        });
      },

      getPermissionStatus = function(user, permission) {
        return !!userRoles[req.user.role][permission];
      };

  return {
    checkPermission: checkPermission,
    getPermissionStatus: getPermissionStatus
  };
}(userRoles);