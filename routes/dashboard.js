const express = require('express');
const Reservation = require('../models/Reservation');
const Room = require('../models/Room');
const RoomType = require('../models/RoomType');
const Payment = require('../models/Payment');
const Settings = require('../models/Settings');
const auth = require('../middleware/auth');
const router = express.Router();

// Dashboard stats
router.get('/stats', auth, async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    const [
      totalReservations,
      totalRooms,
      occupiedRooms,
      todayCheckIns,
      todayCheckOuts,
      todayRevenue,
      monthlyRevenue
    ] = await Promise.all([
      Reservation.countDocuments(),
      Room.countDocuments(),
      Room.countDocuments({ status: 'Occupied' }),
      Reservation.countDocuments({
        checkInDate: { $gte: startOfDay, $lte: endOfDay }
      }),
      Reservation.countDocuments({
        checkOutDate: { $gte: startOfDay, $lte: endOfDay }
      }),
      Payment.aggregate([
        {
          $lookup: {
            from: 'reservations',
            localField: 'reservationId',
            foreignField: '_id',
            as: 'reservation'
          }
        },
        {
          $match: {
            'reservation.checkInDate': { $gte: startOfDay, $lte: endOfDay },
            paymentStatus: 'Paid'
          }
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Payment.aggregate([
        {
          $lookup: {
            from: 'reservations',
            localField: 'reservationId',
            foreignField: '_id',
            as: 'reservation'
          }
        },
        {
          $match: {
            'reservation.createdAt': { $gte: startOfMonth },
            paymentStatus: 'Paid'
          }
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

    res.json({
      totalReservations,
      totalRooms,
      occupiedRooms,
      occupancyRate,
      todayCheckIns,
      todayCheckOuts,
      todayRevenue: todayRevenue[0]?.total || 0,
      monthlyRevenue: monthlyRevenue[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Recent reservations
router.get('/recent-reservations', auth, async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .sort({ createdAt: -1 })
      .limit(10);
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Monthly revenue chart data
router.get('/revenue-chart', auth, async (req, res) => {
  try {
    const year = req.query.year || new Date().getFullYear();
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    const monthlyData = await Reservation.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          paymentStatus: 'paid'
        }
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          revenue: { $sum: '$totalPrice' },
          bookings: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    res.json(monthlyData);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Settings
router.get('/settings', auth, async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
      await settings.save();
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/settings', auth, async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings(req.body);
    } else {
      Object.assign(settings, req.body);
    }
    await settings.save();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;