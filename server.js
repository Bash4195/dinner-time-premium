var express = require('express');
var app = express();
var favicon = require('serve-favicon');
var bodyParser = require('body-parser');
var session = require('express-session');
var mongoose = require('mongoose');
var passport = require('passport');
var SteamStrategy = require('passport-steam').Strategy;

// Route requires
var userRoutes = require('./routes/user');
var forumRoutes = require('./routes/forum');

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
        User.findOrCreate({ openIdIdentifier: identifier }, {
            // Add these properties to object if it needs to be created
            steamId: user.steamid,
            name: user.personaname,
            profileUrl: user.profileurl,
            avatar: user.avatar,
            avatarMedium: user.avatarmedium,
            avatarFull: user.avatarfull,
            countryCode: user.loccountrycode,
            isOnline: true
            
        }, function (err, user) {
            return done(err, user);
        });
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

// Routes
app.use(userRoutes);
app.use(forumRoutes);

var port = process.env.PORT || 8080;

app.listen(port, function() {
    console.log('Server is listening on port ' + port);
});