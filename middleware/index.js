var middleware = {};

middleware.handleError = function(res, reason, message, code) {
    console.log('ERROR: ' + reason);
    res.status(code || 500).json({'error': message});
};

middleware.isLoggedIn = function(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    } else {
        middleware.handleError(res, 'User is not logged in', 'You must be logged in to do that', 401);
    }
};

module.exports = middleware;