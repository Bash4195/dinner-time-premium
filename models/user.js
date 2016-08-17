var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
    // stuff from steam
    openIdIdentifier: String,
    steamId: String,
    name: String,
    profileUrl: String,
    avatar: String,
    avatarMedium: String,
    avatarFull: String,
    countryCode: String,

    // Profile info
    onlineStatus: String,
    realName: String,
    age: Number,
    birthday: Date,
    location: String,
    occupation: String,
    status: String,
    bio: String,

    // Permissions
    rank: { type: String, default: 'User' }
}, 
    { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);