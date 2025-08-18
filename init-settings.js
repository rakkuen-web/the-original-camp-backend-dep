const mongoose = require('mongoose');
const Settings = require('./models/Settings');
require('dotenv').config();

const defaultSettings = {
  campName: 'The Original Camp',
  capacity: 50,
  tentPrices: {
    standard: 120,
    deluxe: 180,
    suite: 280,
    family: 220,
    romantic: 320,
    adventure: 200
  },
  contactInfo: {
    phone: '+212 123 456 789',
    email: 'info@originalcamp.com',
    address: 'Agafay Desert, Marrakech, Morocco'
  },
  policies: {
    checkIn: '15:00',
    checkOut: '11:00',
    cancellationPolicy: '24 hours before arrival',
    minimumStay: 1,
    maximumStay: 14
  }
};

async function initSettings() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    await Settings.deleteMany({});
    console.log('Cleared existing settings');
    
    await Settings.create(defaultSettings);
    console.log('Settings initialized successfully');
    
    process.exit(0);
  } catch (error) {
    console.error('Error initializing settings:', error);
    process.exit(1);
  }
}

initSettings();