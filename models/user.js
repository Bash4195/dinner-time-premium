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
    permissions: { 
        forum: {
            createCategories: {type: String, default: false},
            updateCategories: {type: String, default: false},
            deleteCategories: {type: String, default: false},

            createPosts: {type: String, default: true},
            updatePosts: {type: String, default: false},
            deletePosts: {type: String, default: false},
            lockPosts: {type: String, default: false},
            movePosts: {type: String, default: false},

            createComments: {type: String, default: true},
            updateComments: {type: String, default: false},
            deleteComments: {type: String, default: false}
        }
    }
}, 
    { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);