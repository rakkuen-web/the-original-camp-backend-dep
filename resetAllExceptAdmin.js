require('dotenv').config();
const mongoose = require('mongoose');

async function resetAllExceptAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Get all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Found collections:', collections.map(c => c.name));
    
    // Collections to reset (everything except users/admin)
    const collectionsToReset = [
      'reservations',
      'customers', 
      'rooms',
      'reviews',
      'guestreviews',
      'payments',
      'activities',
      'activitybookings',
      'settings'
    ];
    
    for (const collectionName of collectionsToReset) {
      if (collections.find(c => c.name === collectionName)) {
        const result = await mongoose.connection.db.collection(collectionName).deleteMany({});
        console.log(`Deleted ${result.deletedCount} documents from ${collectionName}`);
      }
    }
    
    console.log('✅ Database reset complete (admin users preserved)');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

resetAllExceptAdmin();