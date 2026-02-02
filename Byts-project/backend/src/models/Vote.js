const mongoose = require('mongoose');

const voteSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    weekId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Week',
        required: true,
    },
    day: {
        type: String,
        required: true,
    },
    meal: {
        type: String,
        required: true,
    },
    menuOptionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MenuOption',
        required: true,
    },
}, {
    timestamps: true,
});

// Ensure a user can only vote once per meal per day per week
voteSchema.index({ user: 1, weekId: 1, day: 1, meal: 1 }, { unique: true });

const Vote = mongoose.model('Vote', voteSchema);
module.exports = Vote;
