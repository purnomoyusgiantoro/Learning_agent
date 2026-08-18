/**
 * In-memory sliding rate limiter middleware for mutation requests
 */
let globalRequestLogs = new Map();

function resetRateLimits() {
  globalRequestLogs.clear();
}

/**
 * Simple in-memory sliding rate limiter middleware for mutation requests
 */
function createRateLimiter(options = {}) {
  const windowMs = options.windowMs || 60000;
  const maxRequests = options.maxRequests || options.max || 60;
  const message = options.message || 'Terlalu banyak permintaan (Rate limit exceeded). Silakan coba lagi beberapa saat kemudian.';

  return function rateLimiter(req, res, next) {
    const key = (req.user && req.user.id) ? `user_${req.user.id}` : `ip_${req.ip || (req.socket && req.socket.remoteAddress) || 'unknown'}`;
    const now = Date.now();

    if (!globalRequestLogs.has(key)) {
      globalRequestLogs.set(key, []);
    }

    const timestamps = globalRequestLogs.get(key);
    const recentTimestamps = timestamps.filter(time => now - time < windowMs);

    const remaining = Math.max(0, maxRequests - recentTimestamps.length);
    const resetTime = Math.ceil((now + windowMs) / 1000);

    if (res.setHeader) {
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', remaining);
      res.setHeader('X-RateLimit-Reset', resetTime);
    }

    if (recentTimestamps.length >= maxRequests) {
      const retryAfter = Math.max(1, Math.ceil((recentTimestamps[0] + windowMs - now) / 1000));
      if (res.setHeader) {
        res.setHeader('Retry-After', retryAfter);
      }
      return res.status(429).json({
        success: false,
        message,
        retryAfter,
        retryAfterSeconds: retryAfter
      });
    }

    recentTimestamps.push(now);
    globalRequestLogs.set(key, recentTimestamps);
    next();
  };
}

module.exports = {
  createRateLimiter,
  mutationRateLimiter: createRateLimiter({ windowMs: 60000, maxRequests: 20 }),
  rateLimiter: createRateLimiter({ windowMs: 60000, maxRequests: 60 }),
  resetRateLimits
};
