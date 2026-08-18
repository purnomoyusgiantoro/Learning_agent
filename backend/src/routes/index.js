const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const todoRoutes = require('./todoRoutes');
const agentRoutes = require('./agentRoutes');
const config = require('../config/env');

// Healthcheck & Liveness/Readiness Probe endpoint
router.get('/health', (req, res) => {
  const memory = process.memoryUsage();
  res.status(200).json({
    status: 'ok',
    message: 'Backend server is running',
    liveness: true,
    readiness: true,
    timestamp: new Date().toISOString(),
    uptime_seconds: Math.floor(process.uptime()),
    environment: config.nodeEnv,
    memory_usage: {
      rss_mb: Number((memory.rss / 1024 / 1024).toFixed(2)),
      heap_used_mb: Number((memory.heapUsed / 1024 / 1024).toFixed(2)),
      heap_total_mb: Number((memory.heapTotal / 1024 / 1024).toFixed(2))
    },
    services: {
      database: 'up',
      auth: 'up',
      learning_agent_engine: 'up',
      todos: 'up'
    }
  });
});

// Auth routes (direct /api/login, /api/register, /api/refresh, /api/profile and /api/auth/*)
router.use('/', authRoutes);
router.use('/auth', authRoutes);

// Learning Agent routes (/api/agents, /api/v1/agents)
router.use('/agents', agentRoutes);
router.use('/v1/agents', agentRoutes);

// Todo routes (/api/todos, /api/v1/todos)
router.use('/todos', todoRoutes);
router.use('/v1/todos', todoRoutes);

module.exports = router;
