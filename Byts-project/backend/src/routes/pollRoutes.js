const express = require('express');
const { getPolls, createPoll, respondToPoll, getNonResponders, closePoll } = require('../controllers/pollController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/polls', authMiddleware.protect, getPolls);
router.post('/polls', authMiddleware.protect, createPoll);
router.post('/polls/:id/respond', authMiddleware.protect, respondToPoll);
router.get('/polls/:id/non-responders', authMiddleware.protect, getNonResponders);
router.post('/polls/:id/close', authMiddleware.protect, closePoll);

module.exports = router;
