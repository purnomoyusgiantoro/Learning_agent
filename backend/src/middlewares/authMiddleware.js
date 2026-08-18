const { verifyToken } = require('../utils/crypto');
const { findUserById } = require('../data/users');
const config = require('../config/env');

/**
 * Authentication Middleware for protected routes
 * Extracts Bearer token from Authorization header and verifies it
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: 'Akses ditolak: Token autentikasi tidak disediakan (Authorization header missing)'
    });
  }

  const parts = authHeader.trim().split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    return res.status(401).json({
      success: false,
      message: 'Format token otentikasi tidak valid. Format yang diharapkan: Bearer <token>'
    });
  }

  const token = parts[1];
  const verification = verifyToken(token, config.tokenSecret);

  if (!verification.valid) {
    return res.status(401).json({
      success: false,
      message: verification.error || 'Token autentikasi tidak valid atau telah kedaluwarsa'
    });
  }

  const user = findUserById(verification.payload.id);
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Pengguna yang terkait dengan token tidak ditemukan'
    });
  }

  // Attach decoded user payload to request
  req.user = verification.payload;
  next();
}

module.exports = authMiddleware;
