const Complaint = require('../models/Complaint');

const getComplaints = async (req, res) => {
    try {
        const { role, hostel, _id } = req.user;
        let complaints;

        if (role === 'warden' || role === 'caretaker') {
            complaints = await Complaint.find({ hostel }).sort({ createdAt: -1 });
        } else {
            complaints = await Complaint.find({ studentId: _id }).sort({ createdAt: -1 });
        }

        res.json(complaints);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createComplaint = async (req, res) => {
    try {
        const { category, description, isAnonymous } = req.body;
        const { _id, name, hostel } = req.user;

        const complaint = new Complaint({
            studentId: _id,
            studentName: name, // We store name but hide it in frontend if anonymous, or use isAnonymous check here if backend should sanitize
            hostel,
            category,
            description,
            isAnonymous
        });

        const createdComplaint = await complaint.save();
        res.status(201).json(createdComplaint);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const replyToComplaint = async (req, res) => {
    try {
        const { text } = req.body;
        const { name, role, wardenType } = req.user;

        const complaint = await Complaint.findById(req.params.id);

        if (complaint) {
            const reply = {
                responderName: name,
                responderRole: wardenType ? `${wardenType} Warden` : role,
                text
            };

            complaint.replies.push(reply);
            complaint.status = 'Resolved';

            const updatedComplaint = await complaint.save();
            res.json(updatedComplaint);
        } else {
            res.status(404).json({ message: 'Complaint not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getComplaints, createComplaint, replyToComplaint };
