const mongoose = require('mongoose');

const weeklyMenuSchema = new mongoose.Schema({
    weekStartDate: { type: Date, required: true, unique: true },
    status: {
        type: String,
        enum: ['VOTING', 'FINALIZED'],
        default: 'VOTING',
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('WeeklyMenu', weeklyMenuSchema);

