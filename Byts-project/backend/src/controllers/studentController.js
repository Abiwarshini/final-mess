const User = require('../models/User');

const getStudents = async (req, res) => {
    try {
        const { hostel, role } = req.user;

        // Only wardens or caretakers should access this (already protected by authMiddleware, but good to check role)
        if (role !== 'warden' && role !== 'caretaker') {
            return res.status(403).json({ message: 'Not authorized to view student list' });
        }

        // 1. Primary Search: Case-insensitive, partial match of the full string
        let students = await User.find({
            hostel: { $regex: hostel.trim(), $options: 'i' },
            role: 'student'
        }).select('-password');

        // 2. Fallback Search: If no students found, try matching the first word (e.g., "Kaveri" from "Kaveri Hostel")
        if (students.length === 0) {
            const firstWord = hostel.trim().split(' ')[0];
            if (firstWord && firstWord.length > 2) { // Avoid trivial words
                console.log(`Primary search failed. Trying fallback for: ${firstWord}`);
                students = await User.find({
                    hostel: { $regex: firstWord, $options: 'i' },
                    role: 'student'
                }).select('-password');
            }
        }

        res.json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getStudents };
