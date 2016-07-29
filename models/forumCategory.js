var mongoose = require('mongoose');

var forumCategorySchema = mongoose.Schema({
    title: {type: String, required: true },
    description: {type: String, required: true},
    icon: {type: String, required: true},
    path: {type: String, required: true},
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    editedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Forum_Post' }]
},
{ timestamps: true });


module.exports = mongoose.model('Forum_Category', forumCategorySchema);