const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    volunteersNeeded: { type: Boolean, default: false },
    tokenRequired: { type: Boolean, default: false },
    eventType: {
        type: String,
        required: true,
        enum: ['Cultural', 'Sports', 'Academic', 'Meeting', 'Other']
    },
    tokenConfig: [{
        question: { type: String, required: true },
        options: [{ type: String, required: true }]
    }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Event', eventSchema);
