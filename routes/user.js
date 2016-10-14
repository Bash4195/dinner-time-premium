var express = require('express');
var router = express.Router();
var middleware = require('../middleware/index');
var User = require('../models/user');
var defaultPermissions = require('../helper/defaultPermissions');

// INDEX
router.get('/api/users', function(req, res) {
    req.query.skip = Number(req.query.skip);
    User.find({name: {$regex: req.query.search, $options: 'i'}}).limit(101).skip(req.query.skip).exec(function(err, namedUsers) {// .skip(req.query.skip).limit(100).exec(function(err, namedUsers) { // Pagination
        if(err) {
            middleware.handleError(res, err.message, 'Failed to retrieve users');
        } else {
            var response = {
                canLoadMore: false,
                users: namedUsers
            };
            if(namedUsers.length <= 0) {
                User.find({steamId: req.query.search}).limit(101).skip(req.query.skip).exec(function(err, steamIdUsers) {// .skip(req.query.skip).limit(100).exec(function(err, steamIdUsers) { // Pagination
                    if(err) {
                        middleware.handleError(res, err.message, 'Failed to retrieve users');
                    } else {
                        response.users = steamIdUsers;
                        if(steamIdUsers.length > 100) {
                            response.users.pop();
                            response.canLoadMore = true;
                            res.status(200).json(response);
                        } else {
                            res.status(200).json(response);
                        }
                    }
                });
            } else {
                if(namedUsers.length > 100) {
                    response.users.pop();
                    response.canLoadMore = true;
                    res.status(200).json(response);
                } else {
                    res.status(200).json(response);
                }
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
    req.body.roles = middleware.setRoles(req.body.rank, req.body.roles);
    if(req.query.setDefaultPermissions === 'true') {
        switch(req.body.rank) {
            case 'GOD':
                req.body.permissions = defaultPermissions.GOD;
                break;
            case 'GODDESS':
                req.body.permissions = defaultPermissions.GODDESS;
                break;
            case 'Seraph':
                req.body.permissions = defaultPermissions.Seraph;
                break;
            case 'Lord':
                req.body.permissions = defaultPermissions.Lord;
                break;
            case 'Admin':
                req.body.permissions = defaultPermissions.Admin;
                break;
            case 'Moderator':
                req.body.permissions = defaultPermissions.Moderator;
                break;
            case 'Aristocrat':
                req.body.permissions = defaultPermissions.Aristocrat;
                break;
            case 'VIP':
                req.body.permissions = defaultPermissions.VIP;
                break;
            case 'Donator':
                req.body.permissions = defaultPermissions.Donator;
                break;
            case 'User':
                req.body.permissions = defaultPermissions.User;
                break;
        }
    }
    User.findByIdAndUpdate(req.params.userId, req.body, {new: true}, function(err, user) {
        if(err) {
            middleware.handleError(res, err.message, 'Failed to update user permissions');
        } else {
            res.status(204).end('Updated user permissions');
        }
    });
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

// Pagination
// Count Users
// router.get('/api/users/count', function(req, res) {
//     User.find({name: {$regex: req.query.search}}).count().exec(function(err, numNamedUsers) {
//         if(err) {
//             middleware.handleError(res, err.message, 'Failed to retrieve users');
//         } else {
//             if(numNamedUsers <= 0) {
//                 User.find({steamId: req.query.search}).count().exec(function(err, numSteamIdUsers) {
//                     if(err) {
//                         middleware.handleError(res, err.message, 'Failed to retrieve users');
//                     } else {
//                         res.status(200).json(numSteamIdUsers);
//                     }
//                 });
//             } else {
//                 res.status(200).json(numNamedUsers);
//             }
//         }
//     });
// });

module.exports = router;