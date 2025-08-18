const mongoose = require('mongoose');
const Activity = require('./models/Activity');
require('dotenv').config();

const activities = [
  {
    name: 'Camel Trekking',
    type: 'camel',
    description: 'Traditional desert journey at sunset',
    price: 50,
    duration: 120,
    maxParticipants: 10,
    available: true
  },
  {
    name: 'Buggy Adventure', 
    type: 'buggy',
    description: 'Thrilling quad bike adventure',
    price: 80,
    duration: 90,
    maxParticipants: 6,
    available: true
  },
  {
    name: 'Stargazing',
    type: 'stargazing', 
    description: 'Astronomical wonders under clear skies',
    price: 30,
    duration: 180,
    maxParticipants: 20,
    available: true
  },
  {
    name: 'Desert Dining',
    type: 'dining',
    description: 'Authentic Moroccan cuisine',
    price: 60,
    duration: 120,
    maxParticipants: 15,
    available: true
  }
];

async function initActivities() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    await Activity.deleteMany({});
    await Activity.insertMany(activities);
    console.log(`${activities.length} activities created`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

initActivities();