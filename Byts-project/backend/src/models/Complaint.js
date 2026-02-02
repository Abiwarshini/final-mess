const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
    responderName: { type: String, required: true },
    responderRole: { type: String, required: true },
    text: { type: String, required: true },
    date: { type: Date, default: Date.now }
});

const complaintSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    studentName: { type: String, required: true }, // Store name for display, "Anonymous Student" if anon
    hostel: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    isAnonymous: { type: Boolean, default: false },
    status: { type: String, default: 'Pending' }, // Pending, Resolved
    replies: [replySchema]
}, { timestamps: true });

module.exports = mongoose.model('Complaint', complaintSchema);
