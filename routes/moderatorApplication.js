var express = require('express');
var router = express.Router();
var middleware = require('../middleware/index');
var User = require('../models/user');
var ModApp = require('../models/moderatorApplication');
var ModAppComment = require('../models/moderatorApplicationComment');

// Client routes
// Using User ID as parameter to add links easier

// CREATE
router.post('/api/apply', middleware.isLoggedIn, function(req, res) {
    if(middleware.hasPermission(req.user, 'general', 'canApplyToMod')) {
        var newApp = req.body;
        newApp.authour = req.user;
        newApp.status = 'Under Review';
        if(newApp.ulxExperience === '' || newApp.ulxExperience === 'undefined') {
            middleware.handleError(res, 'Mod application field "ULX Experience" is missing', 'ULX Experience field is missing', 400);
        } else if(newApp.leadershipExperience === '' || newApp.leadershipExperience === 'undefined') {
            middleware.handleError(res, 'Mod application field "Leadership Experience" is missing', 'Leadership Experience field is missing', 400);
        } else if(newApp.gmodLeadershipExperience === '' || newApp.gmodLeadershipExperience === 'undefined') {
            middleware.handleError(res, 'Mod application field "Garry\'s Mod Leadership Experience" is missing', 'Garry\'s Mod Leadership Experience field is missing', 400);
        } else if(newApp.willingToAddUsOnSteam === '' || newApp.willingToAddUsOnSteam === 'undefined') {
            middleware.handleError(res, 'Mod application field "Willing to add us on Steam" is missing', 'Willing to add us on Steam field is missing', 400);
        } else if(newApp.whyWeShouldAccept === '' || newApp.whyWeShouldAccept === 'undefined') {
            middleware.handleError(res, 'Mod application field "Why We Should Accept You" is missing', 'Why We Should Accept You field is missing', 400);
        } else {
            User.findByIdAndUpdate(req.user._id, {'permissions.general.canApplyToMod': false}, function(err, user) {
                if(err) {
                    middleware.handleError(res, err.message, 'Failed to create moderator application');
                } else {
                    ModApp.create(newApp, function(err, app) {
                        if(err) {
                            middleware.handleError(res, err.message, 'Failed to create moderator application');
                        } else {
                            user.modApplication = app._id;
                            user.save();
                            res.status(201).json(app);
                        }
                    });
                }
            });
        }
    } else {
        middleware.handleError(res, 'Unauthorized request', 'You don\'t have permission to do that', 401);
    }
});

// SHOW
router.get('/api/application/:appId', middleware.isLoggedIn, function(req, res) {
    ModApp.findById(req.params.appId).populate('authour').exec(function(err, app) {
        if(err) {
            middleware.handleError(res, err.message, 'Failed to retrieve moderator application');
        } else {
            if(app) {
                // Have to stringify this as it's looking at these two values as objects for whatever reason
                if(JSON.stringify(app.authour._id) == JSON.stringify(req.user._id) || req.user.roles.includes('Staff')) {
                    res.status(200).json(app);
                } else {
                    middleware.handleError(res, 'Unauthorized request', 'You don\'t have permission to do that', 401);
                }
            } else {
                middleware.handleError(res, 'Failed to retrieve moderator application', 'Something went wrong while processing your request');
            }
        }
    })
});

// Admin routes
// Using app ID like a proper application should!

// INDEX
router.get('/api/admin/applications', middleware.isLoggedIn, middleware.isStaff, function(req, res) {
    ModApp.find({}).count().exec(function(err, numApps) {
        ModApp.find({}).populate('authour').skip(req.query.skip).limit(20).sort({createdAt: -1}).exec(function(err, apps) {
            if(err) {
                middleware.handleError(res, err.message, 'Failed to retrieve application');
            } else {
                var data = {
                    count: numApps,
                    apps: apps
                };
                res.status(200).json(data);
            }
        });
    });
});

// SHOW
router.get('/api/admin/application/:appId', middleware.isLoggedIn, middleware.isStaff, function(req, res) {
    ModApp.findById(req.params.appId).populate('authour review.reviewedBy votes.voter').exec(function(err, app) {
        if(err) {
            middleware.handleError(res, err.message, 'Failed to retrieve moderator application');
        } else {
            res.status(200).json(app);
        }
    })
});

// UPDATE
router.put('/api/admin/application/:appId', middleware.isLoggedIn, middleware.isStaff, function(req, res) {
    var editedApp = req.body;
    ModApp.findByIdAndUpdate(req.params.appId, editedApp, function(err, app) {
        if(err) {
            middleware.handleError(res, err.message, 'Failed to update application');
        } else {
            res.status(204).end('Updated application')
        }
    });
});

// DELETE
router.delete('/api/admin/application/:appId', middleware.isLoggedIn, middleware.isSuperAdmin, function(req, res) {
    if(req.user.rank === 'GOD' || req.user.rank === 'GODDESS' || req.user.rank === 'Seraph') {
        ModApp.findById(req.params.appId, function(err, app) {
            if(err) {
                middleware.handleError(res, err.message, 'Failed to delete moderator application');
            } else {
                app.comments.forEach(function(comment) {
                    ModAppComment.findByIdAndRemove(comment, function(err) {
                        if(err) {
                            middleware.handleError(res, err.message, 'Failed to delete the comments associated with this application');
                        }
                    })
                });
                User.findByIdAndUpdate(app.authour, {$unset: {modApplication: 1 }}, function(err, user) {
                    if(err) {
                        middleware.handleError(res, err.message, 'Failed to delete moderator application');
                    } else {
                        ModApp.findByIdAndRemove(app._id, function(err) {
                            if(err) {
                                middleware.handleError(res, err.message, 'Failed to delete moderator application');
                            } else {
                                res.status(204).end('Deleted moderator application');
                            }
                        });
                    }
                });
            }
        })
    } else {
        middleware.handleError(res, 'Unauthorized request', 'You don\'t have permission to do that', 401);
    }
});

