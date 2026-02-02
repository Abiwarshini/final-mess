const mongoose = require('mongoose');

const menuOptionSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    weekId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Week',
        required: true,
    },
    day: {
        type: String, // 'Monday', 'Tuesday', etc.
        required: true,
    },
    meal: {
        type: String, // 'Breakfast', 'Lunch', 'Dinner'
        required: true,
    },
    votes: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
});

const MenuOption = mongoose.model('MenuOption', menuOptionSchema);
module.exports = MenuOption;
