const mongoose = require('mongoose');

const WorkTransparencySchema = new mongoose.Schema({
  date: { type: Date, required: true },
  hostelName: { type: String, required: true },
  caption: { type: String, required: true },
  workType: { type: String, required: true },
  imageUrl: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('WorkTransparency', WorkTransparencySchema);
