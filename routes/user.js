var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../models/user');

router.get('/auth/steam',
    passport.authenticate('steam', { failureRedirect: '/' }),
    function(req, res) {
        res.redirect('/');
    });

router.get('/auth/steam/return',
    passport.authenticate('steam', {failureRedirect: '/'}),
    function(req, res) {
        User.findByIdAndUpdate(req.user._id, {isOnline: true}, function(err, user) {
            if(err) {
                console.log(err);
            } else {
                res.redirect('/');
            }
        });
    });

router.get('/logout', function(req, res) {
    User.findByIdAndUpdate(req.user._id, {isOnline: false}, function(err, user) {
        if(err) {
            console.log(err);
        } else {
            req.logout();
            res.redirect('/');
        }
    });
});

router.get('/getUser', function(req, res) {
    res.status(200).json(req.user);
});

module.exports = router;