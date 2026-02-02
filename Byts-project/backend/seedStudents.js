const mongoose = require('mongoose');
const User = require('./src/models/User');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const dummyStudents = [
    {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'student',
        hostel: 'Kaveri Hostel',
        rollNo: '23CSR001',
        hasRoom: false
    },
    {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'password123',
        role: 'student',
        hostel: 'Kaveri Hostel',
        rollNo: '23CSR002',
        hasRoom: false
    },
    {
        name: 'Bob Wilson',
        email: 'bob@example.com',
        password: 'password123',
        role: 'student',
        hostel: 'Kaveri Hostel',
        rollNo: '23CSR003',
        hasRoom: false
    }
];

const seedStudents = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hostelmess');

        for (const student of dummyStudents) {
            // Check if student exists
            const exists = await User.findOne({ email: student.email });
            if (!exists) {
                const hashedPassword = await bcrypt.hash(student.password, 10);
                await User.create({ ...student, password: hashedPassword });
                console.log(`Created student: ${student.name}`);
            }
        }

        console.log('Dummy students seeded successfully');
        process.exit();
    } catch (error) {
        console.error('Error seeding students:', error);
        process.exit(1);
    }
};

seedStudents();
