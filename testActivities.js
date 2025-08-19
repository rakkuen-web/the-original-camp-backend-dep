require('dotenv').config();
const mongoose = require('mongoose');
const Activity = require('./models/Activity');

async function testActivities() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const activities = await Activity.find();
    console.log(`Found ${activities.length} activities:`);
    
    activities.forEach(activity => {
      console.log(`- ${activity.name}: ${activity.images || 'NO IMAGES'}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testActivities();