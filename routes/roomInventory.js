const express = require('express');
const Room = require('../models/Room');
const Reservation = require('../models/Reservation');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all rooms
router.get('/', async (req, res) => {
  try {
    const rooms = await Room.find({ isActive: true }).sort({ roomNumber: 1 });
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Check room availability for dates
router.post('/check-availability', async (req, res) => {
  try {
    const { checkIn, checkOut, guests, roomType } = req.body;
    
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    
    // Set proper check-in/out times
    checkInDate.setHours(15, 0, 0, 0); // 3 PM check-in
    checkOutDate.setHours(11, 0, 0, 0); // 11 AM check-out
    
    // Find rooms of requested type that can accommodate guests
    const availableRooms = await Room.find({
      roomType: roomType,
      maxGuests: { $gte: guests },
      isActive: true,
      status: { $in: ['available', 'cleaning'] }
    });
    
    if (availableRooms.length === 0) {
      return res.json({ 
        available: false, 
        message: `No ${roomType} rooms available for ${guests} guests` 
      });
    }
    
    // Check for conflicting reservations
    const conflictingReservations = await Reservation.find({
      tentType: roomType,
      status: { $in: ['confirmed', 'pending'] },
      $or: [
        {
          checkIn: { $lt: checkOutDate },
          checkOut: { $gt: checkInDate }
        }
      ]
    });
    
    const occupiedRooms = conflictingReservations.length;
    const availableCount = availableRooms.length - occupiedRooms;
    
    res.json({
      available: availableCount > 0,
      availableRooms: Math.max(0, availableCount),
      totalRooms: availableRooms.length,
      pricePerNight: availableRooms[0]?.pricePerNight || 0
    });
    
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Assign room to reservation
router.patch('/assign/:reservationId', auth, async (req, res) => {
  try {
    const { reservationId } = req.params;
    const { roomId } = req.body;
    
    const reservation = await Reservation.findById(reservationId);
    const room = await Room.findById(roomId);
    
    if (!reservation || !room) {
      return res.status(404).json({ message: 'Reservation or room not found' });
    }
    
    // Check if room is available for these dates
    const conflictingReservation = await Reservation.findOne({
      assignedRoom: roomId,
      status: { $in: ['confirmed', 'pending'] },
      _id: { $ne: reservationId },
      $or: [
        {
          checkIn: { $lt: reservation.checkOut },
          checkOut: { $gt: reservation.checkIn }
        }
      ]
    });
    
    if (conflictingReservation) {
      return res.status(400).json({ message: 'Room is not available for these dates' });
    }
    
    // Assign room
    reservation.assignedRoom = roomId;
    reservation.roomNumber = room.roomNumber;
    await reservation.save();
    
    res.json({ message: 'Room assigned successfully', reservation });
    
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;