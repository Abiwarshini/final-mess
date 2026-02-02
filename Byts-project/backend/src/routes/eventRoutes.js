const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const TokenSubmission = require('../models/TokenSubmission');

// Create Event
router.post('/', async (req, res) => {
    try {
        const { title, description, date, time, volunteersNeeded, tokenRequired, eventType, createdBy } = req.body;

        const newEvent = new Event({
            title,
            description,
            date,
            time,
            volunteersNeeded,
            tokenRequired,
            eventType,
            createdBy
        });

        await newEvent.save();
        res.status(201).json(newEvent);
    } catch (error) {
        res.status(500).json({ message: 'Error creating event', error: error.message });
    }
});

// Get All Events
router.get('/', async (req, res) => {
    try {
        console.log('GET /api/events called');
        const events = await Event.find().sort({ date: 1 });
        console.log('Events found:', events.length);
        res.json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ message: 'Error fetching events', error: error.message });
    }
});

// Update Token Config
router.put('/:id/token-config', async (req, res) => {
    try {
        const { tokenConfig } = req.body;
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        event.tokenConfig = tokenConfig;
        await event.save();
        res.json(event);
    } catch (error) {
        res.status(500).json({ message: 'Error updating token config', error: error.message });
    }
});

// Submit Token Answers (Student)
router.post('/:id/token-submit', async (req, res) => {
    try {
        const { studentId, responses } = req.body;
        const eventId = req.params.id;

        const submission = new TokenSubmission({
            eventId,
            studentId,
            responses
        });

        await submission.save();
        res.status(201).json({ message: 'Token submitted successfully' });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'You have already submitted for this event.' });
        }
        res.status(500).json({ message: 'Error submitting token', error: error.message });
    }
});

// Check if Student Submitted
router.get('/:id/token-status/:studentId', async (req, res) => {
    try {
        const submission = await TokenSubmission.findOne({
            eventId: req.params.id,
            studentId: req.params.studentId
        });
        res.json({ submitted: !!submission });
    } catch (error) {
        res.status(500).json({ message: 'Error checking status', error: error.message });
    }
});

// Get Token Stats (Warden)
router.get('/:id/token-stats', async (req, res) => {
    try {
        const submissions = await TokenSubmission.find({ eventId: req.params.id });
        const event = await Event.findById(req.params.id);

        if (!event) return res.status(404).json({ message: 'Event not found' });

        // Initialize counts
        const stats = {};
        if (event.tokenConfig) {
            event.tokenConfig.forEach(q => {
                stats[q.question] = {};
                q.options.forEach(opt => stats[q.question][opt] = 0);
            });
        }

        // Tally responses
        submissions.forEach(sub => {
            sub.responses.forEach(r => {
                if (stats[r.question] && stats[r.question][r.answer] !== undefined) {
                    stats[r.question][r.answer]++;
                }
            });
        });

        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching stats', error: error.message });
    }
});

module.exports = router;
