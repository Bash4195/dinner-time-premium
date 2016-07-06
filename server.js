var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var session = require('express-session');
var mongoose = require('mongoose');
var passport = require('passport');
var SteamStrategy = require('passport-steam').Strategy;

// Route requires
var userRoutes = require('./routes/user');

// Model requires
var User = require('./models/user');

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended: true}));

mongoose.connect('mongodb://localhost/dtp');

// Passport config
passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

passport.use(new SteamStrategy({
        returnURL: 'http://localhost:8080/auth/steam/return',
        realm: 'http://localhost:8080/',
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
            countryCode: user.loccountrycode
            
        }, function (err, user) {
            return done(err, user);
        });
    }
));

app.use(session({ //TODO update session when switched to HTTPS
    secret: 'Benji lives in Dinner Time Premium',
    name: 'DTP',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 86400000 } // Users have to login again after 24 hours
}));

app.use(passport.initialize());
app.use(passport.session());

// Middleware to include user on all pages
app.use(function(req, res, next) {
    res.locals.user = req.user;
    next();
});

// Routes
app.use(userRoutes);

app.get('*', function(req, res) {
    console.log(res);
    res.sendFile(__dirname + '/public/index.html', {user: req.user});
});

app.listen(8080, function() {
    console.log('Server is listening on port 8080');
});