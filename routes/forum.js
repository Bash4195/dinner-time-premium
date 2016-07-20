var express = require('express');
var router = express.Router();
var middleware = require('../middleware/index');
var Forum = require('../models/forum');

// INDEX
router.get('/api/forum', function(req, res) {
    Forum.find({}, function(err, posts) {
        if(err) {
            middleware.handleError(res, err.message, 'Failed to retrieve forum posts');
        } else {
            res.status(200).json(posts);
        }
    })
});

// NEW // In Modal instead of separate route

// CREATE
router.post('/api/forum', middleware.isLoggedIn, function(req, res) {
    var newPost = req.body;
    if(newPost.title === '' || newPost.title === 'undefined') {
        middleware.handleError(res, 'Title is missing', 'Title is missing', 400);
    } else if(newPost.content === '' || newPost.content === 'undefined') {
        middleware.handleError(res, 'Content is missing', 'Content is missing', 400);
    } else if(newPost.authour === '' || newPost.authour === 'undefined') {
        middleware.handleError(res, 'Authour is missing', 'Authour is missing', 400);
    } else {
        Forum.create(newPost, function(err, post) {
            if(err) {
                middleware.handleError(res, err.message, 'Failed to create post');
            } else {
                res.status(201).json(post);
            }
        });
    }
});

// SHOW
router.get('/api/forum/:postId', function(req, res) {
    Forum.findById(req.params.postId, function(err, post) {
        if(err) {
            middleware.handleError(res, err.message, 'Failed to find post');
        } else {
            res.status(200).json(post);
        }
    })
});

// EDIT // In modal instead of separate route

// UPDATE
router.put('/api/forum/:postId', middleware.isLoggedIn, function(req, res ) {
    if(req.body.title === '' || req.body.title === 'undefined') {
        middleware.handleError(res, 'Title is missing', 'Title is missing', 400);
    } else if(req.body.content === '' || req.body.content === 'undefined') {
        middleware.handleError(res, 'Content is missing', 'Content is missing', 400);
    } else {
        Forum.findByIdAndUpdate(req.params.postId, req.body, function(err, post) {
            if(err) {
                middleware.handleError(res, err.message, 'Failed to update post');
            } else {
                res.status(204).end('Updated post');
            }
        })
    }
});

// DESTROY
router.delete('/api/forum/:postId', middleware.isLoggedIn, function(req, res) {
    Forum.findByIdAndRemove(req.params.postId, function(err) {
        if(err) {
            middleware.handleError(res, err.message, 'Failed to delete post');
        } else {
            res.status(204).end('Deleted post');
        }
    })
});

module.exports = router;