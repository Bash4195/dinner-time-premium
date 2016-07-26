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
        // TODO: Update user info when they log in
        User.findByIdAndUpdate(req.user._id, {onlineStatus: 'Online'}, function(err, user) {
            if(err) {
                middleware.handleError(res, err.message, 'Something went wrong while logging in. Please try again.')
            } else {
                res.redirect(req.session.returnTo || '/');
                delete req.session.returnTo;
            }
        });
    });

router.get('/auth/logout', middleware.isLoggedIn, function(req, res) {
    User.findByIdAndUpdate(req.user._id, {onlineStatus: 'Offline'}, function(err, user) {
        if(err) {
            middleware.handleError(res, err.message, 'Something went wrong while logging out. Please try again.')
        } else {
            req.logout();
            res.redirect('back');
        }
    });
});

// Return current user to Angular
router.get('/auth/getLoggedInUser', function(req, res) {
    res.status(200).json(req.user);
});

module.exports = router;