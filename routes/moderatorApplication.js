var express = require('express');
var router = express.Router();
var middleware = require('../middleware/index');
var ModApp = require('../models/moderatorApplication');

// Client routes

// CREATE
router.post('/api/apply/:userId', middleware.isLoggedIn, middleware.canApplyToMod, function(req, res) {
    var newApp = req.body;
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
        ModApp.create(newApp, function(err, app) {
            if(err) {
                middleware.handleError(res, err.message, 'Failed to create moderator application');
            } else {
                res.status(201).json(app);
            }
        });
    }
});

// SHOW
router.get('/api/application/:appId', function(req, res) {
    ModApp.findById(req.params.appId).populate('authour').exec(function(err, app) {
        if(err) {
            middleware.handleError(res, err.message, 'Failed to find moderator application');
        } else {
            res.status(200).json(app);
        }
    })
});

// Admin routes

// // INDEX
// router.get('/api/admin/apply', function(req, res) {
//     ModApp.find({}).populate('authour').skip(req.query.skip).limit(20).sort({createdAt: -1}).exec(function(err, apps) {
//         if(err) {
//             middleware.handleError(res, err.message, 'Failed to retrieve apply');
//         } else {
//             res.status(200).json(apps);
//         }
//     });
// });
//
// // UPDATE
// router.put('/api/forum/:categoryId/:postId', middleware.isLoggedIn, function(req, res) {
//     Post.findById(req.params.postId, function(err, post) {
//         if(err) {
//             middleware.handleError(res, err.message, 'Failed to update post');
//         } else {
//             if(req.user._id == post.authour || middleware.hasPermission(req.user, 'forum', 'updatePosts'
//                     || req.body.locked && req.user._id == post.authour || req.body.locked && middleware.hasPermission(req.user, 'forum', 'lockPosts'))) {
//                 var editedPost = req.body;
//                 if(middleware.checkIfMissing(editedPost.title)) {
//                     middleware.handleError(res, 'Post title is missing', 'Title is missing', 400);
//                 } else if(middleware.checkIfMissing(editedPost.content)) {
//                     middleware.handleError(res, 'Post content is missing', 'Content is missing', 400);
//                 } else {
//                     Post.findByIdAndUpdate(req.params.postId, editedPost, function(err, post) {
//                         if(err) {
//                             middleware.handleError(res, err.message, 'Failed to update post');
//                         } else {
//                             res.status(204).end('Updated post')
//                         }
//                     })
//                 }
//             } else {
//                 middleware.handleError(res, 'Unauthorized request', 'You don\'t have permission to do that', 401);
//             }
//         }
//     });
// });
//
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

module.exports = router;