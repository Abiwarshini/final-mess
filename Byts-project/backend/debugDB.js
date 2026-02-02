const mongoose = require('mongoose');
const Room = require('./src/models/Room');
const User = require('./src/models/User');
const dotenv = require('dotenv');

dotenv.config();

const checkDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hostel-management');
        const count = await Room.countDocuments();
        console.log('Total rooms in DB:', count);

        const KaveriRooms = await Room.find({ hostel: { $regex: /Kaveri/i } }).limit(5);
        console.log('Kaveri Rooms sample:', JSON.stringify(KaveriRooms, null, 2));

        const hostels = await Room.distinct('hostel');
        console.log('Unique hostels in DB:', hostels);

        const studentsInKaveri = await User.find({ hostel: { $regex: /Kaveri/i }, role: 'student' });
        console.log('Students in Kaveri Hostel:', studentsInKaveri.length);
        if (studentsInKaveri.length > 0) {
            console.log('Sample student:', studentsInKaveri[0].name, '(', studentsInKaveri[0].rollNo, ')');
        }

        process.exit();
    } catch (error) {
        console.error('Debug error:', error);
        process.exit(1);
    }
};

checkDB();
