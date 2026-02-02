const express = require('express');
const router = express.Router();
const { getFeedbacks, createFeedback } = require('../controllers/feedbackController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getFeedbacks)
  .post(protect, createFeedback);

module.exports = router;
