const crypto = require('crypto');

// Simple CSRF protection middleware
const csrfProtection = (req, res, next) => {
  // Skip CSRF for GET requests and public reservation creation
  if (req.method === 'GET' || req.path === '/api/reservations') {
    return next();
  }
  
  const token = req.headers['x-csrf-token'] || req.body._csrf;
  const sessionToken = req.session?.csrfToken;
  
  if (!token || !sessionToken || token !== sessionToken) {
    return res.status(403).json({ message: 'Invalid CSRF token' });
  }
  
  next();
};

// Generate CSRF token
const generateCSRFToken = (req, res, next) => {
  if (!req.session) {
    req.session = {};
  }
  
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString('hex');
  }
  
  next();
};

module.exports = { csrfProtection, generateCSRFToken };