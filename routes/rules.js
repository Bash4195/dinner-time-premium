var express = require('express');
var router = express.Router();
var middleware = require('../middleware/index');
var Rules = require('../models/rules');

// CREATE
router.post('/api/rules', function(req, res) {
    // if(middleware.hasPermission(req.user, 'forum', 'createComments')) {
    //     var newComment = req.body;
    //     if(!newComment.comment || newComment.comment === '') {
    //         middleware.handleError(res, 'Comment content is missing', 'Comment content is missing', 400);
    //     } else if(!newComment.authour || newComment.authour === '') {
    //         middleware.handleError(res, 'Comment authour is missing', 'Comment authour is missing', 400);
    //     } else {
    //         Post.findById(req.params.postId, function(err, post) {
    //             if(err) {
    //                 middleware.handleError(res, err.message, 'Failed to retrieve post to create comment in');
    //             } else {
    //                 newComment.post = post._id;
    //                 Comment.create(newComment, function(err, comment) {
    //                     if(err) {
    //                         middleware.handleError(res, err.message, 'Failed to create comment in ' + post.title);
    //                     } else {
    //                         post.comments.push(comment);
    //                         post.save();
    //                         res.status(201).json(comment);
    //                     }
    //                 });
    //             }
    //         });
    //     }
    // } else {
    //     middleware.handleError(res, 'Unauthorized request', 'You don\'t have permission to do that', 401);
    // }
});

// SHOW
router.get('/api/rules', function(req, res) {
    Rules.findOne({}, function(err, rules) {
        if(err) {
            middleware.handleError(res, err.message, 'Failed to retrieve rules');
        } else {
            res.status(200).json(rules);
        }
    })
});

// EDIT

module.exports = router;