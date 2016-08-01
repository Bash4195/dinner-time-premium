var express = require('express');
var router = express.Router();
var middleware = require('../middleware/index');
var Category = require('../models/forumCategory');
var Post = require('../models/forumPost');
var Comment = require('../models/forumComment');

/////////////////// Categories ////////////////////////////

// INDEX
router.get('/api/forum', function(req, res) {
    Category.find({}, function(err, categories) {
        if(err) {
            middleware.handleError(res, err.message, 'Failed to retrieve forum categories');
        } else {
            res.status(200).json(categories);
        }
    })
});

// NEW - In dialog

// CREATE
router.post('/api/forum', middleware.isLoggedIn, function(req, res) {
    var newCategory = req.body;
    if(middleware.checkIfMissing(newCategory.title)) {
        middleware.handleError(res, 'Category title is missing', 'Title is missing', 400);
    } else if(middleware.checkIfMissing(newCategory.description)) {
        middleware.handleError(res, 'Category description is missing', 'Description is missing', 400);
    } else if(middleware.checkIfMissing(newCategory.icon)) {
        middleware.handleError(res, 'Category icon is missing', 'Icon is missing', 400);
    } else if(middleware.checkIfMissing(newCategory.path)) {
        middleware.handleError(res, 'Category path is missing', 'Path is missing (/forum/:categoryTitle)', 400);
    } else if(middleware.checkIfMissing(newCategory.createdBy)) {
        middleware.handleError(res, 'Category authour is missing', 'Authour is missing', 400);
    } else {
        Category.create(newCategory, function(err, category) {
            if(err) {
                middleware.handleError(res, err.message, 'Failed to create category');
            } else {
                res.status(201).json(category);
            }
        });
    }
});

// SHOW - No show

// EDIT - In Dialog

// UPDATE
router.put('/api/forum/:categoryId', middleware.isLoggedIn, function(req, res) {
    var editedCategory = req.body;
    if(middleware.checkIfMissing(editedCategory.title)) {
        middleware.handleError(res, 'Category title is missing', 'Title is missing', 400);
    } else if(middleware.checkIfMissing(editedCategory.description)) {
        middleware.handleError(res, 'Category description is missing', 'Description is missing', 400);
    } else if(middleware.checkIfMissing(editedCategory.icon)) {
        middleware.handleError(res, 'Category icon is missing', 'Icon is missing', 400);
    } else if(middleware.checkIfMissing(editedCategory.updatedBy)) {
        middleware.handleError(res, 'Category authour is missing', 'Authour is missing', 400);
    } else {
        editedCategory.path = '/forum/' + editedCategory.title.toLowerCase();
        Category.findByIdAndUpdate(req.params.categoryId, editedCategory, function(err, category) {
            if(err) {
                middleware.handleError(res, err.message, 'Failed to update category');
            } else {
                res.status(204).end('Updated category')
            }
        })
    }
});

// DELETE
router.delete('/api/forum/:categoryId', middleware.isLoggedIn, function(req, res) {
    Category.findByIdAndRemove(req.params.categoryId, function(err) {
        if(err) {
            middleware.handleError(res, err.message, 'Failed to delete category');
        } else {
            res.status(204).end('Deleted category');
        }
    })
});

/////////////////// Posts ////////////////////////////

// Recent Posts
router.get('/api/forum/recentPosts', function(req, res) {
    Post.find({}).sort('-updatedAt').populate('authour').limit(6).exec(function(err, posts) {
        if(err) {
            middleware.handleError(res, err.message, 'Failed to retrieve recent posts');
        } else {
            res.status(200).json(posts);
        }
    })
});

// INDEX
router.get('/api/forum/:categoryPath', function(req, res) {
    Category.findOne({path: '/forum/' + req.params.categoryPath}, function(err, category) {
        if(err) {
            middleware.handleError(res, err.message, 'Failed to retrieve category');
        } else {
            Post.find({category: category._id}).populate('authour').exec(function(err, posts) {
                if(err) {
                    middleware.handleError(res, err.message, 'Failed to retrieve category');
                } else {
                    data = {
                        category: category,
                        posts: posts
                    };
                    res.status(200).json(data);
                }
            });
        }
    });
});

// NEW - In dialog

// CREATE
router.post('/api/forum/:categoryPath', middleware.isLoggedIn, function(req, res) {
    var newPost = req.body;
    if(newPost.title === '' || newPost.title === 'undefined') {
        middleware.handleError(res, 'Title is missing', 'Title is missing', 400);
    } else if(newPost.content === '' || newPost.content === 'undefined') {
        middleware.handleError(res, 'Content is missing', 'Content is missing', 400);
    } else if(newPost.authour === '' || newPost.authour === 'undefined') {
        middleware.handleError(res, 'Authour is missing', 'Authour is missing', 400);
    } else {
        Category.findOne({path: '/forum/' + req.params.categoryPath}, function(err, category) {
            if(err) {
                middleware.handleError(res, err.message, 'Failed to retrieve category to create post in');
            } else {
                newPost.category = category._id;
                Post.create(newPost, function(err, post) {
                    if(err) {
                        middleware.handleError(res, err.message, 'Failed to create post in ' + category.title);
                    } else {
                        category.posts.push(post);
                        category.save();
                        res.status(201).json(post);
                    }
                });
            }
        });
    }
});

// SHOW
router.get('/api/forum/:categoryPath/:postId', function(req, res) {
    Post.findById(req.params.postId).populate('authour').exec(function(err, post) {
        if(err) {
            middleware.handleError(res, err.message, 'Failed to find post');
        } else {
            res.status(200).json(post);
        }
    })
});

// EDIT - In dialog

// UPDATE
router.put('/api/forum/:postId', middleware.isLoggedIn, function(req, res ) {
    if(req.body.title === '' || req.body.title === 'undefined') {
        middleware.handleError(res, 'Title is missing', 'Title is missing', 400);
    } else if(req.body.content === '' || req.body.content === 'undefined') {
        middleware.handleError(res, 'Content is missing', 'Content is missing', 400);
    } else {
        Post.findByIdAndUpdate(req.params.postId, req.body, function(err, post) {
            if(err) {
                middleware.handleError(res, err.message, 'Failed to update post');
            } else {
                res.status(204).end('Updated post');
            }
        })
    }
});

// DELETE
router.delete('/api/forum/:postId', middleware.isLoggedIn, function(req, res) {
    Post.findByIdAndRemove(req.params.postId, function(err) {
        if(err) {
            middleware.handleError(res, err.message, 'Failed to delete post');
        } else {
            res.status(204).end('Deleted post');
        }
    })
});

/////////////////// Comments ////////////////////////////


module.exports = router;