const Volunteering = require('../models/Volunteering');

const getVolunteering = async (req, res) => {
    try {
        const { hostel } = req.user;
        const volunteering = await Volunteering.find({ hostel }).sort({ createdAt: -1 });
        // Convert to plain objects to include virtuals
        const result = volunteering.map(v => v.toJSON ? v.toJSON() : v);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createVolunteering = async (req, res) => {
    try {
        const { purpose, description, membersNeeded, startDate, endDate } = req.body;
        const { hostel, name, _id } = req.user;

        const volunteering = new Volunteering({
            hostel,
            createdBy: name,
            createdById: _id,
            purpose,
            description,
            membersNeeded,
            startDate,
            endDate
        });

        const createdVolunteering = await volunteering.save();
        res.status(201).json(createdVolunteering.toJSON ? createdVolunteering.toJSON() : createdVolunteering);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const registerVolunteer = async (req, res) => {
    try {
        const { studentName, roomNo, mobileNo } = req.body;
        const userId = req.user._id || req.user.id;
        const volunteering = await Volunteering.findById(req.params.id);

        if (!volunteering) {
            return res.status(404).json({ message: 'Volunteering not found' });
        }

        // Check if student already registered
        const existingReg = volunteering.registrations.find(r => r.studentId === userId.toString());
        if (existingReg) {
            return res.status(400).json({ message: 'Already registered' });
        }

        // Check if slots available
        if (volunteering.registrations.length >= volunteering.membersNeeded) {
            return res.status(400).json({ message: 'No slots available' });
        }

        volunteering.registrations.push({
            studentId: userId.toString(),
            studentName,
            roomNo,
            mobileNo,
            registeredAt: new Date()
        });

        const updatedVolunteering = await volunteering.save();
        res.json(updatedVolunteering.toJSON ? updatedVolunteering.toJSON() : updatedVolunteering);
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: error.message });
    }
};

const cancelRegistration = async (req, res) => {
    try {
        const { studentId } = req.body;
        const volunteering = await Volunteering.findById(req.params.id);

        if (!volunteering) {
            return res.status(404).json({ message: 'Volunteering not found' });
        }

        volunteering.registrations = volunteering.registrations.filter(r => r.studentId !== studentId);
        const updatedVolunteering = await volunteering.save();
        res.json(updatedVolunteering.toJSON ? updatedVolunteering.toJSON() : updatedVolunteering);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getVolunteering, createVolunteering, registerVolunteer, cancelRegistration };
