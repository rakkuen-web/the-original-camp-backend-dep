const mongoose = require('mongoose');
const Room = require('./models/Room');
const RoomType = require('./models/RoomType');
require('dotenv').config();

async function initializeRooms() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get room types to reference their IDs
    const roomTypes = await RoomType.find();
    console.log('Found room types:', roomTypes.length);
    
    if (roomTypes.length === 0) {
      console.log('No room types found. Please run init-room-types.js first.');
      process.exit(1);
    }
    
    const roomTypeMap = {};
    roomTypes.forEach(rt => {
      roomTypeMap[rt.type] = rt._id;
      console.log(`Room type: ${rt.type} -> ${rt._id}`);
    });

    // Clear existing rooms
    await Room.deleteMany({});
    console.log('Cleared existing rooms');

    const rooms = [
      // Desert Standard (4 rooms) - maxOccupancy: 2
      { roomNumber: 'DS-001', roomTypeId: roomTypeMap['standard'], maxGuests: 2, status: 'available' },
      { roomNumber: 'DS-002', roomTypeId: roomTypeMap['standard'], maxGuests: 2, status: 'occupied' },
      { roomNumber: 'DS-003', roomTypeId: roomTypeMap['standard'], maxGuests: 2, status: 'available' },
      { roomNumber: 'DS-004', roomTypeId: roomTypeMap['standard'], maxGuests: 2, status: 'cleaning' },

      // Desert Deluxe (4 rooms) - maxOccupancy: 3
      { roomNumber: 'DD-001', roomTypeId: roomTypeMap['deluxe'], maxGuests: 3, status: 'available' },
      { roomNumber: 'DD-002', roomTypeId: roomTypeMap['deluxe'], maxGuests: 3, status: 'occupied' },
      { roomNumber: 'DD-003', roomTypeId: roomTypeMap['deluxe'], maxGuests: 3, status: 'available' },
      { roomNumber: 'DD-004', roomTypeId: roomTypeMap['deluxe'], maxGuests: 3, status: 'maintenance' },

      // Desert Suite (3 rooms) - maxOccupancy: 4
      { roomNumber: 'DSU-001', roomTypeId: roomTypeMap['suite'], maxGuests: 4, status: 'available' },
      { roomNumber: 'DSU-002', roomTypeId: roomTypeMap['suite'], maxGuests: 4, status: 'occupied' },
      { roomNumber: 'DSU-003', roomTypeId: roomTypeMap['suite'], maxGuests: 4, status: 'available' },

      // Family Desert Tent (3 rooms) - maxOccupancy: 6
      { roomNumber: 'FT-001', roomTypeId: roomTypeMap['family'], maxGuests: 6, status: 'available' },
      { roomNumber: 'FT-002', roomTypeId: roomTypeMap['family'], maxGuests: 6, status: 'occupied' },
      { roomNumber: 'FT-003', roomTypeId: roomTypeMap['family'], maxGuests: 6, status: 'available' },

      // Romantic Hideaway (3 rooms) - maxOccupancy: 2
      { roomNumber: 'RH-001', roomTypeId: roomTypeMap['romantic'], maxGuests: 2, status: 'available' },
      { roomNumber: 'RH-002', roomTypeId: roomTypeMap['romantic'], maxGuests: 2, status: 'occupied' },
      { roomNumber: 'RH-003', roomTypeId: roomTypeMap['romantic'], maxGuests: 2, status: 'available' },

      // Adventure Base (3 rooms) - maxOccupancy: 4
      { roomNumber: 'AB-001', roomTypeId: roomTypeMap['adventure'], maxGuests: 4, status: 'available' },
      { roomNumber: 'AB-002', roomTypeId: roomTypeMap['adventure'], maxGuests: 4, status: 'available' },
      { roomNumber: 'AB-003', roomTypeId: roomTypeMap['adventure'], maxGuests: 4, status: 'cleaning' }
    ];

    // Insert rooms
    await Room.insertMany(rooms);
    console.log(`${rooms.length} rooms initialized successfully`);

    process.exit(0);
  } catch (error) {
    console.error('Error initializing rooms:', error);
    process.exit(1);
  }
}

initializeRooms();