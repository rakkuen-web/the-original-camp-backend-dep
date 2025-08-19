require('dotenv').config();
const mongoose = require('mongoose');
const Reservation = require('./models/Reservation');

async function resetReservations() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Delete all reservations
    const result = await Reservation.deleteMany({});
    console.log(`Deleted ${result.deletedCount} reservations`);
    
    console.log('Reservations database reset successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error resetting reservations:', error);
    process.exit(1);
  }
}

resetReservations();