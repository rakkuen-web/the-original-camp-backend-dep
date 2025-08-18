const mongoose = require('mongoose');
require('dotenv').config();

async function checkDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB Atlas');
    
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    console.log('\n=== DATABASE COLLECTIONS ===');
    for (const collection of collections) {
      const count = await db.collection(collection.name).countDocuments();
      console.log(`${collection.name}: ${count} documents`);
    }
    
    console.log('\n=== CHECKING SPECIFIC COLLECTIONS ===');
    
    // Check each model
    const models = [
      'users', 'reservations', 'roomtypes', 'rooms', 
      'customers', 'activities', 'activitybookings', 
      'payments', 'settings'
    ];
    
    for (const model of models) {
      try {
        const count = await db.collection(model).countDocuments();
        console.log(`${model}: ${count} documents`);
      } catch (error) {
        console.log(`${model}: Collection doesn't exist`);
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkDatabase();