const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Event = require('./src/models/Event');

dotenv.config();

const seedEvents = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hostel-management');
        console.log('Connected to MongoDB');

        const testEvent = new Event({
            title: 'Welcome Party 2026',
            description: 'A grand welcome party for all new students! Music, Food, and Fun.',
            date: new Date('2026-02-10'),
            time: '18:00',
            volunteersNeeded: true,
            eventType: 'Cultural',
            createdBy: new mongoose.Types.ObjectId() // Random ID just for display
        });

        await testEvent.save();
        console.log('Test Event Added!');
        process.exit();
    } catch (error) {
        console.error('Error seeding event:', error);
        process.exit(1);
    }
};

seedEvents();
