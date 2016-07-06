var express = require('express');
var router = express.Router();
var passport = require('passport');

router.get('/auth/steam',
    passport.authenticate('steam', { failureRedirect: '/' }),
    function(req, res) {
        res.redirect('/');
    });

router.get('/auth/steam/return',
    passport.authenticate('steam', {failureRedirect: '/'}),
    function(req, res) {
        res.redirect('/');
    });

router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('back');
});

module.exports = router;