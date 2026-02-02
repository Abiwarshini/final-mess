const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const registerUser = async (req, res) => {
    try {
        const { name, email, password, role, hostel, ...otherDetails } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role,
            hostel,
            ...otherDetails
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                hostel: user.hostel,
                token: generateToken(user._id)
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const authUser = async (req, res) => {
    try {
        const { email, password, role } = req.body;
        const user = await User.findOne({ email });

        const logFailure = (reason) => {
            const logMessage = `[${new Date().toISOString()}] Failed login attempt: ${email} (${reason})\n`;
            const logPath = path.join(__dirname, '../../security.log');
            console.warn(logMessage.trim());
            fs.appendFileSync(logPath, logMessage);
        };

        // Check password and role
        if (user && (await bcrypt.compare(password, user.password))) {
            // Optional: Strict role check
            if (role && user.role !== role) {
                logFailure('Role mismatch');
                return res.status(401).json({ message: 'Role mismatch' });
            }

            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                hostel: user.hostel,
                wardenType: user.wardenType,
                token: generateToken(user._id)
            });
        } else {
            logFailure('Invalid email or password');
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
        expiresIn: '30d',
    });
};

module.exports = { registerUser, authUser, getMe };
