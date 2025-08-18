const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: true,
    unique: true
  },
  roomTypeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RoomType',
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'occupied', 'maintenance', 'cleaning'],
    default: 'available'
  },
  floor: {
    type: Number,
    default: 1
  },
  location: {
    type: String,
    default: 'Desert View'
  },
  lastCleaned: {
    type: Date,
    default: Date.now
  },
  lastMaintenance: {
    type: Date,
    default: Date.now
  },
  notes: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Room', roomSchema);