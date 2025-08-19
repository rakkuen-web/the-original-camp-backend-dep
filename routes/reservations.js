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
    
    // CRITICAL: Check availability before creating reservation
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    checkInDate.setHours(15, 0, 0, 0);
    checkOutDate.setHours(11, 0, 0, 0);
    
    // Check for room availability
    const Room = require('../models/Room');
    const availableRooms = await Room.find({
      roomType: finalRoomType,
      maxGuests: { $gte: guests },
      isActive: true
    });
    
    if (availableRooms.length === 0) {
      return res.status(400).json({ 
        message: `No ${finalRoomType} rooms available for ${guests} guests` 
      });
    }
    
    // Check for conflicting reservations
    const conflictingReservations = await Reservation.find({
      tentType: finalRoomType,
      status: { $in: ['confirmed', 'pending'] },
      $or: [{
        checkIn: { $lt: checkOutDate },
        checkOut: { $gt: checkInDate }
      }]
    });
    
    const availableCount = availableRooms.length - conflictingReservations.length;
    
    if (availableCount <= 0) {
      return res.status(400).json({ 
        message: `No ${finalRoomType} rooms available for selected dates` 
      });
    }
    
    // Use provided totalPrice or calculate it
    let finalTotalPrice = totalPrice;
    if (!finalTotalPrice) {
      const pricePerNight = availableRooms[0].pricePerNight;
      const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
      finalTotalPrice = pricePerNight * nights;
    }

    // Generate booking reference
    const bookingRef = 'OC' + Date.now().toString().slice(-8) + Math.random().toString(36).substr(2, 3).toUpperCase();

    // Determine status based on payment
    let reservationStatus = 'pending';
    let reservationPaymentStatus = paymentStatus || 'pending';
    
    // If payment is completed, auto-confirm reservation
    if (reservationPaymentStatus === 'paid') {
      reservationStatus = 'confirmed';
    }
    
    // Create room reservation
    const reservation = new Reservation({
      bookingRef,
      guestName,
      guestEmail,
      guestPhone,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests,
      tentType: finalRoomType,
      totalPrice: finalTotalPrice,
      specialRequests,
      selectedActivities: selectedActivities || [],
      paymentStatus: reservationPaymentStatus,
      status: reservationStatus
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

// Update payment status (admin)
router.patch('/:id/payment', auth, async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    const reservation = await Reservation.findById(req.params.id);
    
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }
    
    reservation.paymentStatus = paymentStatus;
    
    // Auto-confirm when payment is completed
    if (paymentStatus === 'paid' && reservation.status === 'pending') {
      reservation.status = 'confirmed';
    }
    
    await reservation.save();
    res.json(reservation);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update reservation status (admin)
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const reservation = await Reservation.findById(req.params.id);
    
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }
    
    // Validation: Cannot confirm without payment
    if (status === 'confirmed' && reservation.paymentStatus !== 'paid') {
      return res.status(400).json({ 
        message: 'Cannot confirm reservation without payment. Please update payment status first.' 
      });
    }
    
    // Update status
    reservation.status = status;
    await reservation.save();
    
    // Send review email when reservation is completed
    if (status === 'completed') {
      console.log('Reservation completed, attempting to send review email to:', reservation.guestEmail);
      
      try {
        const nodemailer = require('nodemailer');
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: 587,
          secure: false,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          }
        });
        
        const reviewToken = require('crypto').randomBytes(16).toString('hex');
        const reviewUrl = `${process.env.FRONTEND_URL}/review/${reviewToken}?name=${encodeURIComponent(reservation.guestName)}&email=${encodeURIComponent(reservation.guestEmail)}&ref=${reservation.bookingRef}`;
        
        console.log('Generated review URL:', reviewUrl);
        console.log('Guest info:', { name: reservation.guestName, email: reservation.guestEmail, ref: reservation.bookingRef });
        
        transporter.sendMail({
          from: process.env.SMTP_USER,
          to: reservation.guestEmail,
          subject: 'Share Your Experience - The Original Camp',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #DAA520;">Thank you for staying with us, ${reservation.guestName}!</h2>
              <p>We hope you had an amazing experience at The Original Camp.</p>
              <p>Your feedback is very important to us. Please take a moment to share your experience:</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${reviewUrl}" style="background: #DAA520; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">Leave a Review ⭐</a>
              </div>
              
              <p><strong>Booking Reference:</strong> ${reservation.bookingRef}</p>
              <p>Thank you for choosing The Original Camp!</p>
              <p>Best regards,<br>The Original Camp Team</p>
            </div>
          `
        }).then(() => {
          console.log('✅ Review email sent successfully to:', reservation.guestEmail);
        }).catch(err => {
          console.error('❌ Email sending failed:', err.message);
        });
      } catch (error) {
        console.error('❌ Email setup failed:', error.message);
      }
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