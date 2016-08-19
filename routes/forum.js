var express = require('express');
var router = express.Router();
var middleware = require('../middleware/index');
var Category = require('../models/forumCategory');
var Post = require('../models/forumPost');
var Comment = require('../models/forumComment');

// TODO: Fix up this mess! Ex. Each route should return the same things, etc.

/////////////////// Categories ////////////////////////////

// Get the number of posts in a category
router.get('/api/forum/allCategories', function(req, res) {
    Category.find({}).sort({createdAt: 1}).exec(function(err, categories) {
        if(err) {
            middleware.handleError(res, err.message, 'Failed to retrieve forum categories');
        } else {
            res.status(200).json(categories);
        }
    });
});

// INDEX
router.get('/api/forum', function(req, res) {
    Category.find({}).populate({path: 'posts', populate: {path: 'authour'}, options: {sort: { updatedAt: -1 }, limit: 6}}).exec(function(err, categories) {
        if(err) {
            middleware.handleError(res, err.message, 'Failed to retrieve forum categories');
        } else {
            res.status(200).json(categories);
        }
    });
});

// NEW - In dialog

// CREATE
router.post('/api/forum', middleware.isLoggedIn, function(req, res) {
    if(middleware.hasPermission(req.user, 'forum', 'createCategories')) {
        var newCategory = req.body;
        if(middleware.checkIfMissing(newCategory.title)) {
            middleware.handleError(res, 'Category title is missing', 'Title is missing', 400);
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
    } else {
        middleware.handleError(res, 'Unauthorized request', 'You don\'t have permission to do that', 401);
    }
});

// SHOW - Same as post index

// EDIT - In Dialog

// UPDATE
router.put('/api/forum/:categoryId', middleware.isLoggedIn, function(req, res) {
    if(middleware.hasPermission(req.user, 'forum', 'updateCategories')) {
        var editedCategory = req.body;
        if(middleware.checkIfMissing(editedCategory.title)) {
            middleware.handleError(res, 'Category title is missing', 'Title is missing', 400);
        } else if(middleware.checkIfMissing(editedCategory.editedBy)) {
            middleware.handleError(res, 'Category editor is missing', 'Editor is missing', 400);
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
    } else {
        middleware.handleError(res, 'Unauthorized request', 'You don\'t have permission to do that', 401);
    }
});

// DELETE
router.delete('/api/forum/:categoryId', middleware.isLoggedIn, function(req, res) {
    if(middleware.hasPermission(req.user, 'forum', 'deleteCategories')) {
        Category.findById(req.params.categoryId).populate('posts').exec(function(err, category) {
            if(err) {
                middleware.handleError(res, err.message, 'Failed to delete category');
            } else {
                category.posts.forEach(function(post) {
                    post.comments.forEach(function(comment) {
                        Comment.findByIdAndRemove(comment, function(err) {
                            if(err) {
                                middleware.handleError(res, err.message, 'Failed to delete the comments associated with this categories posts');
                            }
                        })
                    });
                    Post.findByIdAndRemove(post._id, function(err) {
                        if(err) {
                            middleware.handleError(res, err.message, 'Failed to delete the posts associated with this category');
                        }
                    })
                });
                Category.findByIdAndRemove(category._id, function(err) {
                    if(err) {
                        middleware.handleError(res, err.message, 'Failed to delete category');
                    } else {
                        res.status(204).end('Deleted category');
                    }
                });
            }
        })
    } else {
        middleware.handleError(res, 'Unauthorized request', 'You don\'t have permission to do that', 401);
    }
});

/////////////////// Posts ////////////////////////////

// Recent Posts
router.get('/api/forum/recentPosts', function(req, res) {
    Post.find({}).sort('-updatedAt').populate('authour category').limit(6).exec(function(err, posts) {
        if(err) {
            middleware.handleError(res, err.message, 'Failed to retrieve recent posts');
        } else {
            res.status(200).json(posts);
        }
    })
});

// Category - used to count the posts and use other category attributes
router.get('/api/forum/singleCategory/:categoryPath', function(req, res) {
    Category.findOne({path: '/forum/' + req.params.categoryPath}, function(err, category) {
        if(err) {
            middleware.handleError(res, err.message, 'Failed to retrieve category');
        } else {
            res.status(200).json(category);
        }
    });
});

// INDEX
// Returns the category but is only used for the posts in said category
router.get('/api/forum/:categoryPath', function(req, res) {
    Category.findOne({path: '/forum/' + req.params.categoryPath})
        .populate({path: 'posts', populate: {path: 'authour'}, options: {skip: req.query.skip, limit: 20, sort: {updatedAt: -1}}}).exec(function(err, posts) {
            if(err) {
                middleware.handleError(res, err.message, 'Failed to retrieve posts');
            } else {
                res.status(200).json(posts);
            }
    });
});

// NEW - In dialog

// CREATE
router.post('/api/forum/:categoryPath', middleware.isLoggedIn, function(req, res) {
    if(middleware.hasPermission(req.user, 'forum', 'createPosts')) {
        var newPost = req.body;
        if(newPost.title === '' || newPost.title === 'undefined') {
            middleware.handleError(res, 'Post title is missing', 'Title is missing', 400);
        } else if(newPost.content === '' || newPost.content === 'undefined') {
            middleware.handleError(res, 'Post content is missing', 'Content is missing', 400);
        } else if(newPost.authour === '' || newPost.authour === 'undefined') {
            middleware.handleError(res, 'Post authour is missing', 'Authour is missing', 400);
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
    } else {
        middleware.handleError(res, 'Unauthorized request', 'You don\'t have permission to do that', 401);
    }
});

// SHOW
router.get('/api/forum/:categoryPath/:postId', function(req, res) {
    Post.findById(req.params.postId).populate('authour category editedBy').exec(function(err, post) {
        if(err) {
            middleware.handleError(res, err.message, 'Failed to find post');
        } else {
            res.status(200).json(post);
        }
    })
});

// EDIT - In dialog

// UPDATE
router.put('/api/forum/:categoryId/:postId', middleware.isLoggedIn, function(req, res) {
    Post.findById(req.params.postId, function(err, post) {
        if(err) {
            middleware.handleError(res, err.message, 'Failed to update post');
        } else {
            if(req.user._id == post.authour || middleware.hasPermission(req.user, 'forum', 'updatePosts' 
                    || req.body.locked && req.user._id == post.authour || req.body.locked && middleware.hasPermission(req.user, 'forum', 'lockPosts'))) {
                var editedPost = req.body;
                if(middleware.checkIfMissing(editedPost.title)) {
                    middleware.handleError(res, 'Post title is missing', 'Title is missing', 400);
                } else if(middleware.checkIfMissing(editedPost.content)) {
                    middleware.handleError(res, 'Post content is missing', 'Content is missing', 400);
                } else {
                    Post.findByIdAndUpdate(req.params.postId, editedPost, function(err, post) {
                        if(err) {
                            middleware.handleError(res, err.message, 'Failed to update post');
                        } else {
                            res.status(204).end('Updated post')
                        }
                    })
                }
            } else {
                middleware.handleError(res, 'Unauthorized request', 'You don\'t have permission to do that', 401);
            }
        }
    });
});

// DELETE
router.delete('/api/forum/:categoryId/:postId', middleware.isLoggedIn, function(req, res) {
    Post.findById(req.params.postId, function(err, post) {
        if(err) {
            middleware.handleError(res, err.message, 'Failed to delete post');
        } else {
            if(req.user._id == post.authour || middleware.hasPermission(req.user, 'forum', 'deletePosts')) {
                Category.findById(post.category, function(err, category) {
                    if(err) {
                        middleware.handleError(res, err.message, 'Failed to delete post');
                    } else {
                        var postToRemove = category.posts.indexOf(post._id);
                        category.posts.splice(postToRemove, 1);
                        category.save();
                    }
                });
                post.comments.forEach(function(comment) {
                    Comment.findByIdAndRemove(comment, function(err) {
                        if(err) {
                            middleware.handleError(res, err.message, 'Failed to delete the comments associated with this post');
                        }
                    })
                });
                Post.findByIdAndRemove(post._id, function(err) {
                    if(err) {
                        middleware.handleError(res, err.message, 'Failed to delete post');
                    } else {
                        res.status(204).end('Deleted post');
                    }
                });
            } else {
                middleware.handleError(res, 'Unauthorized request', 'You don\'t have permission to do that', 401);
            }
        }
    })
});

// MOVE POST
router.put('/api/forum/:categoryId/:postId/move', middleware.isLoggedIn, function(req, res) {
    var newCategory = req.body;
    if(middleware.checkIfMissing(newCategory)) {
        middleware.handleError(res, 'No category to move post to was supplied', 'No category to move post to was supplied', 400);
    } else {
        Post.findById(req.params.postId, function(err, post) {
            if(err) {
                middleware.handleError(res, err.message, 'Failed to move post');
            } else {
                if(req.user._id == post.authour || middleware.hasPermission(req.user, 'forum', 'movePosts')) {
                    Post.findByIdAndUpdate(req.params.postId, newCategory, function(err, post) {
                        if(err) {
                            middleware.handleError(res, err.message, 'Failed to move post');
                        } else {
                            Category.findById(post.category, function(err, category) {
                                if(err) {
                                    middleware.handleError(res, err.message, 'Failed to move post');
                                } else {
                                    var removePost = category.posts.indexOf(req.params.postId);
                                    category.posts.splice(removePost, 1);
                                    category.save();

                                    Category.findById(newCategory.category._id, function(err, newCategory) {
                                        if(err) {
                                            middleware.handleError(res, err.message, 'Failed to move post');
                                        } else {
                                            newCategory.posts.push(post);
                                            newCategory.save();
                                            res.status(200).json(post);
                                        }
                                    });
                                }
                            });
                        }
                    })
                } else {
                    middleware.handleError(res, 'Unauthorized request', 'You don\'t have permission to do that', 401);
                }
            }
        });
    }
});


/////////////////// Comments ////////////////////////////
// Only need INDEX, CREATE, UPDATE and DELETE

// INDEX
router.get('/api/forum/:categoryPath/:postId/comments', function(req, res) {
    Post.findById(req.params.postId)
        .populate({path: 'comments', populate: {path: 'authour editedBy'}, options: {skip: req.query.skip, limit: 20, sort: {createdAt: 1}}}).exec(function(err, comments) {
        if(err) {
            middleware.handleError(res, err.message, 'Failed to retrieve comments');
        } else {
            res.status(200).json(comments);
        }
    });
});

// CREATE
router.post('/api/forum/:categoryPath/:postId', middleware.isLoggedIn, function(req, res) {
    if(middleware.hasPermission(req.user, 'forum', 'createComments')) {
        var newComment = req.body;
        if(!newComment.comment || newComment.comment === '') {
            middleware.handleError(res, 'Comment content is missing', 'Comment content is missing', 400);
        } else if(!newComment.authour || newComment.authour === '') {
            middleware.handleError(res, 'Comment authour is missing', 'Comment authour is missing', 400);
        } else {
            Post.findById(req.params.postId, function(err, post) {
                if(err) {
                    middleware.handleError(res, err.message, 'Failed to retrieve post to create comment in');
                } else {
                    newComment.post = post._id;
                    Comment.create(newComment, function(err, comment) {
                        if(err) {
                            middleware.handleError(res, err.message, 'Failed to create comment in ' + post.title);
                        } else {
                            post.comments.push(comment);
                            post.save();
                            res.status(201).json(comment);
                        }
                    });
                }
            });
        }
    } else {
        middleware.handleError(res, 'Unauthorized request', 'You don\'t have permission to do that', 401);
    }
});

// UPDATE
router.put('/api/forum/:categoryId/:postId/:commentId', middleware.isLoggedIn, function(req, res) {
    var editedComment = req.body;
    if(middleware.checkIfMissing(editedComment.comment)) {
        middleware.handleError(res, 'Comment content is missing', 'Comment content is missing', 400);
    } else if(middleware.checkIfMissing(editedComment.editedBy)) {
        middleware.handleError(res, 'Comment editor is missing', 'Comment editor is missing', 400);
    } else {
        Comment.findById(req.params.commentId, function(err, comment) {
            if(err) {
                middleware.handleError(res, err.message, 'Failed to update comment');
            } else {
                if(req.user._id == comment.authour || middleware.hasPermission(req.user, 'forum', 'updateComments')) {
                    Comment.findByIdAndUpdate(req.params.commentId, editedComment, function(err, comment) {
                        if(err) {
                            middleware.handleError(res, err.message, 'Failed to update comment');
                        } else {
                            res.status(204).end('Updated comment')
                        }
                    })
                } else {
                    middleware.handleError(res, 'Unauthorized request', 'You don\'t have permission to do that', 401);
                }
            }
        });
    }
});

// DELETE
router.delete('/api/forum/:categoryId/:postId/:commentId', middleware.isLoggedIn, function(req, res) {
    Comment.findById(req.params.commentId, function(err, comment) {
        if(err) {
            middleware.handleError(res, err.message, 'Failed to delete comment');
        } else {
            if(req.user._id == comment.authour || middleware.hasPermission(req.user, 'forum', 'deleteComments')) {
                Post.findById(comment.post, function(err, post) {
                    if(err) {
                        middleware.handleError(res, err.message, 'Failed to delete comment');
                    } else {
                        var commentToRemove = post.comments.indexOf(comment._id);
                        post.comments.splice(commentToRemove, 1);
                        post.save();
                    }
                });
                Comment.findByIdAndRemove(comment._id, function(err) {
                    if(err) {
                        middleware.handleError(res, err.message, 'Failed to delete comment');
                    } else {
                        res.status(204).end('Deleted comment');
                    }
                });
            } else {
                middleware.handleError(res, 'Unauthorized request', 'You don\'t have permission to do that', 401);
            }
        }
    })
});

module.exports = router;