require('dotenv').config();
const mongoose = require('mongoose');
const Activity = require('./models/Activity');

async function seedActivities() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    await Activity.deleteMany({});
    console.log('Cleared existing activities');
    
    const activities = [
      {
        name: 'Camel Trekking',
        type: 'camel',
        price: 50,
        description: 'Experience the desert on camelback with our guided trekking tours',
        duration: 2,
        maxParticipants: 10
      },
      {
        name: 'Buggy Adventure',
        type: 'buggy', 
        price: 80,
        description: 'Thrilling dune buggy rides across the desert landscape',
        duration: 1.5,
        maxParticipants: 6
      },
      {
        name: 'Stargazing Experience',
        type: 'stargazing',
        price: 30,
        description: 'Guided stargazing session with telescope and desert astronomy',
        duration: 2,
        maxParticipants: 15
      },
      {
        name: 'Desert Dining',
        type: 'dining',
        price: 60,
        description: 'Traditional Moroccan dinner under the stars',
        duration: 3,
        maxParticipants: 20
      }
    ];
    
    await Activity.insertMany(activities);
    console.log(`Created ${activities.length} activities`);
    
    const createdActivities = await Activity.find();
    createdActivities.forEach(activity => {
      console.log(`  ${activity.name} - $${activity.price} (${activity.duration})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

seedActivities();