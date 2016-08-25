var mongoose = require('mongoose');

var newsCommentSchema = mongoose.Schema({
        comment: { type: String, required: true, maxlength: 1000 },
        news: { type: mongoose.Schema.Types.ObjectId, ref: 'News' },
        authour: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        editedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        editedAt: { type: Date, default: Date.now }
    },
    { timestamps: true }
);


module.exports = mongoose.model('News_Comment', newsCommentSchema);