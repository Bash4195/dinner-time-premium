var mongoose = require('mongoose');

var moderatorApplicationSchema = mongoose.Schema({
        name: { type: String, maxlength: 50 },
        gender: { type: String, maxlength: 20 },
        age: { type: Number, maxlength: 3 },
        location: { type: String, maxlength: 100 },
        occupation: { type: String, maxlength: 100 },
        timePlayedGmod: { type: String, maxlength: 50 },
        howYouFoundUs: { type: String, maxlength: 1000 },
        ulxExperience: { type: String, required: true, maxlength: 11 },
        leadershipExperience: { type: String, required: true, maxlength: 10000 },
        gmodLeadershipExperience: { type: String, required: true, maxlength: 10000 },
        willingToAddUsOnSteam: { type: Boolean, required: true },
        whyWeShouldAccept: { type: String, required: true, maxlength: 10000 },
        additionalInfo: { type: String, maxlength: 10000 },

        authour: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
    },
    { timestamps: true }
);


module.exports = mongoose.model('Mod_App', moderatorApplicationSchema);