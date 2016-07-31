var mongoose = require('mongoose');
var findOrCreate = require('mongoose-findorcreate');

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
    rank: String
}, 
    { timestamps: true }
);

userSchema.plugin(findOrCreate);

module.exports = mongoose.model('User', userSchema);