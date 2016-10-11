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
    onlineStatus: { type: String, maxlength: 7 },
    realName: { type: String, maxlength: 50 },
    gender: { type: String, maxlength: 20 },
    age: { type: Number, maxlength: 3 },
    birthday: Date,
    location: { type: String, maxlength: 100 },
    occupation: { type: String, maxlength: 100 },
    bio: { type: String, maxlength: 1000 },
    backgroundImg: { type: String, maxlength: 1000 },

    // Permissions
    rank: { type: String, default: 'User', required: true },
    roles: { type: Array, default: 'User', required: true },
    permissions: {
        general: {
            modifyRules: {type: Boolean, default: false},
            // Mod Application
            canApplyToMod: { type: Boolean, default: true, required: true }
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