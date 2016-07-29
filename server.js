var express = require('express');
var app = express();
var favicon = require('serve-favicon');
var bodyParser = require('body-parser');
var session = require('express-session');
var mongoose = require('mongoose');
var passport = require('passport');
var SteamStrategy = require('passport-steam').Strategy;
var middleware = require('./middleware/index');

// Route requires
var authRoutes = require('./routes/auth');
var forumRoutes = require('./routes/forum');
var userRoutes = require('./routes/user');

// Model requires
var User = require('./models/user');

// App config
app.use(express.static(__dirname + '/public'));
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

mongoose.connect(process.env.MONGODB_URI);

// Passport config
passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

passport.use(new SteamStrategy({
        returnURL: process.env.REALM + 'auth/steam/return',
        realm: process.env.REALM,
        apiKey: 'B506EB47CC09A8AB77F4D484FB95FC49'
    },
    function(identifier, profile, done) {
        var user = profile._json;
        User.findOneAndUpdate({openIdIdentifier: identifier}, {
            // Updates these properties on creating or finding
            openIdIdentifier: identifier,
            steamId: user.steamid,
            name: user.personaname,
            profileUrl: user.profileurl,
            avatar: user.avatar,
            avatarMedium: user.avatarmedium,
            avatarFull: user.avatarfull,
            countryCode: user.loccountrycode,
            onlineStatus: 'Online'
        }, {upsert: true}, function(err, user) { // Upsert allows the object to be updated if it's found
            return done(err, user);
        })
    }
));

app.use(session({
    secret: 'Benji lives in Dinner Time Premium',
    name: 'DTP',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 86400000 } // Users have to login again after 24 hours
}));

app.use(passport.initialize());
app.use(passport.session());

// Reset all users to offline mode
// Useful for when the site is updated, restarted, crashed, etc.
User.update({onlineStatus: {$ne: 'Offline'}}, {onlineStatus: 'Offline'}, {multi: true}, function(err, users) {
    if(err) {
        console.log('ERROR: ' + err.message)
    }
});

// Routes
app.use(authRoutes);
app.use(forumRoutes);
app.use(userRoutes);

app.post('/api/status', middleware.isLoggedIn, function(req, res) {
    User.findByIdAndUpdate(req.body.id, {onlineStatus: req.body.onlineStatus}, function(err, user) {
        if(err) {
            middleware.handleError(res, err.message, 'Failed to update status');
        } else {
            res.status(204).end('Status updated');
        }
    })
});

app.get('*', function(req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

var port = process.env.PORT || 8080;

app.listen(port, function() {
    console.log('Server is listening on port ' + port);
});