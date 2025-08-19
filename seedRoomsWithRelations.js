require('dotenv').config();
const mongoose = require('mongoose');
const Room = require('./models/Room');
const RoomType = require('./models/RoomType');

async function seedRoomsWithRelations() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Clear existing rooms
    await Room.deleteMany({});
    console.log('Cleared existing rooms');
    
    // Get all room types
    const roomTypes = await RoomType.find();
    console.log('Found room types:', roomTypes.map(rt => rt.type));
    
    if (roomTypes.length === 0) {
      console.log('No room types found. Creating default room types...');
      
      const defaultRoomTypes = [
        { type: 'standard', name: 'Desert Standard', price: 120, description: 'Comfortable standard tent' },
        { type: 'deluxe', name: 'Desert Deluxe', price: 180, description: 'Spacious deluxe tent' },
        { type: 'suite', name: 'Desert Suite', price: 250, description: 'Luxury suite tent' },
        { type: 'family', name: 'Family Desert Tent', price: 300, description: 'Large family tent' },
        { type: 'romantic', name: 'Romantic Hideaway', price: 220, description: 'Romantic couple tent' },
        { type: 'adventure', name: 'Adventure Base', price: 200, description: 'Adventure-themed tent' }
      ];
      
      for (const roomTypeData of defaultRoomTypes) {
        await RoomType.create(roomTypeData);
      }
      
      // Reload room types
      const newRoomTypes = await RoomType.find();
      console.log('Created room types:', newRoomTypes.map(rt => rt.type));
    }
    
    // Get room types again
    const finalRoomTypes = await RoomType.find();
    
    // Create rooms with proper foreign key references
    const roomsToCreate = [];
    
    // Standard rooms
    const standardType = finalRoomTypes.find(rt => rt.type === 'standard');
    roomsToCreate.push(
      { roomNumber: 'S001', roomTypeId: standardType._id, maxGuests: 2 },
      { roomNumber: 'S002', roomTypeId: standardType._id, maxGuests: 2 },
      { roomNumber: 'S003', roomTypeId: standardType._id, maxGuests: 2 }
    );
    
    // Deluxe rooms
    const deluxeType = finalRoomTypes.find(rt => rt.type === 'deluxe');
    roomsToCreate.push(
      { roomNumber: 'D001', roomTypeId: deluxeType._id, maxGuests: 3 },
      { roomNumber: 'D002', roomTypeId: deluxeType._id, maxGuests: 3 },
      { roomNumber: 'D003', roomTypeId: deluxeType._id, maxGuests: 3 }
    );
    
    // Suite rooms
    const suiteType = finalRoomTypes.find(rt => rt.type === 'suite');
    roomsToCreate.push(
      { roomNumber: 'SU01', roomTypeId: suiteType._id, maxGuests: 4 },
      { roomNumber: 'SU02', roomTypeId: suiteType._id, maxGuests: 4 }
    );
    
    // Family rooms
    const familyType = finalRoomTypes.find(rt => rt.type === 'family');
    roomsToCreate.push(
      { roomNumber: 'F001', roomTypeId: familyType._id, maxGuests: 6 },
      { roomNumber: 'F002', roomTypeId: familyType._id, maxGuests: 6 }
    );
    
    // Romantic rooms
    const romanticType = finalRoomTypes.find(rt => rt.type === 'romantic');
    roomsToCreate.push(
      { roomNumber: 'R001', roomTypeId: romanticType._id, maxGuests: 2 },
      { roomNumber: 'R002', roomTypeId: romanticType._id, maxGuests: 2 }
    );
    
    // Adventure rooms
    const adventureType = finalRoomTypes.find(rt => rt.type === 'adventure');
    roomsToCreate.push(
      { roomNumber: 'A001', roomTypeId: adventureType._id, maxGuests: 4 },
      { roomNumber: 'A002', roomTypeId: adventureType._id, maxGuests: 4 }
    );
    
    // Insert all rooms
    await Room.insertMany(roomsToCreate);
    console.log(`Created ${roomsToCreate.length} rooms with proper foreign key relations`);
    
    // Verify with population
    const roomsWithTypes = await Room.find().populate('roomTypeId');
    console.log('Rooms created:');
    roomsWithTypes.forEach(room => {
      console.log(`  ${room.roomNumber} -> ${room.roomTypeId.name} ($${room.roomTypeId.price})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

seedRoomsWithRelations();