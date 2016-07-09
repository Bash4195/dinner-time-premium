var express = require('express');
var router = express.Router();
var handleError = require('../middleware/handleError');
var Forum = require('../models/forum');

// INDEX
router.get('/forum', function(req, res) {
    Forum.find({}, function(err, posts) {
        if(err) {
            handleError(res, err.message, 'Failed to retrieve forum posts.');
        } else {
            res.status(200).json(posts);
        }
    })
});

// NEW // In Modal instead of separate route

// CREATE
router.post('/forum', function(req ,res) {
    var newPost = req.body;

    // Check for missing input here or in a middleware

    Forum.create(newPost, function(err, post) {
        if(err) {
            handleError(res, err.message, 'Failed to create post.');
        } else {
            res.status(201).json(post);
        }
    });
});

// SHOW
router.get('/forum/:postId', function(req, res) {
    Forum.findById(req.params.id, function(err, post) {
        if(err) {
            handleError(res, err.message, 'Failed to find post.');
        } else {
            res.status(200).json(post);
        }
    })
});

// EDIT // In modal instead of separate route

// UPDATE
router.put('/forum/:postId', function(req, res ) {
    Forum.findByIdAndUpdate(req.params.id, res.body, function(err, post) {
        if(err) {
            handleError(res, err.message, 'Failed to update post.');
        } else {
            res.status(204).end('Updated post');
        }
    })
});

// DESTROY
router.delete('/forum/:postId', function(req, res) {
    Forum.findByIdAndRemove(req.params.id, function(err) {
        if(err) {
            handleError(res, err.message, 'Failed to delete post.');
        } else {
            res.status(204).end('Deleted post');
        }
    })
});

module.exports = router;