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
        forum: {
            createCategories: {type: Boolean, default: false},
            updateCategories: {type: Boolean, default: false},
            deleteCategories: {type: Boolean, default: false},

            createPosts: {type: Boolean, default: true},
            updatePosts: {type: Boolean, default: false},
            deletePosts: {type: Boolean, default: false},
            lockPosts: {type: Boolean, default: false},
            movePosts: {type: Boolean, default: false},

            createComments: {type: Boolean, default: true},
            updateComments: {type: Boolean, default: false},
            deleteComments: {type: Boolean, default: false}
        },
        rules: {
            modifyRules: {type: Boolean, default: false}
        }
    }
}, 
    { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);