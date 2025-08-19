const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['camel', 'buggy', 'stargazing', 'dining'],
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  duration: {
    type: Number, // in hours
    required: true
  },
  maxParticipants: {
    type: Number,
    required: true
  },
  description: String,
  images: [String], // Array of image URLs
  availableSlots: [{
    time: String, // e.g., "09:00", "14:00", "18:00"
    maxBookings: Number
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Activity', activitySchema);