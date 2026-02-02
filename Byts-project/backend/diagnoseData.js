const mongoose = require('mongoose');
const User = require('./src/models/User');
const Room = require('./src/models/Room');
const RoomRequest = require('./src/models/RoomRequest');
const dotenv = require('dotenv');

dotenv.config();

const diagnose = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hostelmess');

        console.log('--- Checking Users with hasRoom: true ---');
        const users = await User.find({ hasRoom: true });
        for (let user of users) {
            console.log(`User: ${user.name} (${user.email}), roomId: ${user.roomId}`);
            if (user.roomId) {
                const room = await Room.findById(user.roomId);
                if (room) {
                    console.log(`  Room found: ${room.roomNumber} in ${room.hostel}`);
                } else {
                    console.error(`  CRITICAL: Room ${user.roomId} NOT FOUND in database!`);
                }
            } else {
                console.error(`  WARNING: hasRoom is true but roomId is missing!`);
            }
        }

        console.log('\n--- Checking Rooms with isFull: true ---');
        const rooms = await Room.find({ isFull: true });
        for (let room of rooms) {
            console.log(`Room: ${room.roomNumber} (${room.hostel}), students count: ${room.students.length}`);
            for (let sId of room.students) {
                const student = await User.findById(sId);
                if (student) {
                    console.log(`  Student: ${student.name} (hasRoom: ${student.hasRoom})`);
                } else {
                    console.error(`  CRITICAL: Student ${sId} NOT FOUND in database!`);
                }
            }
        }

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

diagnose();
