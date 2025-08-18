const express = require('express');
const Review = require('../models/Review');
const Reservation = require('../models/Reservation');
const router = express.Router();
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Get all reviews (for admin dashboard)
router.get('/', async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get published reviews (for homepage)
router.get('/published', async (req, res) => {
  try {
    const reviews = await Review.find({ isPublished: true }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Submit review (public endpoint)
router.post('/submit/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { rating, comment, guestImage } = req.body;

    const review = await Review.findOne({ reviewToken: token });
    if (!review) {
      return res.status(404).json({ message: 'Invalid review link' });
    }

    if (review.rating) {
      return res.status(400).json({ message: 'Review already submitted' });
    }

    review.rating = rating;
    review.comment = comment;
    review.guestImage = guestImage;
    await review.save();

    res.json({ message: 'Review submitted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get review by token (for review page)
router.get('/token/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const review = await Review.findOne({ reviewToken: token });
    
    if (!review) {
      return res.status(404).json({ message: 'Invalid review link' });
    }

    res.json({
      guestName: review.guestName,
      hasSubmitted: !!review.rating
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Test review email endpoint
router.post('/test-email/:bookingRef', async (req, res) => {
  try {
    const { bookingRef } = req.params;
    const Reservation = require('../models/Reservation');
    
    const reservation = await Reservation.findOne({ bookingRef });
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    await sendReviewEmail(reservation);
    res.json({ message: 'Review email sent successfully', email: reservation.guestEmail });
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({ message: 'Error sending test email', error: error.message });
  }
});

// Toggle review publish status
router.patch('/:id/publish', async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findById(id);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    review.isPublished = !review.isPublished;
    await review.save();

    res.json(review);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Send review email when reservation is completed
async function sendReviewEmail(reservation) {
  try {
    const reviewToken = crypto.randomBytes(32).toString('hex');
    
    const review = new Review({
      reservationId: reservation._id,
      guestName: reservation.guestName,
      guestEmail: reservation.guestEmail,
      reviewToken: reviewToken
    });
    
    await review.save();

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const reviewUrl = `${process.env.FRONTEND_URL}/review/${reviewToken}`;

    const mailOptions = {
      from: process.env.FROM_EMAIL || process.env.SMTP_USER,
      to: reservation.guestEmail,
      subject: 'Share Your Experience - The Original Camp',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #DAA520;">Thank you for staying with us!</h2>
          <p>Dear ${reservation.guestName},</p>
          <p>We hope you had an amazing experience at The Original Camp. Your feedback is very important to us!</p>
          <p>Please take a moment to share your experience:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${reviewUrl}" style="background: #DAA520; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Leave a Review</a>
          </div>
          <p>Thank you for choosing The Original Camp!</p>
          <p>Best regards,<br>The Original Camp Team</p>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);

    console.log('Review email sent successfully to:', reservation.guestEmail);
    console.log('Email result:', result);
  } catch (error) {
    console.error('Error sending review email:', error);
  }
}

module.exports = { router, sendReviewEmail };