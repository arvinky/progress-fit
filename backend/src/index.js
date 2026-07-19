require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const clientRoutes = require('./routes/clientRoutes');
const trackingRoutes = require('./routes/trackingRoutes');
const workoutRoutes = require('./routes/workoutRoutes');
const reminderRoutes = require('./routes/reminderRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// CORS setup
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/workout', workoutRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

// Health check & Root greeting
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to ProgressFit API Server',
    status: 'Healthy',
    docs: 'See README.md for list of endpoints',
    version: '1.0.0'
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'ProgressFit API is running successfully' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Terjadi kesalahan internal server',
    error: process.env.NODE_ENV === 'development' ? err : {},
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
