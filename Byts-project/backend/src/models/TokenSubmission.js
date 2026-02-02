const mongoose = require('mongoose');

const tokenSubmissionSchema = new mongoose.Schema({
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    responses: [{
        question: { type: String, required: true },
        answer: { type: String, required: true }
    }],
    submittedAt: { type: Date, default: Date.now }
});

// Ensure a student can only submit once per event
tokenSubmissionSchema.index({ eventId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('TokenSubmission', tokenSubmissionSchema);
