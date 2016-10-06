var mongoose = require('mongoose');

var forumCommentSchema = mongoose.Schema({
    comment: { type: String, maxlength: 1000, required: true },
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Forum_Post', required: true },
    authour: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    editedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    editedAt: { type: Date, default: Date.now }
},
    { timestamps: true }
);


module.exports = mongoose.model('Forum_Comment', forumCommentSchema);