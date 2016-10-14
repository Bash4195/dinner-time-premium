var express = require('express');
var router = express.Router();
var middleware = require('../middleware/index');
var Rules = require('../models/rules');

// SHOW
router.get('/api/rules', function(req, res) {
    Rules.findOne({}, function(err, rules) {
        if(err) {
            middleware.handleError(res, err.message, 'Failed to retrieve rules');
        } else {
            if(!rules) {
                Rules.create({rules: 'No rules yet!'}, function(err, createdRules) {
                    if(err) {
                        middleware.handleError(res, err.message, 'Failed to retrieve rules');
                    } else {
                        res.status(200).json(createdRules);
                    }
                })
            } else {
                res.status(200).json(rules);
            }
        }
    })
});

// EDIT
router.put('/api/rules', middleware.isLoggedIn, function(req, res) {
    if(middleware.hasPermission(req.user, 'general', 'modifyRules')) {
        var rules = req.body;
        if(!rules.rules || rules.rules === '') {
            middleware.handleError(res, 'Rules content is missing', 'Rules content is missing', 400);
        } else if(!rules.editedBy || rules.editedBy === '') {
            middleware.handleError(res, 'Rules editor is missing', 'Rules editor is missing', 400);
        } else if(!rules.editedAt || rules.editedAt === '') {
            middleware.handleError(res, 'Rules editing time is missing', 'Rules editing time is missing', 400);
        } else {
            Rules.findOneAndUpdate({}, rules, function(err, rules) {
                if(err) {
                    middleware.handleError(res, err.message, 'Failed to update rules');
                } else {
                    res.status(201).json(rules);
                }
            });
        }
    } else {
        middleware.handleError(res, 'Unauthorized request', 'You don\'t have permission to do that', 401);
    }
});

module.exports = router;