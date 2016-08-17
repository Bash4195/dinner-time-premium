var mongoose = require('mongoose');

var forumCommentSchema = mongoose.Schema({
    comment: { type: String, required: true, maxlength: 1000 },
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Forum_Post' },
    authour: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    editedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    editedAt: { type: Date, default: Date.now }
},
    { timestamps: true }
);


module.exports = mongoose.model('Forum_Comment', forumCommentSchema);