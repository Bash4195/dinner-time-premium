var express = require('express');
var app = express();
var favicon = require('serve-favicon');
var bodyParser = require('body-parser');
var session = require('express-session');
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var JSFtp = require('jsftp');
var fs = require('fs');
var convertTo = require('node-steam-converter');
var passport = require('passport');
var SteamStrategy = require('passport-steam').Strategy;

// Route requires
var authRoutes = require('./routes/auth');
var newsRoutes = require('./routes/news');
var forumRoutes = require('./routes/forum');
var userRoutes = require('./routes/user');
var rulesRoutes = require('./routes/rules');
var modAppRoutes = require('./routes/moderatorApplication');

// Model requires
var User = require('./models/user');

// App config
app.use(express.static(__dirname + '/public'));
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

mongoose.connect(process.env.MONGODB_URI);

// FTP config
var ftp = new JSFtp({
    host: "dtpremium.game.nfoservers.com",
    port: 21, // defaults to 21
    user: "dtpremium", // defaults to "anonymous"
    pass: "v21\\fvenu2$%yGQV@WCqcC!42G^75Ber$#G4v" // defaults to "@anonymous"
});

ftp.on('error', function(err){
    console.log('FTP ERROR: ' + err)
});

// Sync users file on server with website users file every 10 minutes
syncServerUsers();
setInterval(syncServerUsers, 600000);

function syncServerUsers() {
    ftp.get('/garrysmod/data/ulib/users.txt', './gmodFTP/users.txt', function(err) {
        if(err) {
            console.log('ERROR: ' + err);
            console.log('Failed to retrieve users file from DTP FTP');
        } else {
            // fs.readFile('./gmodFTP/users.txt', 'utf8', function(err, data) {
            //     if (err) {
            //         console.log('Failed to read users.txt file.');
            //     } else {
            //         // Replace all steamIds with Steam 64 IDs so we can check them later on
            //         var steamIds = data.match(/"STEAM.+"/g);
            //         steamIds.forEach(function(ele, i, steamIds) {
            //             steamIds[i] = ele.replace(/["]+/g, '');
            //             convertTo.steam64ID(steamIds[i], function(err, steam64ID) {
            //                 if(err) {
            //                     console.log('ERROR converting Steam IDs: ' + err);
            //                 } else {
            //                     steamIds[i] = steam64ID;
            //                 }
            //             });
            //             data = data.replace(/"STEAM.+"/g, 'steamId: "' + steamIds[i] + '"');
            //         });
            //         fs.writeFile("./gmodFTP/users.txt", data, function(err) {
            //             if(err) {
            //                 return console.log(err);
            //             }
            //         });
            //     }
            // });
        }
    });
}

// Passport config
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

passport.use(new SteamStrategy({
        returnURL: process.env.REALM + 'auth/steam/return',
        realm: process.env.REALM,
        apiKey: '595C885DB688C25CD6989D6374E69FF9'
    },
    function(identifier, profile, done) {
        var user = profile._json;

        var userData = {
            openIdIdentifier: identifier,
            steamId: user.steamid,
            name: user.personaname,
            profileUrl: user.profileurl,
            avatar: user.avatar,
            avatarMedium: user.avatarmedium,
            avatarFull: user.avatarfull,
            countryCode: user.loccountrycode,
            onlineStatus: 'Online',
            rank: 'User'
        };
        
        // Grab steam 32 ID and check users.txt file to see if it exists
        var steam32ID;
        convertTo.steam32ID(user.steamid, function(err, id) {
            if(err) {
                console.log('ERROR while converting user Steam ID: ' + err);
            } else {
                steam32ID = id;
            }
        });

        // Set rank to their rank in the server
        fs.readFile('./gmodFTP/users.txt', 'utf8', function(err, data) {
            if (err) {
                console.log('Failed to read users.txt file.');
            } else {
                var users = data.match(/"STEAM([\s\S]*?)"group"([\s\S]*?)}/g);
                var steamIds = data.match(/"STEAM.+"/g);
                // If there's a match (ie. the user logging in has a rank in the server), make sure we set their rank on the server on the site
                if(steamIds.includes('"' + steam32ID + '"')) {
                    var currentUserData = '';
                    users.forEach(function(ele, i) {
                        if(ele.includes('"' + steam32ID + '"')) {
                            currentUserData = ele;
                        }
                    });
                    currentUserData = currentUserData.match(/"group"\s".+"/);
                    currentUserData = currentUserData[0].replace('group', '');
                    currentUserData = currentUserData.replace(/"/g, '');
                    currentUserData = currentUserData.replace(/\s/g, '');
                    userData.rank = currentUserData;
                }
            }

            User.findOneAndUpdate({openIdIdentifier: identifier}, userData, {upsert: true, setDefaultsOnInsert: true}, function(err, foundOrNewUser) { // Upsert allows the object to be updated if it's found
                if(err) {
                    console.log('ERROR: Failed to find and update/upsert user.');
                    console.log(err);
                }
                User.findOne({openIdIdentifier: identifier}, function(err, user) {
                    if(err) {
                        console.log('ERROR: Failed to find user logging in.');
                        console.log(err);
                    } else {
                        return done(err, user);
                    }
                });
            });
        });
    }
));

app.use(session({
    secret: 'Benji lives in Dinner Time Premium',
    name: 'DTP',
    resave: true,
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
app.use(newsRoutes);
app.use(forumRoutes);
app.use(userRoutes);
app.use(rulesRoutes);
app.use(modAppRoutes);

app.get('*', function(req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

var port = process.env.PORT || 8080;

app.listen(port, function() {
    console.log('Server is listening on port ' + port);
});