var mongoose = require('mongoose');

var forumPostSchema = mongoose.Schema({
    title: {type: String, required: true },
    content: {type: String, required: true},
    authour: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
},
    {
        timestamps: true
    });


module.exports = mongoose.model('Forum', forumPostSchema);