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
      // Desert Standard (4 rooms)
      { roomNumber: 'DS-001', roomTypeId: roomTypeMap['standard'], status: 'available', location: 'North Desert View' },
      { roomNumber: 'DS-002', roomTypeId: roomTypeMap['standard'], status: 'occupied', location: 'North Desert View' },
      { roomNumber: 'DS-003', roomTypeId: roomTypeMap['standard'], status: 'available', location: 'East Desert View' },
      { roomNumber: 'DS-004', roomTypeId: roomTypeMap['standard'], status: 'cleaning', location: 'East Desert View' },

      // Desert Deluxe (4 rooms)
      { roomNumber: 'DD-001', roomTypeId: roomTypeMap['deluxe'], status: 'available', location: 'Premium Desert View' },
      { roomNumber: 'DD-002', roomTypeId: roomTypeMap['deluxe'], status: 'occupied', location: 'Premium Desert View' },
      { roomNumber: 'DD-003', roomTypeId: roomTypeMap['deluxe'], status: 'available', location: 'Premium Desert View' },
      { roomNumber: 'DD-004', roomTypeId: roomTypeMap['deluxe'], status: 'maintenance', location: 'Premium Desert View' },

      // Desert Suite (3 rooms)
      { roomNumber: 'DSU-001', roomTypeId: roomTypeMap['suite'], status: 'available', location: 'Luxury Desert View' },
      { roomNumber: 'DSU-002', roomTypeId: roomTypeMap['suite'], status: 'occupied', location: 'Luxury Desert View' },
      { roomNumber: 'DSU-003', roomTypeId: roomTypeMap['suite'], status: 'available', location: 'Luxury Desert View' },

      // Family Desert Tent (3 rooms)
      { roomNumber: 'FT-001', roomTypeId: roomTypeMap['family'], status: 'available', location: 'Family Area' },
      { roomNumber: 'FT-002', roomTypeId: roomTypeMap['family'], status: 'occupied', location: 'Family Area' },
      { roomNumber: 'FT-003', roomTypeId: roomTypeMap['family'], status: 'available', location: 'Family Area' },

      // Romantic Hideaway (3 rooms)
      { roomNumber: 'RH-001', roomTypeId: roomTypeMap['romantic'], status: 'available', location: 'Private Desert View' },
      { roomNumber: 'RH-002', roomTypeId: roomTypeMap['romantic'], status: 'occupied', location: 'Private Desert View' },
      { roomNumber: 'RH-003', roomTypeId: roomTypeMap['romantic'], status: 'available', location: 'Private Desert View' },

      // Adventure Base (3 rooms)
      { roomNumber: 'AB-001', roomTypeId: roomTypeMap['adventure'], status: 'available', location: 'Adventure Zone' },
      { roomNumber: 'AB-002', roomTypeId: roomTypeMap['adventure'], status: 'available', location: 'Adventure Zone' },
      { roomNumber: 'AB-003', roomTypeId: roomTypeMap['adventure'], status: 'cleaning', location: 'Adventure Zone' }
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