var mongoose = require('mongoose');

var forumSchema = mongoose.Schema({
    title: {type: String, required: true },
    content: {type: String, required: true},
    authour: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        _id: {type: String, required: true},
        name: {type: String, required: true},
        avatar: String,
        avatarMedium: String,
        profileUrl: String,
        isOnline: Boolean
    }
},
    {
        timestamps: true
    });


module.exports = mongoose.model('Forum', forumSchema);