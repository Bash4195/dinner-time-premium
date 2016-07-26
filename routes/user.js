var express = require('express');
var router = express.Router();
var middleware = require('../middleware/index');
var User = require('../models/user');

router.get('/api/users', function(req, res) {
    User.find({}, function(err, users) {
        if(err) {
            middleware.handleError(res, err.message, 'Failed to retrieve users');
        } else {
            res.status(200).json(users);
        }
    });
});

router.get('/api/loggedInUsers', function(req, res) {
    User.find({onlineStatus: {$ne: 'Offline'}}, function(err, users) {
        if(err) {
            middleware.handleError(res, err.message, 'Failed to retrieve online users');
        } else {
            res.status(200).json(users);
        }
    });
});

router.get('/api/user/:userId', function(req, res) {
    User.findById(req.params.userId, function(err, user) {
        if(err) {
            middleware.handleError(res, err.message, 'Failed to retrieve user\'s information');
        } else {
            res.status(200).json(user);
        }
    })
});

// TODO: Protect this route!
router.put('/api/user/:userId', function(req, res) {
    User.findByIdAndUpdate(req.params.userId, req.body, function(err, user) {
        if(err) {
            middleware.handleError(res, err.message, 'Failed to update');
        } else {
            res.status(204).end('Updated user');
        }
    })
});

module.exports = router;