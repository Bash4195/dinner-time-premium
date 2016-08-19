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

router.put('/api/user/:userId', middleware.isLoggedIn, function(req, res) {
    User.findByIdAndUpdate(req.params.userId, req.body, function(err, user) {
        if(err) {
            middleware.handleError(res, err.message, 'Failed to update user');
        } else {
            res.status(204).end('Updated user');
        }
    })
});

// Same as user update route but checks that the user is part of the Super Admin role to be able to update permissions
router.put('/api/user/:userId/updatePermissions', middleware.isLoggedIn, middleware.isSuperAdmin, function(req, res) {
    if(req.body.rank !== req.user.rank) {
        req.body.roles = middleware.setRoles(req.body.rank, req.body.roles);
    }
    User.findByIdAndUpdate(req.params.userId, req.body, {new: true}, function(err, user) {
        if(err) {
            middleware.handleError(res, err.message, 'Failed to update user permissions');
        } else {
            req.user = user;
            req.logIn(req.user, function(err) {
                if (err) {
                    req.logout();
                    middleware.handleError(res, err.message, 'Something went wrong, please login again');
                }
            });
            res.status(204).end('Updated user permissions');
        }
    })
});

module.exports = router;