const mongoose = require('mongoose');

const leaveRequestSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    studentName: { type: String, required: true },
    roomNo: { type: String, required: true },
    outDate: { type: Date, required: true },
    inDate: { type: Date, required: true },
    outTime: { type: String, required: true },
    inTime: { type: String, required: true },
    reason: { type: String, required: true, maxlength: 100 }, // Reason of 1 line
    description: { type: String, required: true, maxlength: 500 }, // Description of 5 lines (approx)
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected', 'Hold'],
        default: 'Pending'
    },
    wardenActionBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rejectionReason: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('LeaveRequest', leaveRequestSchema);
