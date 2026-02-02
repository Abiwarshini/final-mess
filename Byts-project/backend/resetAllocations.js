const mongoose = require('mongoose');
const User = require('./src/models/User');
const Room = require('./src/models/Room');
const RoomRequest = require('./src/models/RoomRequest');
const dotenv = require('dotenv');

dotenv.config();

const resetAll = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hostelmess');

        const userRes = await User.updateMany({}, { $set: { hasRoom: false, roomId: null } });
        console.log(`Reset ${userRes.modifiedCount} users.`);

        const roomRes = await Room.updateMany({}, { $set: { isFull: false, students: [] } });
        console.log(`Cleared ${roomRes.modifiedCount} rooms.`);

        const requestRes = await RoomRequest.deleteMany({});
        console.log(`Deleted ${requestRes.deletedCount} requests.`);

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};
resetAll();