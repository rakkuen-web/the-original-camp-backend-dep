const express = require('express');
const Reservation = require('../models/Reservation');
const Settings = require('../models/Settings');
const auth = require('../middleware/auth');
// const { sendReviewEmail } = require('./reviews');
const router = express.Router();

// Create reservation (public)
router.post('/', async (req, res) => {
  try {
    console.log('Received reservation request:', req.body);
    const { guestName, guestEmail, guestPhone, checkIn, checkOut, guests, roomType, tentType, totalPrice, specialRequests, selectedActivities, paymentStatus, status } = req.body;

    // Use roomType if available, fallback to tentType
    const finalRoomType = roomType || tentType || 'standard';
    
    // Use provided totalPrice or calculate it
    let finalTotalPrice = totalPrice;
    if (!finalTotalPrice) {
      const settings = await Settings.findOne() || new Settings();
      const pricePerNight = settings.tentPrices[finalRoomType] || 150;
      const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
      finalTotalPrice = pricePerNight * nights;
    }

    // Generate booking reference
    const bookingRef = 'OC' + Date.now().toString().slice(-8) + Math.random().toString(36).substr(2, 3).toUpperCase();

    // Create room reservation
    const reservation = new Reservation({
      bookingRef,
      guestName,
      guestEmail,
      guestPhone,
      checkIn,
      checkOut,
      guests,
      tentType: finalRoomType,
      totalPrice: finalTotalPrice,
      specialRequests,
      selectedActivities: selectedActivities || [],
      paymentStatus: paymentStatus || 'pending',
      status: status || 'pending'
    });
    
    console.log('Creating reservation:', reservation);

    const savedReservation = await reservation.save();
    console.log('Reservation saved successfully:', savedReservation._id);
    console.log('Saved reservation data:', savedReservation);
    
    // Verify it was actually saved by querying it back
    const verifyReservation = await Reservation.findById(savedReservation._id);
    console.log('Verification - Found in DB:', verifyReservation ? 'YES' : 'NO');

    // TODO: Fix activity booking creation later
    console.log('Selected activities:', selectedActivities);

    // Send confirmation email
    let emailResult = { success: false };
    try {
      const { sendBookingConfirmation } = require('../services/emailService');
      emailResult = await sendBookingConfirmation({
        bookingRef,
        guestName,
        guestEmail,
        checkIn,
        checkOut,
        guests,
        tentType: finalRoomType,
        totalPrice: finalTotalPrice,
        selectedActivities: selectedActivities || []
      });
    } catch (emailError) {
      console.error('Email service error:', emailError);
    }

    res.status(201).json({ 
      reservation: savedReservation, 
      bookingRef,
      emailSent: emailResult.success,
      message: emailResult.success ? 'Booking confirmed and email sent!' : 'Booking confirmed but email failed to send'
    });
  } catch (error) {
    console.error('Reservation creation error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all reservations (admin)
router.get('/', auth, async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;
    let filter = {};

    if (status) filter.status = status;
    if (startDate && endDate) {
      filter.checkIn = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const reservations = await Reservation.find(filter).sort({ createdAt: -1 });
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single reservation (admin)
router.get('/:id', auth, async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }
    res.json(reservation);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update reservation (admin)
router.put('/:id', auth, async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }
    res.json(reservation);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update reservation status (admin)
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }
    
    // Send review email when reservation is completed
    if (status === 'completed') {
      console.log('Reservation completed, would send review email to:', reservation.guestEmail);
    }
    
    res.json(reservation);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete reservation (admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndDelete(req.params.id);
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }
    res.json({ message: 'Reservation deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Debug route to check all reservations
router.get('/debug/all', async (req, res) => {
  try {
    const reservations = await Reservation.find({});
    console.log('Total reservations found:', reservations.length);
    res.json({
      count: reservations.length,
      reservations: reservations
    });
  } catch (error) {
    console.error('Debug route error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Check availability
router.post('/check-availability', async (req, res) => {
  try {
    const { checkIn, checkOut, guests, tentType } = req.body;
    
    const RoomType = require('../models/RoomType');
    
    // Get room type info
    const roomType = await RoomType.findOne({ type: tentType });
    if (!roomType) {
      return res.status(400).json({ message: 'Invalid room type' });
    }

    // Check if guests exceed room capacity
    if (guests > roomType.maxGuests) {
      return res.json({ 
        available: false, 
        message: `This room type can accommodate maximum ${roomType.maxGuests} guests` 
      });
    }

    // Find overlapping reservations for this room type
    const overlappingReservations = await Reservation.find({
      tentType: tentType,
      status: { $in: ['confirmed', 'pending'] },
      $or: [
        { checkIn: { $lte: new Date(checkOut) }, checkOut: { $gte: new Date(checkIn) } }
      ]
    });

    const bookedRooms = overlappingReservations.length;
    const availableRooms = roomType.totalRooms - bookedRooms;
    
    res.json({ 
      available: availableRooms > 0,
      availableRooms,
      totalRooms: roomType.totalRooms,
      pricePerNight: roomType.pricePerNight,
      roomType: roomType.name
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;