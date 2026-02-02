const express = require('express');
const router = express.Router();
const LeaveRequest = require('../models/LeaveRequest');
const User = require('../models/User');

// Create a leave request (Student)
router.post('/', async (req, res) => {
    try {
        const { studentId, studentName, roomNo, outDate, inDate, outTime, inTime, reason, description } = req.body;

        const newRequest = new LeaveRequest({
            studentId,
            studentName,
            roomNo,
            outDate,
            inDate,
            outTime,
            inTime,
            reason,
            description
        });

        await newRequest.save();
        res.status(201).json(newRequest);
    } catch (error) {
        res.status(500).json({ message: 'Error creating leave request', error: error.message });
    }
});

// Get requests (Filtered by Role)
router.get('/', async (req, res) => {
    try {
        const { role, userId } = req.query;

        if (role === 'student') {
            const requests = await LeaveRequest.find({ studentId: userId }).sort({ createdAt: -1 });
            return res.json(requests);
        }

        if (role === 'warden') {
            // Wardens see all requests
            const requests = await LeaveRequest.find().sort({ createdAt: -1 });
            return res.json(requests);
        }

        if (role === 'caretaker') {
            // Caretakers see only Approved requests
            const requests = await LeaveRequest.find({ status: 'Approved' }).sort({ createdAt: -1 });
            return res.json(requests);
        }

        res.status(403).json({ message: 'Invalid role' });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching requests', error: error.message });
    }
});

// Update status (Warden)
router.put('/:id/status', async (req, res) => {
    try {
        const { status, wardenId, rejectionReason } = req.body;
        const request = await LeaveRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        if (request.status === 'Approved') {
            return res.status(400).json({ message: 'Approved requests cannot be changed' });
        }

        request.status = status;
        request.wardenActionBy = wardenId;

        if (status === 'Rejected' && rejectionReason) {
            request.rejectionReason = rejectionReason;
        }

        await request.save();
        res.json(request);
    } catch (error) {
        res.status(500).json({ message: 'Error updating status', error: error.message });
    }
});

module.exports = router;
