var express = require('express');
var router = express.Router();
var middleware = require('../middleware/index');
var News = require('../models/news');
var NewsComment = require('../models/newsComment');

/////////////////// News ////////////////////////////

// INDEX
router.get('/api/news', function(req, res) {
    News.find({}).populate('authour').sort('-createdAt').exec(function(err, news) {
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
router.put('/api/news/:newsId', middleware.isLoggedIn, middleware.isSuperAdmin, function(req, res) {
    if(middleware.hasPermission(req.user, 'news', 'updateNews')) {
        var editedNewsEvent = req.body;
        if(middleware.checkIfMissing(editedNewsEvent.title)) {
            middleware.handleError(res, 'News event title is missing', 'Title is missing', 400);
        } else if(middleware.checkIfMissing(editedNewsEvent.content)) {
            middleware.handleError(res, 'News event content is missing', 'Content is missing', 400);
        } else {
            News.findByIdAndUpdate(req.params.newsId, editedNewsEvent, function(err, newsEvent) {
                if(err) {
                    middleware.handleError(res, err.message, 'Failed to update news event');
                } else {
                    res.status(204).end('Updated news event')
                }
            })
        }
    } else {
        middleware.handleError(res, 'Unauthorized request', 'You don\'t have permission to do that', 401);
    }
});

// DELETE
router.delete('/api/news/:newsId', middleware.isLoggedIn, middleware.isSuperAdmin, function(req, res) {
    if(middleware.hasPermission(req.user, 'news', 'deleteNews')) {
        News.findById(req.params.newsId, function(err, news) {
            if(err) {
                middleware.handleError(res, err.message, 'Failed to delete news event');
            } else {
                news.comments.forEach(function(comment) {
                    NewsComment.findByIdAndRemove(comment, function(err) {
                        if(err) {
                            middleware.handleError(res, err.message, 'Failed to delete the comments associated with this news event');
                        }
                    })
                });
                News.findByIdAndRemove(news._id, function(err) {
                    if(err) {
                        middleware.handleError(res, err.message, 'Failed to delete news event');
                    } else {
                        res.status(204).end('Deleted news event');
                    }
                });
            }
        });
    } else {
        middleware.handleError(res, 'Unauthorized request', 'You don\'t have permission to do that', 401);
    }
});

/////////////////// Comments ////////////////////////////
// Only need INDEX, CREATE, UPDATE and DELETE

// INDEX
router.get('/api/news/:newsId/comments', function(req, res) {
    News.findById(req.params.newsId)
        .populate({path: 'comments', populate: {path: 'authour editedBy'}, options: {skip: req.query.skip, limit: 20, sort: {createdAt: 1}}}).exec(function(err, comments) {
        if(err) {
            middleware.handleError(res, err.message, 'Failed to retrieve comments');
        } else {
            res.status(200).json(comments);
        }
    });
});

// CREATE
router.post('/api/news/:newsId', middleware.isLoggedIn, function(req, res) {
    if(middleware.hasPermission(req.user, 'news', 'createComments')) {
        var newComment = req.body;
        if(!newComment.comment || newComment.comment === '') {
            middleware.handleError(res, 'Comment content is missing', 'Comment content is missing', 400);
        } else if(!newComment.authour || newComment.authour === '') {
            middleware.handleError(res, 'Comment authour is missing', 'Comment authour is missing', 400);
        } else {
            News.findById(req.params.newsId, function(err, news) {
                if(err) {
                    middleware.handleError(res, err.message, 'Failed to retrieve news event to create comment in');
                } else {
                    newComment.news = news._id;
                    NewsComment.create(newComment, function(err, comment) {
                        if(err) {
                            middleware.handleError(res, err.message, 'Failed to create comment in ' + news.title);
                        } else {
                            news.comments.push(comment);
                            news.save();
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
router.put('/api/news/:newsId/:commentId', middleware.isLoggedIn, function(req, res) {
    var editedComment = req.body;
    if(middleware.checkIfMissing(editedComment.comment)) {
        middleware.handleError(res, 'Comment content is missing', 'Comment content is missing', 400);
    } else if(middleware.checkIfMissing(editedComment.editedBy)) {
        middleware.handleError(res, 'Comment editor is missing', 'Comment editor is missing', 400);
    } else {
        NewsComment.findById(req.params.commentId, function(err, comment) {
            if(err) {
                middleware.handleError(res, err.message, 'Failed to update comment');
            } else {
                if(req.user._id == comment.authour || middleware.hasPermission(req.user, 'news', 'updateComments')) {
                    NewsComment.findByIdAndUpdate(req.params.commentId, editedComment, function(err, comment) {
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
router.delete('/api/news/:newsId/:commentId', middleware.isLoggedIn, function(req, res) {
    NewsComment.findById(req.params.commentId, function(err, comment) {
        if(err) {
            middleware.handleError(res, err.message, 'Failed to delete comment');
        } else {
            if(req.user._id == comment.authour || middleware.hasPermission(req.user, 'news', 'deleteComments')) {
                News.findById(comment.news, function(err, news) {
                    if(err) {
                        middleware.handleError(res, err.message, 'Failed to delete comment');
                    } else {
                        var commentToRemove = news.comments.indexOf(comment._id);
                        news.comments.splice(commentToRemove, 1);
                        news.save();
                    }
                });
                NewsComment.findByIdAndRemove(comment._id, function(err) {
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