// Vote
router.put('/api/admin/application/:appId/vote', middleware.isLoggedIn, middleware.isSuperAdmin, function(req, res) {
    if(req.user.rank === 'GOD' || req.user.rank === 'GODDESS' || req.user.rank === 'Seraph') {
        var vote = req.body;
        ModApp.findById(req.params.appId, function(err, app) {
            if(err) {
                middleware.handleError(res, err.message, 'Failed to update application');
            } else {
                if(app.votes.length < 3) {
                    // If they have voted, they are changing their vote so lets remove their previous vote.
                    app.votes.forEach(function(val, i) {
                        if(JSON.stringify(val.voter) == JSON.stringify(req.user._id)) {
                            app.votes.splice(i, 1);
                        }
                    });

                    // Push vote (new or updated)
                    app.votes.push(vote);
                    
                    // Check if all 3 votes have been placed. If so, update status to say if they have been accepted or rejected
                    if(app.votes.length >= 2) {
                        var yesVotes = 0;
                        app.votes.forEach(function(val, i) {
                            if(val.vote) {
                                yesVotes++;
                            }
                        });
                        
                        if(yesVotes >= 2) {
                            app.status = 'Accepted';
                            app.closed = true;
                        } else if(app.votes.length == 3 && yesVotes < 2) {
                            app.status = 'Rejected';
                            app.closed = true;
                        }
                    }
                    
                    app.save();
                    res.status(204).end('Vote successfully placed');
                } else {
                    middleware.handleError(res, 'Max votes reached (3)', 'There are already 3 votes on this application', 400);
                }
            }
        });
    } else {
        middleware.handleError(res, 'Unauthorized request', 'You don\'t have permission to do that', 401);
    }
});

// Comments

// INDEX
router.get('/api/admin/application/:appId/comments', function(req, res) {
    ModApp.findById(req.params.appId)
        .populate({path: 'comments', populate: {path: 'authour editedBy'}, options: {skip: req.query.skip, limit: 20, sort: {createdAt: 1}}}).exec(function(err, appWithComments) {
        if(err) {
            middleware.handleError(res, err.message, 'Failed to retrieve comments');
        } else {
            res.status(200).json(appWithComments);
        }
    });
});

// CREATE
router.post('/api/admin/application/:appId', middleware.isLoggedIn, middleware.isStaff, function(req, res) {
    var newComment = req.body;
    if(newComment.comment === '' || newComment.comment === 'undefined') {
        middleware.handleError(res, 'Mod application comment missing comment text', 'Comment text is missing or sent improperly', 400);
    } else if(newComment.authour === '' || newComment.authour === 'undefined' || newComment.authour._id != req.user._id) {
        middleware.handleError(res, 'Comment authour is missing', 'Authour is missing', 400);
    } else {
        ModApp.findById(req.params.appId, function(err, app) {
            if(err) {
                middleware.handleError(res, err.message, 'Failed to create comment');
            } else {
                newComment.mod_app = app._id;
                ModAppComment.create(newComment, function(err, comment) {
                    if(err) {
                        middleware.handleError(res, err.message, 'Failed to create comment');
                    } else {
                        app.comments.push(comment);
                        app.save();
                        res.status(201).json(comment);
                    }
                });
            }
        });
    }
});

// UPDATE
router.put('/api/admin/application/:appId/:commentId', middleware.isLoggedIn, middleware.isStaff, function(req, res) {
    var editedComment = req.body;
    if(editedComment.comment === '' || editedComment.comment === 'undefined') {
        middleware.handleError(res, 'Comment content is missing', 'Comment content is missing', 400);
    } else if(editedComment.comment === '' || editedComment.comment === 'undefined') {
        middleware.handleError(res, 'Comment editor is missing', 'Comment editor is missing', 400);
    } else {
        ModAppComment.findByIdAndUpdate(req.params.commentId, editedComment, function(err, comment) {
            if(err) {
                middleware.handleError(res, err.message, 'Failed to update comment');
            } else {
                res.status(204).end('Updated comment')
            }
        });
    }
});

// DELETE
router.delete('/api/admin/application/:appId/:commentId', middleware.isLoggedIn, middleware.isStaff, function(req, res) {
    ModApp.findById(req.params.appId, function(err, app) {
        if(err) {
            middleware.handleError(res, err.message, 'Failed to delete comment');
        } else {
            var commentToRemove = app.comments.indexOf(req.params.commentId);
            app.comments.splice(commentToRemove, 1);
            app.save();
        }
    });
    ModAppComment.findByIdAndRemove(req.params.commentId, function(err) {
        if(err) {
            middleware.handleError(res, err.message, 'Failed to delete comment');
        } else {
            res.status(204).end('Deleted comment');
        }
    });
});

module.exports = router;