var mongoose = require('mongoose');

var newsSchema = mongoose.Schema({
        title: { type: String, maxlength: 100, required: true },
        content: { type: String, maxlength: 5000, required: true },
        authour: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        editedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        editedAt: { type: Date, default: Date.now }, 
        comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'News_Comment' }]
    },
    { timestamps: true }
);


module.exports = mongoose.model('News', newsSchema);