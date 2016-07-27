var mongoose = require('mongoose');

var forumCategorySchema = mongoose.Schema({
    title: {type: String, required: true },
    description: {type: String, required: true},
    icon: {type: String, required: true},
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
},
{
    timestamps: true
});


module.exports = mongoose.model('Forum', forumCategorySchema);