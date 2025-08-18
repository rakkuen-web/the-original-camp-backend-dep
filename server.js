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
const initializeDatabase = require('./init-db');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://hamzadanine95:Rakkuen1995@cluster0.4qsuand.mongodb.net/original-camp?retryWrites=true&w=majority';

console.log('Attempting to connect to MongoDB...');
console.log('MongoDB URI exists:', !!process.env.MONGODB_URI);

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(async () => {
    console.log('MongoDB Atlas connected successfully');
    console.log('Database:', mongoose.connection.name);
    await initializeDatabase();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    console.error('Connection string:', process.env.MONGODB_URI?.replace(/:[^:@]*@/, ':****@'));
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

app.get('/', (req, res) => {
  res.json({ message: 'The Original Camp API' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});