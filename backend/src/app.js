const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes');
const config = require('./config/env');
const securityHeaders = require('./middlewares/securityHeaders');
const { notFoundHandler, errorHandler } = require('./middlewares/errorHandler');

const app = express();

// Security Headers Middleware (Helmet equivalent)
app.use(securityHeaders);

// CORS configuration
app.use(cors({
  origin: config.corsOrigin,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

// Body parsers
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Root health check / API directory info
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'Learning Agent Backend API',
    status: 'online',
    version: '1.0.0',
    environment: config.nodeEnv,
    endpoints: {
      health: 'GET /api/health',
      auth: {
        login: 'POST /api/auth/login (or /api/login)',
        register: 'POST /api/auth/register (or /api/register)',
        refresh: 'POST /api/auth/refresh (or /api/refresh)',
        profile: 'GET /api/auth/profile (or /api/profile)'
      },
      agents: {
        list: 'GET /api/v1/agents',
        create: 'POST /api/v1/agents',
        detail: 'GET /api/v1/agents/:id',
        update: 'PUT /api/v1/agents/:id (or PATCH)',
        delete: 'DELETE /api/v1/agents/:id',
        execute: 'POST /api/v1/agents/:id/execute',
        status: 'GET /api/v1/agents/:id/status',
        logs: 'GET /api/v1/agents/:id/logs',
        metrics: 'GET /api/v1/agents/:id/metrics'
      },
      todos: {
        list: 'GET /api/v1/todos',
        detail: 'GET /api/v1/todos/:id',
        create: 'POST /api/v1/todos',
        update: 'PATCH /api/v1/todos/:id',
        delete: 'DELETE /api/v1/todos/:id'
      }
    }
  });
});

// Mount API routes
app.use('/api', apiRoutes);
app.use('/api/v1', apiRoutes); // Alias for versioned API

// 404 & Centralized Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
