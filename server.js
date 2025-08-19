require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const reservationRoutes = require('./routes/reservations');
const dashboardRoutes = require('./routes/dashboard');
const roomRoutes = require('./routes/rooms');
const roomTypeRoutes = require('./routes/roomTypes');
const customerRoutes = require('./routes/customers');
const activityRoutes = require('./routes/activities');
const paymentRoutes = require('./routes/payments');
const simpleReviewRoutes = require('./routes/simpleReviews');
const roomInventoryRoutes = require('./routes/roomInventory');
const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:4200',
    'https://original-camp-frontend-5p54.vercel.app'
  ],
  credentials: true
}));
app.use(express.json());

// Database connection
const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://hamzadanine95:Rakkuen1995@cluster0.4qsuand.mongodb.net/original-camp?retryWrites=true&w=majority';

// Connecting to database...

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(async () => {
    console.log('Database connected');
  })
  .catch(err => {
    console.error('Database connection failed');
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/room-types', roomTypeRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', simpleReviewRoutes);
app.use('/api/room-inventory', roomInventoryRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'The Original Camp API' });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});