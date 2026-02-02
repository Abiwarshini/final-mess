const mongoose = require('mongoose');

const volunteeringSchema = new mongoose.Schema({
    hostel: { type: String, required: true },
    createdBy: { type: String, required: true }, // Caretaker/Warden name
    createdById: { type: String, required: true }, // Caretaker/Warden ID
    purpose: { type: String, required: true },
    description: { type: String },
    membersNeeded: { type: Number, required: true },
    registrations: [{
        studentId: String,
        studentName: String,
        roomNo: String,
        mobileNo: String,
        registeredAt: { type: Date, default: Date.now }
    }],
    status: { type: String, default: 'Open' }, // Open, Closed, Completed
    startDate: String,
    endDate: String
}, { 
    timestamps: true, 
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual field to count registrations
volunteeringSchema.virtual('registrationCount').get(function() {
    return this.registrations.length;
});

// Virtual field to check if slots available
volunteeringSchema.virtual('slotsAvailable').get(function() {
    return this.membersNeeded - this.registrations.length;
});

module.exports = mongoose.model('Volunteering', volunteeringSchema);
