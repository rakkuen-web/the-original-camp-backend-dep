const express = require('express');
const Activity = require('../models/Activity');
const ActivityBooking = require('../models/ActivityBooking');
const router = express.Router();

// Get all activities
router.get('/', async (req, res) => {
  try {
    const activities = await Activity.find();
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Check activity availability
router.post('/check-availability', async (req, res) => {
  try {
    const { activityId, date, timeSlot, participants } = req.body;
    
    const activity = await Activity.findById(activityId);
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    const slot = activity.availableSlots.find(s => s.time === timeSlot);
    if (!slot) {
      return res.status(400).json({ message: 'Invalid time slot' });
    }

    // Count existing bookings for this date and time
    const existingBookings = await ActivityBooking.find({
      activityId,
      date: new Date(date),
      timeSlot,
      status: { $in: ['pending', 'confirmed'] }
    });

    const bookedParticipants = existingBookings.reduce((sum, booking) => sum + booking.participants, 0);
    const availableSpots = slot.maxBookings - bookedParticipants;

    res.json({
      available: availableSpots >= participants,
      availableSpots,
      totalSpots: slot.maxBookings,
      price: activity.price,
      totalPrice: activity.price * participants
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Book activity
router.post('/book', async (req, res) => {
  try {
    const { guestName, guestEmail, guestPhone, activityId, date, timeSlot, participants, reservationId } = req.body;
    
    const activity = await Activity.findById(activityId);
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    const totalPrice = activity.price * participants;

    const booking = new ActivityBooking({
      guestName,
      guestEmail,
      guestPhone,
      activityId,
      date,
      timeSlot,
      participants,
      totalPrice,
      reservationId
    });

    await booking.save();
    await booking.populate('activityId');
    
    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;