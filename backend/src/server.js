const app = require('./app');
const config = require('./config/env');

const PORT = config.port;

const server = app.listen(PORT, () => {
  console.log(`[Server] Backend API running at http://localhost:${PORT}`);
  console.log(`[Server] Health Check: http://localhost:${PORT}/api/health`);
  console.log(`[Server] Auth Endpoint: http://localhost:${PORT}/api/login`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('[Server] SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('[Server] Process terminated.');
  });
});

module.exports = server;
