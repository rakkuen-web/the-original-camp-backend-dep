const mongoose = require('mongoose');
const RoomType = require('./models/RoomType');
const Activity = require('./models/Activity');

async function initializeDatabase() {
  try {
    // Initialize Room Types
    const roomTypes = [
      {
        name: 'Desert Standard',
        type: 'standard',
        price: 120,
        maxGuests: 2,
        totalRooms: 8,
        description: 'Comfortable tent with essential amenities',
        amenities: ['Queen Bed', 'Private Bathroom', 'AC']
      },
      {
        name: 'Desert Deluxe',
        type: 'deluxe',
        price: 180,
        maxGuests: 3,
        totalRooms: 6,
        description: 'Spacious tent with premium amenities',
        amenities: ['King Bed', 'Luxury Bath', 'Terrace']
      },
      {
        name: 'Desert Suite',
        type: 'suite',
        price: 280,
        maxGuests: 4,
        totalRooms: 4,
        description: 'Ultimate luxury with panoramic views',
        amenities: ['Living Area', 'Spa Bath', 'Desert View']
      },
      {
        name: 'Family Desert Tent',
        type: 'family',
        price: 220,
        maxGuests: 6,
        totalRooms: 5,
        description: 'Perfect for families with children',
        amenities: ['Sleeps 6', 'Kids Area', '2 Bathrooms']
      },
      {
        name: 'Romantic Hideaway',
        type: 'romantic',
        price: 320,
        maxGuests: 2,
        totalRooms: 3,
        description: 'Intimate setting for couples',
        amenities: ['Couples Only', 'Champagne', 'Candles']
      },
      {
        name: 'Adventure Base',
        type: 'adventure',
        price: 200,
        maxGuests: 4,
        totalRooms: 4,
        description: 'For thrill-seekers and explorers',
        amenities: ['Gear Storage', 'Climbing Wall', 'Maps Included']
      }
    ];

    // Initialize Activities
    const activities = [
      {
        name: 'Camel Trekking',
        type: 'camel',
        price: 50,
        duration: 2,
        maxParticipants: 20,
        description: 'Traditional desert journey at sunset',
        availableSlots: [
          { time: '06:00', maxBookings: 10 },
          { time: '17:00', maxBookings: 10 }
        ]
      },
      {
        name: 'Buggy Adventure',
        type: 'buggy',
        price: 80,
        duration: 1.5,
        maxParticipants: 12,
        description: 'Thrilling rides across sand dunes',
        availableSlots: [
          { time: '09:00', maxBookings: 6 },
          { time: '14:00', maxBookings: 6 }
        ]
      },
      {
        name: 'Stargazing Experience',
        type: 'stargazing',
        price: 30,
        duration: 2,
        maxParticipants: 30,
        description: 'Astronomical wonders under clear skies',
        availableSlots: [
          { time: '20:00', maxBookings: 15 },
          { time: '22:00', maxBookings: 15 }
        ]
      },
      {
        name: 'Desert Dining',
        type: 'dining',
        price: 60,
        duration: 2,
        maxParticipants: 40,
        description: 'Authentic Moroccan cuisine experience',
        availableSlots: [
          { time: '19:00', maxBookings: 20 },
          { time: '21:00', maxBookings: 20 }
        ]
      }
    ];

    // Clear existing data
    await RoomType.deleteMany({});
    await Activity.deleteMany({});

    // Insert new data
    await RoomType.insertMany(roomTypes);
    await Activity.insertMany(activities);

    console.log('Database initialized successfully!');
    console.log(`Created ${roomTypes.length} room types`);
    console.log(`Created ${activities.length} activities`);

  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

module.exports = initializeDatabase;