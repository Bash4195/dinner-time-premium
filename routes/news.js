var express = require('express');
var router = express.Router();
var middleware = require('../middleware/index');
var News = require('../models/news');
var NewsComment = require('../models/newsComment');

// INDEX
router.get('/api/news', function(req, res) {
    News.find({}).populate('authour').exec(function(err, news) {
        if(err) {
            middleware.handleError(res, err.message, 'Failed to retrieve news');
        } else {
            res.status(200).json(news);
        }
    });
});

// NEW - In dialog

// CREATE
router.post('/api/news', middleware.isLoggedIn, middleware.isSuperAdmin, function(req, res) {
    if(middleware.hasPermission(req.user, 'news', 'createNews')) {
        var newNews = req.body;
        if(newNews.title === '' || newNews.title === 'undefined') {
            middleware.handleError(res, 'News title is missing', 'Title is missing', 400);
        } else if(newNews.content === '' || newNews.content === 'undefined') {
            middleware.handleError(res, 'News content is missing', 'Content is missing', 400);
        } else if(newNews.authour === '' || newNews.authour === 'undefined') {
            middleware.handleError(res, 'News authour is missing', 'Authour is missing', 400);
        } else {
            News.create(newNews, function(err, news) {
                if(err) {
                    middleware.handleError(res, err.message, 'Failed to create news event');
                } else {
                    res.status(201).json(news);
                }
            });
        }
    } else {
        middleware.handleError(res, 'Unauthorized request', 'You don\'t have permission to do that', 401);
    }
});

// SHOW
router.get('/api/news/:newsId', function(req, res) {
    News.findById(req.params.newsId).populate('authour editedBy comments').exec(function(err, newsEvent) {
        if(err) {
            middleware.handleError(res, err.message, 'Failed to find news event');
        } else {
            res.status(200).json(newsEvent);
        }
    })
});

// EDIT - In dialog

// UPDATE
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

// DELETE
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