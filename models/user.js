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
    rank: { type: String, default: 'User', required: true },
    roles: { type: Array, default: 'User', required: true },
    permissions: {
        Forum: {
            'Create Categories': {type: Boolean, default: false},
            'Update Categories': {type: Boolean, default: false},
            'Delete Categories': {type: Boolean, default: false},

            'Create Posts': {type: Boolean, default: true},
            'Update Posts': {type: Boolean, default: false},
            'Delete Posts': {type: Boolean, default: false},
            'Lock Posts': {type: Boolean, default: false},
            'Move Posts': {type: Boolean, default: false},

            'Create Comments': {type: Boolean, default: true},
            'Update Comments': {type: Boolean, default: false},
            'Delete Comments': {type: Boolean, default: false}
        }
    }
}, 
    { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);