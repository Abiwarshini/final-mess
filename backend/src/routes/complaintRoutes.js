const express = require('express');
const router = express.Router();
const { getComplaints, createComplaint, replyToComplaint } = require('../controllers/complaintController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getComplaints)
    .post(protect, createComplaint);

router.route('/:id/reply')
    .post(protect, replyToComplaint);

module.exports = router;
