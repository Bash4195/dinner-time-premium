var mongoose = require('mongoose');

var forumSchema = mongoose.Schema({
    title: {type: String, required: true },
    content: {type: String, required: true},
    authour: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        name: {type: String, required: true},
        avatar: String,
        profileUrl: String,
        isOnline: Boolean
    }
},
    {
        timestamps: true
    });


module.exports = mongoose.model('Forum', forumSchema);