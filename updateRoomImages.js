require('dotenv').config();
const mongoose = require('mongoose');
const RoomType = require('./models/RoomType');

async function updateRoomImages() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Update all room types with room.jpg image
    const result = await RoomType.updateMany(
      {}, // Update all room types
      { $set: { images: ['room.jpg'] } }
    );
    
    console.log(`Updated ${result.modifiedCount} room types with room.jpg image`);
    
    // Verify the update
    const roomTypes = await RoomType.find();
    console.log('Room types with images:');
    roomTypes.forEach(rt => {
      console.log(`- ${rt.name}: ${rt.images.join(', ')}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

updateRoomImages();