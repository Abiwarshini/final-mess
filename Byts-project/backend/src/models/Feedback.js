const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  studentName: { type: String },
  hostel: { type: String },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comments: { type: String },
  isAnonymous: { type: Boolean, default: false },
  topic: { type: String, default: 'General' },
  menuItem: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);