var mongoose = require('mongoose');

var modAppCommentSchema = mongoose.Schema({
        comment: { type: String, maxlength: 1000, required: true },
        mod_app: { type: mongoose.Schema.Types.ObjectId, ref: 'Mod_App' },
        authour: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        editedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        editedAt: { type: Date, default: Date.now }
    },
    { timestamps: true }
);


module.exports = mongoose.model('Mod_App_Comment', modAppCommentSchema);