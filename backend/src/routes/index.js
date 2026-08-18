const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');

// Healthcheck endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Backend server is running',
    timestamp: new Date().toISOString()
  });
});

// Auth routes (direct /api/login and /api/auth/login)
router.use('/', authRoutes);
router.use('/auth', authRoutes);

module.exports = router;
