var express = require('express');
var router = express.Router();
var middleware = require('../middleware/index');
var User = require('../models/user');
var ModApp = require('../models/moderatorApplication');
var ModAppComment = require('../models/moderatorApplicationComment');

// Client routes
// Using User ID as parameter to add links easier

// CREATE
router.post('/api/apply/:userId', middleware.isLoggedIn, function(req, res) {
    if(middleware.hasPermission(req.user, 'general', 'canApplyToMod')) {
        var newApp = req.body;
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
        } else if(newApp.authour === '' || newApp.authour === 'undefined' || newApp.authour._id != req.params.userId) {
            middleware.handleError(res, 'Mod application authour is missing', 'Authour is missing', 400);
        } else {
            User.findByIdAndUpdate(req.params.userId, {'permissions.general.canApplyToMod': false}, function(err, user) {
                if(err) {
                    middleware.handleError(res, err.message, 'Failed to create moderator application');
                } else {
                    ModApp.create(newApp, function(err, app) {
                        if(err) {
                            middleware.handleError(res, err.message, 'Failed to create moderator application');
                        } else {
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
router.get('/api/application/:userId', middleware.isLoggedIn, function(req, res) {
    ModApp.findOne({authour: req.params.userId}).populate('authour').exec(function(err, app) {
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
    ModApp.findById(req.params.appId).populate('authour review votes').exec(function(err, app) {
        if(err) {
            middleware.handleError(res, err.message, 'Failed to retrieve moderator application');
        } else {
            res.status(200).json(app);
        }
    })
});

// // UPDATE
// router.put('/api/admin/application/:appId', middleware.isLoggedIn, middleware.isStaff, function(req, res) {
//     ModApp.findById(req.params.appId, function(err, app) {
//         if(err) {
//             middleware.handleError(res, err.message, 'Something went wrong while processing your request');
//         } else {
//             var editedPost = req.body;
//             if(middleware.checkIfMissing(editedPost.title)) {
//                 middleware.handleError(res, 'Post title is missing', 'Title is missing', 400);
//             } else if(middleware.checkIfMissing(editedPost.content)) {
//                 middleware.handleError(res, 'Post content is missing', 'Content is missing', 400);
//             } else {
//                 Post.findByIdAndUpdate(req.params.postId, editedPost, function(err, post) {
//                     if(err) {
//                         middleware.handleError(res, err.message, 'Failed to update post');
//                     } else {
//                         res.status(204).end('Updated post')
//                     }
//                 })
//             }
//         }
//     });
// });

// // DELETE
// router.delete('/api/forum/:categoryId/:postId', middleware.isLoggedIn, function(req, res) {
//     Post.findById(req.params.postId, function(err, post) {
//         if(err) {
//             middleware.handleError(res, err.message, 'Failed to delete post');
//         } else {
//             if(req.user._id == post.authour || middleware.hasPermission(req.user, 'forum', 'deletePosts')) {
//                 Category.findById(post.category, function(err, category) {
//                     if(err) {
//                         middleware.handleError(res, err.message, 'Failed to delete post');
//                     } else {
//                         var postToRemove = category.posts.indexOf(post._id);
//                         category.posts.splice(postToRemove, 1);
//                         category.save();
//                     }
//                 });
//                 post.comments.forEach(function(comment) {
//                     Comment.findByIdAndRemove(comment, function(err) {
//                         if(err) {
//                             middleware.handleError(res, err.message, 'Failed to delete the comments associated with this post');
//                         }
//                     })
//                 });
//                 Post.findByIdAndRemove(post._id, function(err) {
//                     if(err) {
//                         middleware.handleError(res, err.message, 'Failed to delete post');
//                     } else {
//                         res.status(204).end('Deleted post');
//                     }
//                 });
//             } else {
//                 middleware.handleError(res, 'Unauthorized request', 'You don\'t have permission to do that', 401);
//             }
//         }
//     })
// });

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