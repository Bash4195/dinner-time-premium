var express = require('express');
var router = express.Router();
var middleware = require('../middleware/index');
var User = require('../models/user');

router.get('/api/users', function(req, res) {
    // TODO: Return users
});

router.get('/api/user/:userId', function(req, res) {
    User.findById(req.params.userId, function(err, user) {
        if(err) {
            middleware.handleError(res, err.message, 'Failed to find user');
        } else {
            res.status(200).json(user);
        }
    })
});

module.exports = router;