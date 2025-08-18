const mongoose = require('mongoose');
const RoomType = require('./models/RoomType');
require('dotenv').config();

const roomTypes = [
  {
    type: 'standard',
    name: 'Desert Standard',
    price: 120,
    total: 10,
    description: 'Comfortable elegance meets desert tranquility',
    amenities: ['Queen Bed', 'Private Bath', 'Climate Control'],
    maxOccupancy: 2,
    images: ['https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80']
  },
  {
    type: 'deluxe',
    name: 'Desert Deluxe',
    price: 180,
    total: 8,
    description: 'Spacious luxury with premium amenities',
    amenities: ['King Bed', 'Luxury Bath', 'Private Terrace'],
    maxOccupancy: 3,
    images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80']
  },
  {
    type: 'suite',
    name: 'Desert Suite',
    price: 280,
    total: 4,
    description: 'Ultimate luxury with panoramic desert views',
    amenities: ['Living Area', 'Spa Bath', 'Desert Views'],
    maxOccupancy: 4,
    images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80']
  },
  {
    type: 'family',
    name: 'Family Desert Tent',
    price: 220,
    total: 6,
    description: 'Perfect sanctuary for family adventures',
    amenities: ['Sleeps 6', 'Kids Area', '2 Bathrooms'],
    maxOccupancy: 6,
    images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80']
  },
  {
    type: 'romantic',
    name: 'Romantic Hideaway',
    price: 320,
    total: 3,
    description: 'Intimate escape for couples under the stars',
    amenities: ['Couples Only', 'Champagne', 'Candlelit'],
    maxOccupancy: 2,
    images: ['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80']
  },
  {
    type: 'adventure',
    name: 'Adventure Base',
    price: 200,
    total: 5,
    description: 'For thrill-seekers and desert explorers',
    amenities: ['Gear Storage', 'Climbing Wall', 'Maps Included'],
    maxOccupancy: 4,
    images: ['https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=800&q=80']
  }
];

async function initializeRoomTypes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing room types
    await RoomType.deleteMany({});
    console.log('Cleared existing room types');

    // Insert new room types
    await RoomType.insertMany(roomTypes);
    console.log('Room types initialized successfully');

    process.exit(0);
  } catch (error) {
    console.error('Error initializing room types:', error);
    process.exit(1);
  }
}

initializeRoomTypes();