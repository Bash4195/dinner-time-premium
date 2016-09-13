var middleware = {};

middleware.handleError = function(res, reason, message, code) {
    console.log('ERROR: ' + reason);
    console.log('Message: ' + message);
    res.status(code || 500).json({'error': message});
};

// User stuff
middleware.isLoggedIn = function(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    } else {
        middleware.handleError(res, 'User is not logged in', 'You must be logged in to do that', 401);
    }
};

middleware.hasPermission = function(user, permissionGroup, permission) {
    return user.permissions[permissionGroup][permission];
};

middleware.setRoles = function(rank, roles) {
    if(rank === 'GOD' || rank === 'GODDESS') {
        roles = ['User', 'Staff', 'Admin', 'Super Admin', 'Owner'];
        return roles;
    } else if(rank === 'Seraph' || rank === 'Lord') {
        roles = ['User', 'Staff', 'Admin', 'Super Admin'];
        return roles;
    } else if(rank === 'Admin') {
        roles = ['User', 'Staff', 'Admin'];
        return roles;
    } else if(rank === 'Moderator') {
        roles = ['User', 'Staff'];
        return roles;
    } else {
        roles = ['User'];
        return roles;
    }
};

middleware.isOwner = function(req, res, next) {
    if(req.user.roles.includes('Owner')) {
        return next();
    } else {
        middleware.handleError(res, 'User does not have permission to run this action', 'You do not have permission to do that', 401);
    }
};

middleware.isSuperAdmin = function(req, res, next) {
    if(req.user.roles.includes('Super Admin')) {
        return next();
    } else {
        middleware.handleError(res, 'User does not have permission to run this action', 'You do not have permission to do that', 401);
    }
};

middleware.isAdmin = function(req, res, next) {
    if(req.user.roles.includes('Admin')) {
        return next();
    } else {
        middleware.handleError(res, 'User does not have permission to run this action', 'You do not have permission to do that', 401);
    }
};

middleware.isStaff = function(req, res, next) {
    if(req.user.roles.includes('Staff')) {
        return next();
    } else {
        middleware.handleError(res, 'User does not have permission to run this action', 'You do not have permission to do that', 401);
    }
};

middleware.saveSessionPath = function(req, res, next) {
    req.session.returnTo = req.header('Referer');
    next();
};

middleware.canApplyToMod = function(req, res, next) {
    if(req.user.permissions.general.canApplyToMod) {
        return next();
    } else {
        middleware.handleError(res, 'User does not have permission to create a moderator application', 'You do not have permission to do that', 401);
    }
};

middleware.checkIfMissing = function(param) {
    if(param === '' || param === 'undefined') { return true; } else { return false; }
};

module.exports = middleware;