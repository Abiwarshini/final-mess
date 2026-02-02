const mongoose = require('mongoose');

const pollSchema = new mongoose.Schema({
    hostel: { type: String, required: true },
    createdBy: { type: String, required: true }, // Caretaker/Warden name
    createdById: { type: String, required: true }, // Caretaker/Warden ID
    question: { type: String, required: true },
    description: { type: String },
    options: [String], // Array of poll options
    responses: [{
        studentId: String,
        studentName: String,
        roomNo: String,
        userType: String, // 'student' or 'volunteer'
        selectedOption: String,
        respondedAt: { type: Date, default: Date.now }
    }],
    status: { type: String, default: 'Open' }, // Open, Closed
    startDate: String,
    endDate: String
}, { 
    timestamps: true, 
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual field to count responses
pollSchema.virtual('responseCount').get(function() {
    return this.responses.length;
});

// Virtual field to get all student IDs (for non-responders)
pollSchema.virtual('respondedStudentIds').get(function() {
    return this.responses.map(r => r.studentId);
});

module.exports = mongoose.model('Poll', pollSchema);
