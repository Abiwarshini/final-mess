const mongoose = require('mongoose');
const User = require('./src/models/User');
const dotenv = require('dotenv');

dotenv.config();

const cleanAndList = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hostel-management');

        // Remove dummy students
        const res = await User.deleteMany({ email: { $in: ['john@example.com', 'jane@example.com', 'bob@example.com'] } });
        console.log(`Removed ${res.deletedCount} dummy students.`);

        const students = await User.find({ role: 'student' });
        console.log(`Total students in DB: ${students.length}`);

        students.forEach(s => {
            console.log(`- ${s.name} (${s.email}) | Hostel: ${s.hostel} | Roll: ${s.rollNo}`);
        });

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

cleanAndList();
