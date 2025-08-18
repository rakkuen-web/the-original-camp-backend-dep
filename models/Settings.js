const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  campCapacity: {
    type: Number,
    default: 50
  },
  tentPrices: {
    standard: { type: Number, default: 120 },
    deluxe: { type: Number, default: 180 },
    suite: { type: Number, default: 280 },
    family: { type: Number, default: 220 },
    romantic: { type: Number, default: 320 },
    adventure: { type: Number, default: 200 }
  },
  unavailableDates: [{
    type: Date
  }],
  minimumStay: {
    type: Number,
    default: 1
  },
  maximumStay: {
    type: Number,
    default: 14
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Settings', settingsSchema);