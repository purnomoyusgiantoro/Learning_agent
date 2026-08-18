const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes');
const config = require('./config/env');
const { notFoundHandler, errorHandler } = require('./middlewares/errorHandler');

const app = express();

// CORS configuration
app.use(cors({
  origin: config.corsOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root health check / info
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'Learning Agent Backend API',
    status: 'online',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/health',
      login: 'POST /api/login',
      register: 'POST /api/register'
    }
  });
});

// Mount API routes
app.use('/api', apiRoutes);
app.use('/api/v1', apiRoutes); // Alias for versioned API

// 404 & Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
