const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
    date: { type: String, required: true },
    time: { type: String, required: true },
    venue: { type: String, required: true },
    members: { type: String, default: 'All Committee Members' },
    hostel: { type: String, required: true },
    status: { type: String, default: 'Scheduled' }, // Scheduled, Rescheduled, Cancelled
    rsvps: [{
        studentId: String,
        studentName: String,
        attending: Boolean,
        respondedAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true, toJSON: { virtuals: true } });

// Virtual field to count attending students
meetingSchema.virtual('attendingCount').get(function() {
    return this.rsvps.filter(r => r.attending).length;
});

module.exports = mongoose.model('Meeting', meetingSchema);
