const authService = require('../services/authService');

/**
 * Handle POST /api/login and POST /api/v1/auth/login
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser(email, password);

    if (!result.success) {
      return res.status(result.status || 401).json({
        success: false,
        message: result.message
      });
    }

    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.data
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Handle POST /api/register and POST /api/v1/auth/register
 */
async function register(req, res, next) {
  try {
    const { name, email, password, role } = req.body;
    const result = await authService.registerUser({ name, email, password, role });

    if (!result.success) {
      return res.status(result.status || 400).json({
        success: false,
        message: result.message
      });
    }

    return res.status(201).json({
      success: true,
      message: result.message,
      data: result.data
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Handle POST /api/auth/refresh and POST /api/refresh
 */
async function refresh(req, res, next) {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    let token = req.body && (req.body.refreshToken || req.body.token);
    
    if (!token && authHeader) {
      const parts = authHeader.trim().split(' ');
      if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
        token = parts[1];
      }
    }

    const result = await authService.refreshAccessToken(token);

    if (!result.success) {
      return res.status(result.status || 401).json({
        success: false,
        message: result.message
      });
    }

    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.data
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Handle GET /api/auth/profile and GET /api/profile
 */
async function profile(req, res, next) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Akses ditolak: Autentikasi diperlukan"
      });
    }

    const result = await authService.getUserProfile(req.user.id);
    if (!result.success) {
      return res.status(result.status || 404).json({
        success: false,
        message: result.message
      });
    }

    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.data
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  login,
  register,
  refresh,
  profile
};
