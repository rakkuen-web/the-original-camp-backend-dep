const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

// Simple Review Schema
const reviewSchema = new mongoose.Schema({
  token: String,
  rating: Number,
  comment: String,
  isPublished: { type: Boolean, default: false },
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

// Get all reviews
router.get('/', async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reviews' });
  }
});

// Toggle publish status
router.patch('/:id/publish', async (req, res) => {
  try {
    const { id } = req.params;
    const { isPublished } = req.body;
    
    await Review.findByIdAndUpdate(id, { isPublished });
    res.json({ message: 'Review updated' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating review' });
  }
});

// Delete review
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Review.findByIdAndDelete(id);
    res.json({ message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting review' });
  }
});

module.exports = router;