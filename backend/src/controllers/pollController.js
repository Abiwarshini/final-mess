const Poll = require('../models/Poll');
const User = require('../models/User');

const getPolls = async (req, res) => {
    try {
        const { hostel } = req.user;
        const polls = await Poll.find({ hostel }).sort({ createdAt: -1 });
        const result = polls.map(p => p.toJSON ? p.toJSON() : p);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createPoll = async (req, res) => {
    try {
        const { question, description, options, startDate, endDate } = req.body;
        const { hostel, name, _id } = req.user;

        const poll = new Poll({
            hostel,
            createdBy: name,
            createdById: _id,
            question,
            description,
            options,
            startDate,
            endDate
        });

        const createdPoll = await poll.save();
        res.status(201).json(createdPoll.toJSON ? createdPoll.toJSON() : createdPoll);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const respondToPoll = async (req, res) => {
    try {
        const { studentName, roomNo, selectedOption, userType } = req.body;
        const userId = req.user._id || req.user.id;
        const poll = await Poll.findById(req.params.id);

        if (!poll) {
            return res.status(404).json({ message: 'Poll not found' });
        }

        // Check if student already responded
        const existingResponse = poll.responses.find(r => r.studentId === userId.toString());
        if (existingResponse) {
            return res.status(400).json({ message: 'Already responded to this poll' });
        }

        // Check if option is valid
        if (!poll.options.includes(selectedOption)) {
            return res.status(400).json({ message: 'Invalid poll option' });
        }

        poll.responses.push({
            studentId: userId.toString(),
            studentName,
            roomNo,
            userType: userType || 'student',
            selectedOption,
            respondedAt: new Date()
        });

        const updatedPoll = await poll.save();
        res.json(updatedPoll.toJSON ? updatedPoll.toJSON() : updatedPoll);
    } catch (error) {
        console.error('Response error:', error);
        res.status(500).json({ message: error.message });
    }
};

const getNonResponders = async (req, res) => {
    try {
        const poll = await Poll.findById(req.params.id);
        if (!poll) {
            return res.status(404).json({ message: 'Poll not found' });
        }

        const { hostel } = req.user;
        const respondedStudentIds = poll.responses.map(r => r.studentId);
        
        // Get all students from the hostel
        const allStudents = await User.find({ hostel, role: 'student' });
        
        // Filter students who haven't responded
        const nonResponders = allStudents.filter(
            student => !respondedStudentIds.includes(student._id.toString())
        ).map(s => ({
            name: s.name,
            roomNo: s.roomNo,
            mobileNo: s.mobileNo,
            email: s.email
        }));

        res.json({
            totalStudents: allStudents.length,
            respondents: poll.responses.length,
            nonResponders: nonResponders,
            nonResponderCount: nonResponders.length
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const closePoll = async (req, res) => {
    try {
        const poll = await Poll.findById(req.params.id);
        if (!poll) {
            return res.status(404).json({ message: 'Poll not found' });
        }

        poll.status = 'Closed';
        const updatedPoll = await poll.save();
        res.json(updatedPoll.toJSON ? updatedPoll.toJSON() : updatedPoll);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getPolls, createPoll, respondToPoll, getNonResponders, closePoll };
