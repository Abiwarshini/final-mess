const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['student', 'warden', 'caretaker'], required: true },
    hostel: { type: String, required: true },
    // Student Specific
    rollNo: { type: String },
    room: { type: String },
    parentName: { type: String },
    parentContact: { type: String },
    dept: { type: String },
    year: { type: String },
    // Warden Specific
    wardenType: { type: String }, // 'assistant' or 'deputy'
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
