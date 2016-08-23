var express = require('express');
var router = express.Router();
var middleware = require('../middleware/index');
var User = require('../models/user');

// INDEX
router.get('/api/users', function(req, res) {
    User.find({name: {$regex: req.query.search}}).skip(req.query.skip).limit(20).exec(function(err, namedUsers) {
        if(err) {
            middleware.handleError(res, err.message, 'Failed to retrieve users');
        } else {
            if(namedUsers.length <= 0) {
                User.find({steamId: req.query.search}).limit(20).exec(function(err, steamIdUsers) {
                    if(err) {
                        middleware.handleError(res, err.message, 'Failed to retrieve users');
                    } else {
                        res.status(200).json(steamIdUsers);
                    }
                });
            } else {
                res.status(200).json(namedUsers);
            }
        }
    });
});

// SHOW
router.get('/api/user/:userId', function(req, res) {
    User.findById(req.params.userId, function(err, user) {
        if(err) {
            middleware.handleError(res, err.message, 'Failed to retrieve user\'s information');
        } else {
            res.status(200).json(user);
        }
    })
});

// UPDATE
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

// Online Users sidenav
router.get('/api/loggedInUsers', function(req, res) {
    User.find({onlineStatus: {$ne: 'Offline'}}, function(err, users) {
        if(err) {
            middleware.handleError(res, err.message, 'Failed to retrieve online users');
        } else {
            res.status(200).json(users);
        }
    });
});

// Count Users
router.get('/api/users/count', function(req, res) {
    User.find({name: {$regex: req.query.search}}).count().exec(function(err, numNamedUsers) {
        if(err) {
            middleware.handleError(res, err.message, 'Failed to retrieve users');
        } else {
            if(numNamedUsers <= 0) {
                User.find({steamId: req.query.search}).count().exec(function(err, numSteamIdUsers) {
                    if(err) {
                        middleware.handleError(res, err.message, 'Failed to retrieve users');
                    } else {
                        res.status(200).json(numSteamIdUsers);
                    }
                });
            } else {
                res.status(200).json(numNamedUsers);
            }
        }
    });
});

module.exports = router;