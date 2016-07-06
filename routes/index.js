var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
    res.render('index');
});

router.get('/rules', function(req, res) {
    res.render('rules', {active: 'rules'});
});

module.exports = router;