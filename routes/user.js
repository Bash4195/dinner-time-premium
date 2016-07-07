var express = require('express');
var router = express.Router();
var passport = require('passport');
var handleError = require('../middleware/handleError');
var User = require('../models/user');

router.get('/auth/steam',
    passport.authenticate('steam', { failureRedirect: '/' }),
    function(req, res) {
        // Never called - redirects to Steam
    });

router.get('/auth/steam/return',
    passport.authenticate('steam', {failureRedirect: '/'}),
    function(req, res) {
        User.findByIdAndUpdate(req.user._id, {isOnline: true}, function(err, user) {
            if(err) {
                handleError(res, err.message, 'Something went wrong while logging in. Please try again.')
            } else {
                res.redirect('/');
            }
        });
    });

router.get('/logout', function(req, res) {
    User.findByIdAndUpdate(req.user._id, {isOnline: false}, function(err, user) {
        if(err) {
            handleError(res, err.message, 'Something went wrong while logging out. Please try again.')
        } else {
            req.logout();
            res.redirect('back');
        }
    });
});

router.get('/getUser', function(req, res) {
    res.status(200).json(req.user);
});

module.exports = router;