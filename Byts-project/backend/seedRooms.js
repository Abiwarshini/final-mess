const mongoose = require('mongoose');
const Room = require('./src/models/Room');
const dotenv = require('dotenv');

dotenv.config();

const hostels = ['Boys', 'Girls', 'Kaveri Hostel'];
const sharingTypes = [2, 3, 4];
const roomsPerType = 10;
const rooms = [];

hostels.forEach(hostel => {
    sharingTypes.forEach((type, index) => {
        const floor = index + 1;
        for (let i = 1; i <= roomsPerType; i++) {
            let prefix = '';
            if (hostel === 'Girls') prefix = 'G';
            else if (hostel === 'Boys') prefix = 'B';
            else if (hostel === 'Kaveri Hostel') prefix = 'K';

            const roomNum = `${prefix}${floor}${i.toString().padStart(2, '0')}`;
            rooms.push({ roomNumber: roomNum, type, hostel });
        }
    });
});

const seedRooms = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hostelmess');

        console.log('Deleting existing rooms...');
        await Room.deleteMany();

        console.log(`Inserting ${rooms.length} rooms...`);
        await Room.insertMany(rooms);

        const count = await Room.countDocuments();
        const hostelsInDB = await Room.distinct('hostel');
        console.log(`Successfully seeded ${count} rooms across: ${hostelsInDB.join(', ')}`);

        process.exit();
    } catch (error) {
        console.error('Error seeding rooms:', error);
        process.exit(1);
    }
};

seedRooms();
