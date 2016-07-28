var mongoose = require('mongoose');

var forumCommentSchema = mongoose.Schema({
    comment: {type: String, required: true},
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Forum_Post' },
    authour: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    editedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
},
{ timestamps: true });


module.exports = mongoose.model('Forum_Comment', forumCommentSchema);