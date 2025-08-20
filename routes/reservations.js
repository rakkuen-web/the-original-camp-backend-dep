const express = require('express');
const Reservation = require('../models/Reservation');
const Settings = require('../models/Settings');
const auth = require('../middleware/auth');
const router = express.Router();

// Create reservation (public)
router.post('/', async (req, res) => {
  try {

    const { guestName, guestEmail, guestPhone, checkIn, checkOut, guests, roomType, tentType, totalPrice, specialRequests, selectedActivities, paymentStatus, status } = req.body;
    
    // Input validation
    if (!guestName || !guestEmail || !guestPhone || !checkIn || !checkOut || !guests) {
      return res.status(400).json({ message: 'Missing required fields: guestName, guestEmail, guestPhone, checkIn, checkOut, guests' });
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(guestEmail)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    
    // Date validation and setup
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // More lenient date validation - allow today and future dates
    checkInDate.setHours(0, 0, 0, 0);
    if (checkInDate < today) {
      return res.status(400).json({ message: 'Check-in date cannot be in the past' });
    }
    
    if (checkOutDate <= checkInDate) {
      return res.status(400).json({ message: 'Check-out date must be after check-in date' });
    }
    
    // Guest count validation
    if (guests < 1 || guests > 10) {
      return res.status(400).json({ message: 'Guest count must be between 1 and 10' });
    }

    // Use roomType if available, fallback to tentType
    const finalRoomType = roomType || tentType || 'standard';
    
    // Set proper hours for availability check
    checkInDate.setHours(15, 0, 0, 0);
    checkOutDate.setHours(11, 0, 0, 0);
    
    // Check for room availability
    const Room = require('../models/Room');
    const RoomType = require('../models/RoomType');
    
    // Find the room type first
    const roomTypeDoc = await RoomType.findOne({ type: finalRoomType });
    if (!roomTypeDoc) {
      return res.status(400).json({ 
        message: `Room type ${finalRoomType} not found` 
      });
    }
    
    // Check if room type can accommodate guests
    if (roomTypeDoc.maxOccupancy < guests) {
      return res.status(400).json({ 
        message: `${finalRoomType} rooms can only accommodate ${roomTypeDoc.maxOccupancy} guests` 
      });
    }
    
    const availableRooms = await Room.find({
      roomTypeId: roomTypeDoc._id,
      isActive: true,
      status: 'available'
    });
    
    if (availableRooms.length === 0) {
      return res.status(400).json({ 
        message: `No ${finalRoomType} rooms available` 
      });
    }
    
    // Check for conflicting reservations
    const conflictingReservations = await Reservation.find({
      roomType: finalRoomType,
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
    
    // Calculate price
    let finalTotalPrice = totalPrice;
    if (!finalTotalPrice) {
      const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
      finalTotalPrice = roomTypeDoc.price * nights;
    }

    // Generate booking reference
    const bookingRef = 'OC' + Date.now().toString().slice(-8) + Math.random().toString(36).substr(2, 3).toUpperCase();

    // Determine status based on payment
    let reservationStatus = 'pending';
    let reservationPaymentStatus = paymentStatus || 'pending';
    
    if (reservationPaymentStatus === 'paid') {
      reservationStatus = 'confirmed';
    }
    
    // Create reservation
    const reservation = new Reservation({
      bookingRef,
      guestName,
      guestEmail,
      guestPhone,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests,
      roomType: finalRoomType,
      totalPrice: finalTotalPrice,
      specialRequests,
      selectedActivities: selectedActivities || [],
      paymentStatus: reservationPaymentStatus,
      status: reservationStatus
    });
    
    const savedReservation = await reservation.save();
    
    res.status(201).json({ 
      reservation: savedReservation, 
      bookingRef,
      message: 'Booking created successfully'
    });
  } catch (error) {
    console.error('Reservation creation error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Check room availability (public)
router.get('/availability', async (req, res) => {
  try {
    const { checkIn, checkOut, guests } = req.query;
    
    if (!checkIn || !checkOut || !guests) {
      return res.status(400).json({ message: 'Missing required parameters: checkIn, checkOut, guests' });
    }
    
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const guestCount = parseInt(guests);
    
    // Set proper hours
    checkInDate.setHours(15, 0, 0, 0);
    checkOutDate.setHours(11, 0, 0, 0);
    
    const Room = require('../models/Room');
    const RoomType = require('../models/RoomType');
    
    // Get all room types
    const roomTypes = await RoomType.find({});
    const availability = [];
    
    for (const roomType of roomTypes) {
      // Get rooms of this type
      const availableRooms = await Room.find({
        roomTypeId: roomType._id,
        isActive: true,
        status: 'available'
      });
      
      // Check if room type can accommodate guests
      if (roomType.maxOccupancy < guestCount) {
        continue; // Skip this room type
      }
      
      if (availableRooms.length > 0) {
        // Check for conflicting reservations using roomType name
        const conflictingReservations = await Reservation.find({
          roomType: roomType.type,
          status: { $in: ['confirmed', 'pending'] },
          $or: [{
            checkIn: { $lt: checkOutDate },
            checkOut: { $gt: checkInDate }
          }]
        });
        
        const availableCount = availableRooms.length - conflictingReservations.length;
        
        if (availableCount > 0) {
          const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
          const totalPrice = roomType.price * nights;
          
          availability.push({
            roomType: roomType.type,
            name: roomType.name,
            description: roomType.description,
            maxGuests: roomType.maxOccupancy,
            pricePerNight: roomType.price,
            totalPrice,
            availableCount,
            nights,
            amenities: roomType.amenities || [],
            images: roomType.images || []
          });
        }
      }
    }
    
    res.json({ 
      availability,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests: guestCount,
      nights: Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24))
    });
  } catch (error) {
    console.error('Availability check error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all reservations (admin)
router.get('/', auth, async (req, res) => {
  try {
    const reservations = await Reservation.find({}).sort({ createdAt: -1 });
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;