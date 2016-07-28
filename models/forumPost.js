var mongoose = require('mongoose');

var forumPostSchema = mongoose.Schema({
    title: {type: String, required: true },
    content: {type: String, required: true},
    authour: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    editedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    pinned: Boolean,
    locked: Boolean,
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Forum_Category' },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Forum_Comment' }]
},
    { timestamps: true });


module.exports = mongoose.model('Forum_Post', forumPostSchema);