var mongoose = require('mongoose');

var forumCommentSchema = mongoose.Schema({
    comment: {type: String, required: true},
    authour: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
},
{
    timestamps: true
});


module.exports = mongoose.model('Forum_Comment', forumCommentSchema);