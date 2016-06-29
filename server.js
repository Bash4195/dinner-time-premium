var express = require('express');
var bodyParser = require('body-parser');

var app = express();

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended: true}));

app.get('*', function(req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

app.listen(8080, function() {
    console.log('Server is listening on port 8080');
});