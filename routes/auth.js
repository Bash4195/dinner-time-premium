var express = require('express');
var router = express.Router();
var passport = require('passport');
var middleware = require('../middleware/index');
var User = require('../models/user');

router.get('/auth/steam', middleware.saveSessionPath, passport.authenticate('steam', { failureRedirect: '/' }),
    function(req, res) {
        // Never called - redirects to Steam
    });

router.get('/auth/steam/return',
    passport.authenticate('steam', {failureRedirect: '/'}),
    function(req, res) {
        res.redirect(req.session.returnTo || '/');
        delete req.session.returnTo;
    });

router.get('/auth/logout', middleware.isLoggedIn, function(req, res) {
    User.findByIdAndUpdate(req.user._id, {onlineStatus: 'Offline'}, function(err, user) {
        if(err) {
            middleware.handleError(res, err.message, 'Failed to logout')
        } else {
            req.logout();
            res.redirect('back');
        }
    });
});

// Return current user to Angular
// Route not protected by loggedIn middleware because
// when a user first joins, they would see an error
router.get('/auth/getCurrentUser', function(req, res) {
    res.status(200).json(req.user);
});

module.exports = router;