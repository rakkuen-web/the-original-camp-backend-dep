const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function resetAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Delete existing admin
    await User.deleteOne({ email: 'admin@test.com' });
    console.log('Deleted existing admin');

    // Create new admin
    const admin = new User({
      email: 'admin@test.com',
      password: 'admin123',
      role: 'admin'
    });

    await admin.save();
    console.log('New admin created successfully!');
    console.log('Email: admin@test.com');
    console.log('Password: admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

resetAdmin();