const mongoose = require('mongoose');

const weekSchema = mongoose.Schema({
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        enum: ['Voting Open', 'Voting Closed', 'Finalized'],
        default: 'Voting Open',
    },
    // Finalized menu storage
    finalizedMenu: {
        Monday: { Breakfast: String, Lunch: String, Dinner: String },
        Tuesday: { Breakfast: String, Lunch: String, Dinner: String },
        Wednesday: { Breakfast: String, Lunch: String, Dinner: String },
        Thursday: { Breakfast: String, Lunch: String, Dinner: String },
        Friday: { Breakfast: String, Lunch: String, Dinner: String },
        Saturday: { Breakfast: String, Lunch: String, Dinner: String },
        Sunday: { Breakfast: String, Lunch: String, Dinner: String },
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
    timestamps: true,
});

const Week = mongoose.model('Week', weekSchema);
module.exports = Week;
