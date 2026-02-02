const express = require('express');
const router = express.Router();
const { getVolunteering, createVolunteering, registerVolunteer, cancelRegistration } = require('../controllers/volunteeringController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getVolunteering)
    .post(protect, createVolunteering);

router.route('/:id/register')
    .post(protect, registerVolunteer);

router.route('/:id/cancel')
    .post(protect, cancelRegistration);

module.exports = router;
