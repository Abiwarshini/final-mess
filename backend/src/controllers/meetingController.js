const Meeting = require('../models/Meeting');

const getMeetings = async (req, res) => {
    try {
        const { hostel } = req.user;
        if (!hostel) {
            return res.status(400).json({ message: 'User hostel not defined' });
        }
        const meetings = await Meeting.find({ hostel }).sort({ date: 1, time: 1 });
        res.json(meetings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createMeeting = async (req, res) => {
    try {
        const { date, time, venue, members } = req.body;
        const { hostel } = req.user;

        const meeting = new Meeting({
            date,
            time,
            venue,
            members,
            hostel
        });

        const createdMeeting = await meeting.save();
        res.status(201).json(createdMeeting);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateMeeting = async (req, res) => {
    try {
        const { date, time, venue, members } = req.body;
        const meeting = await Meeting.findById(req.params.id);

        if (meeting) {
            meeting.date = date || meeting.date;
            meeting.time = time || meeting.time;
            meeting.venue = venue || meeting.venue;
            meeting.members = members || meeting.members;
            meeting.status = 'Rescheduled';

            const updatedMeeting = await meeting.save();
            res.json(updatedMeeting);
        } else {
            res.status(404).json({ message: 'Meeting not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteMeeting = async (req, res) => {
    try {
        const meeting = await Meeting.findById(req.params.id);
        if (meeting) {
            await meeting.deleteOne();
            res.json({ message: 'Meeting removed' });
        } else {
            res.status(404).json({ message: 'Meeting not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const submitRsvp = async (req, res) => {
    try {
        const { studentId, studentName, attending } = req.body;
        const meeting = await Meeting.findById(req.params.id);

        if (!meeting) {
            return res.status(404).json({ message: 'Meeting not found' });
        }

        // Check if student already responded
        const existingRsvp = meeting.rsvps.find(r => r.studentId === studentId);
        
        if (existingRsvp) {
            // Update existing response
            existingRsvp.attending = attending;
            existingRsvp.respondedAt = new Date();
        } else {
            // Add new response
            meeting.rsvps.push({
                studentId: studentId || 'unknown',
                studentName: studentName || 'Anonymous',
                attending,
                respondedAt: new Date()
            });
        }

        const updatedMeeting = await meeting.save();
        res.json(updatedMeeting);
    } catch (error) {
        console.error('RSVP Error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getMeetings, createMeeting, updateMeeting, deleteMeeting, submitRsvp };
