const rateLimit = require('express-rate-limit');

// Rate limiter for reservation creation
const reservationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 reservation attempts per windowMs
  message: {
    message: 'Too many reservation attempts. Please try again in 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = { reservationLimiter };