var mongoose = require('mongoose');

var forumCategorySchema = mongoose.Schema({
    title: { type: String, maxlength: 50, required: true },
    path: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    editedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    editedAt: { type: Date, default: Date.now },
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Forum_Post' }]
},
    { timestamps: true }
);


module.exports = mongoose.model('Forum_Category', forumCategorySchema);