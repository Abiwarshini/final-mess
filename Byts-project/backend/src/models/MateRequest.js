const mongoose = require('mongoose');

const mateRequestSchema = new mongoose.Schema({
    room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: true
    },
    initiator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    existingRoommates: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    applicants: [{
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected'],
            default: 'pending'
        },
        appliedAt: {
            type: Date,
            default: Date.now
        }
    }],
    hostel: {
        type: String,
        required: true
    },
    sharingType: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['open', 'closed', 'cancelled'],
        default: 'open'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('MateRequest', mateRequestSchema);
