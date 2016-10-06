var mongoose = require('mongoose');

var moderatorApplicationSchema = mongoose.Schema({
        name: { type: String, maxlength: 50 },
        gender: { type: String, maxlength: 20 },
        age: { type: Number, maxlength: 3 },
        location: { type: String, maxlength: 100 },
        occupation: { type: String, maxlength: 100 },
        timePlayedGmod: { type: String, maxlength: 50 },
        howYouFoundUs: { type: String, maxlength: 1000 },
        ulxExperience: { type: String, maxlength: 11, required: true },
        leadershipExperience: { type: String, maxlength: 5000, required: true },
        gmodLeadershipExperience: { type: String, maxlength: 5000, required: true },
        willingToAddUsOnSteam: { type: Boolean, required: true },
        whyWeShouldAccept: { type: String, maxlength: 5000, required: true },
        additionalInfo: { type: String, maxlength: 5000 },

        authour: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

        status: { type: String, default: 'Under Review', required: true },
        closed: { type: Boolean, default: false },
        review: {
                warnings: Number,
                vacBans: Number,
                hours: Number,
                accepted: Boolean,
                reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
        },
        votes: [{
                vote: Boolean,
                voter: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
        }],

        comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Mod_App_Comment' }]
    },
    { timestamps: true }
);


module.exports = mongoose.model('Mod_App', moderatorApplicationSchema);