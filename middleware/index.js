var middleware = {};

middleware.handleError = function(res, reason, message, code) {
    console.log('ERROR: ' + reason);
    console.log('Message: ' + message);
    res.status(code || 500).json({'error': message});
};

middleware.isLoggedIn = function(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    } else {
        middleware.handleError(res, 'User is not logged in', 'You must be logged in to do that', 401);
    }
};

middleware.saveSessionPath = function(req, res, next) {
    req.session.returnTo = req.header('Referer');
    next();
};

middleware.checkIfMissing = function(param) {
    if(param === '' || param === 'undefined') { return true; } else { return false; }
};

module.exports = middleware;