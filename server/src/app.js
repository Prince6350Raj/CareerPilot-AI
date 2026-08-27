const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const path = require('path');
const app = express();

// Custom Request Logger to help diagnose connectivity issues
app.use((req, res, next) => {
  const mongoose = require('mongoose');
  console.log(`[API REQUEST] ${req.method} ${req.originalUrl} - DB: ${mongoose.connection.name} - Host: ${mongoose.connection.host}`);
  next();
});

// Middlewares
app.use(cors({
  origin: function (origin, callback) {
    // Dynamically allow any origin to support all Vercel production URLs, preview links, and local hosts
    return callback(null, true);
  },
  credentials: true
}));
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ limit: '15mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Mount routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const careerRoutes = require('./routes/careerRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
const progressRoutes = require('./routes/progressRoutes');
const adminRoutes = require('./routes/adminRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const challengeRoutes = require('./routes/challengeRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/career', careerRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/challenge', challengeRoutes);

// Basic health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'CareerPilot AI Backend API is active' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

module.exports = app;
