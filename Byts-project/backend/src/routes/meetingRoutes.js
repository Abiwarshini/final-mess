const express = require('express');
const router = express.Router();
const { getMeetings, createMeeting, updateMeeting, deleteMeeting, submitRsvp } = require('../controllers/meetingController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getMeetings)
    .post(protect, createMeeting);

router.route('/:id')
    .put(protect, updateMeeting)
    .delete(protect, deleteMeeting);

router.route('/:id/rsvp')
    .post(protect, submitRsvp);

module.exports = router;
