const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  bookingRef: {
    type: String,
    unique: true,
    required: true
  },
  guestName: {
    type: String,
    required: true
  },
  guestEmail: {
    type: String,
    required: true
  },
  guestPhone: {
    type: String,
    required: true
  },
  checkIn: {
    type: Date,
    required: true
  },
  checkOut: {
    type: Date,
    required: true
  },
  guests: {
    type: Number,
    required: true,
    min: 1
  },
  tentType: {
    type: String,
    enum: ['standard', 'deluxe', 'suite', 'family', 'romantic', 'adventure'],
    required: true
  },
  totalPrice: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  specialRequests: String,
  selectedActivities: [{
    _id: String,
    name: String,
    type: String,
    price: Number
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Reservation', reservationSchema);