const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

async function deleteDummies() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hostelmess');
    const result = await User.deleteMany({
      email: { $in: ['john@example.com', 'jane@example.com', 'bob@example.com'] }
    });
    console.log('✅ Deleted:', result.deletedCount, 'dummy students');
    process.exit();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

deleteDummies();
