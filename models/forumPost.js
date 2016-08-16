var mongoose = require('mongoose');

var forumPostSchema = mongoose.Schema({
    title: { type: String, required: true, maxlength: 50 },
    content: { type: String, required: true, maxlength: 10000 },
    authour: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    editedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', date: { type: Date, default: Date.now() } },
    locked: { type: Boolean, default: false },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Forum_Category', required: true },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Forum_Comment' }]
},
    { timestamps: true }
);


module.exports = mongoose.model('Forum_Post', forumPostSchema);