require('dotenv').config();
const mongoose = require('mongoose');
const Room = require('./models/Room');

async function checkRooms() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
    
    // Check rooms
    const rooms = await Room.find();
    console.log(`Found ${rooms.length} rooms:`);
    rooms.forEach(room => {
      console.log(`  ${room.roomNumber} (${room.roomType}) - ${room.maxGuests} guests, $${room.pricePerNight}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkRooms();