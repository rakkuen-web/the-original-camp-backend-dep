const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

// Simple Review Schema
const reviewSchema = new mongoose.Schema({
  token: String,
  rating: Number,
  comment: String,
  createdAt: { type: Date, default: Date.now }
});

const Review = mongoose.model('Review', reviewSchema);

// Submit review
router.post('/submit/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { rating, comment } = req.body;

    const review = new Review({
      token,
      rating,
      comment
    });

    await review.save();
    console.log('Review saved:', review);
    
    res.json({ message: 'Review submitted successfully' });
  } catch (error) {
    console.error('Error saving review:', error);
    res.status(500).json({ message: 'Error saving review' });
  }
});

module.exports = router;