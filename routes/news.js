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

module.exports = router;