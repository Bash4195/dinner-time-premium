var mongoose = require('mongoose');

var rulesSchema = mongoose.Schema({
        rules: { type: String, maxlength: 50000, required: true },
        editedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        editedAt: { type: Date, default: Date.now }
    }
);

module.exports = mongoose.model('Rules', rulesSchema);