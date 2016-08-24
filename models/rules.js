var mongoose = require('mongoose');

var rulesSchema = mongoose.Schema({
        rules: { type: String, required: true },
        editedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        editedAt: { type: Date, default: Date.now }
    }
);

module.exports = mongoose.model('Rules', rulesSchema);