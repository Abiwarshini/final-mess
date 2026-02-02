const mongoose = require('mongoose');

const finalMenuSchema = new mongoose.Schema({
    weekId: { type: mongoose.Schema.Types.ObjectId, ref: 'WeeklyMenu', required: true },
    day: { type: Number, min: 0, max: 6, required: true },
    mealType: {
        type: String,
        enum: ['breakfast', 'lunch', 'dinner'],
        required: true,
    },
    foodName: { type: String, required: true, trim: true },
    voteCount: { type: Number, default: 0 },
}, { timestamps: true });

finalMenuSchema.index({ weekId: 1, day: 1, mealType: 1 }, { unique: true });

module.exports = mongoose.model('FinalMenu', finalMenuSchema);

