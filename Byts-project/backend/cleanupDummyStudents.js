const mongoose = require('mongoose');
const User = require('./src/models/User');
const dotenv = require('dotenv');

dotenv.config();

const cleanup = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hostelmess');

        const dummyEmails = ['john@example.com', 'jane@example.com', 'bob@example.com'];
        const res = await User.deleteMany({ email: { $in: dummyEmails } });

        console.log(`Removed ${res.deletedCount} dummy students.`);
        process.exit(0);
    } catch (error) {
        console.error('Error during cleanup:', error);
        process.exit(1);
    }
};

cleanup();
