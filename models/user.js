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
    gender: String,
    age: String,
    birthday: Date,
    location: String,
    occupation: String,
    status: String,
    bio: String,
    
    // Mod Application
    canApplyToMod: { type: Boolean, default: true, required: true },

    // Permissions
    rank: { type: String, default: 'User', required: true },
    roles: { type: Array, default: 'User', required: true },
    permissions: {
        general: {
            modifyRules: {type: Boolean, default: false}
        },
        news: {
            createNews: {type: Boolean, default: false},
            updateNews: {type: Boolean, default: false},
            deleteNews: {type: Boolean, default: false},
            
            createComments: {type: Boolean, default: true},
            updateComments: {type: Boolean, default: false},
            deleteComments: {type: Boolean, default: false}
        },
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
        }
    }
}, 
    { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);