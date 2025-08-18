require('dotenv').config();
const mongoose = require('mongoose');
const Room = require('./models/Room');

const rooms = [
  // Standard Rooms
  { roomNumber: 'S001', roomType: 'standard', maxGuests: 2, pricePerNight: 120 },
  { roomNumber: 'S002', roomType: 'standard', maxGuests: 2, pricePerNight: 120 },
  { roomNumber: 'S003', roomType: 'standard', maxGuests: 2, pricePerNight: 120 },
  
  // Deluxe Rooms
  { roomNumber: 'D001', roomType: 'deluxe', maxGuests: 3, pricePerNight: 180 },
  { roomNumber: 'D002', roomType: 'deluxe', maxGuests: 3, pricePerNight: 180 },
  { roomNumber: 'D003', roomType: 'deluxe', maxGuests: 3, pricePerNight: 180 },
  
  // Suite Rooms
  { roomNumber: 'SU01', roomType: 'suite', maxGuests: 4, pricePerNight: 250 },
  { roomNumber: 'SU02', roomType: 'suite', maxGuests: 4, pricePerNight: 250 },
  
  // Family Rooms
  { roomNumber: 'F001', roomType: 'family', maxGuests: 6, pricePerNight: 300 },
  { roomNumber: 'F002', roomType: 'family', maxGuests: 6, pricePerNight: 300 },
  
  // Romantic Rooms
  { roomNumber: 'R001', roomType: 'romantic', maxGuests: 2, pricePerNight: 220 },
  { roomNumber: 'R002', roomType: 'romantic', maxGuests: 2, pricePerNight: 220 },
  
  // Adventure Rooms
  { roomNumber: 'A001', roomType: 'adventure', maxGuests: 4, pricePerNight: 200 },
  { roomNumber: 'A002', roomType: 'adventure', maxGuests: 4, pricePerNight: 200 }
];

async function seedRooms() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Clear existing rooms
    await Room.deleteMany({});
    console.log('Cleared existing rooms');
    
    // Insert new rooms
    await Room.insertMany(rooms);
    console.log('Rooms seeded successfully');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding rooms:', error);
    process.exit(1);
  }
}

seedRooms();