const { findUserByEmail, findUserById, createUser, getAllUsers } = require('../data/users');
const { verifyPassword, generateToken, generateRefreshToken, verifyToken } = require('../utils/crypto');
const config = require('../config/env');

/**
 * Authenticate a user with email and password
 * @param {string} email 
 * @param {string} password 
 * @returns {object} result with success, status, message, and data (if successful)
 */
async function loginUser(email, password) {
  const user = findUserByEmail(email);

  if (!user) {
    return {
      success: false,
      status: 401,
      message: "Email atau password salah"
    };
  }

  const isPasswordValid = verifyPassword(password, user.passwordHash);
  if (!isPasswordValid) {
    return {
      success: false,
      status: 401,
      message: "Email atau password salah"
    };
  }

  const token = generateToken(user, config.tokenSecret);
  const refreshToken = generateRefreshToken(user, config.tokenSecret);

  return {
    success: true,
    status: 200,
    message: "Login berhasil",
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role || 'user'
      },
      token,
      refreshToken
    }
  };
}

/**
 * Register a new user
 * @param {object|string} nameOrObj 
 * @param {string} [email] 
 * @param {string} [password] 
 * @param {string} [role]
 * @returns {object} result with success, status, message, and data (if successful)
 */
async function registerUser(nameOrObj, email, password, role = 'user') {
  let name;
  let targetRole = role;
  if (typeof nameOrObj === 'object' && nameOrObj !== null) {
    name = nameOrObj.name;
    email = nameOrObj.email;
    password = nameOrObj.password;
    if (nameOrObj.role) targetRole = nameOrObj.role;
  } else {
    name = nameOrObj;
  }

  const existingUser = findUserByEmail(email);
  if (existingUser) {
    return {
      success: false,
      status: 409,
      message: "Email sudah terdaftar. Silakan gunakan email lain atau login."
    };
  }

  const newUser = createUser({ name, email, password, role: targetRole });

  return {
    success: true,
    status: 201,
    message: "Registrasi berhasil",
    data: {
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    }
  };
}

/**
 * Refresh access token using a valid refresh token or current token
 * @param {string} tokenString 
 * @returns {object}
 */
async function refreshAccessToken(tokenString) {
  if (!tokenString) {
    return {
      success: false,
      status: 400,
      message: "Refresh token tidak disediakan"
    };
  }

  const verification = verifyToken(tokenString, config.tokenSecret);
  if (!verification.valid) {
    return {
      success: false,
      status: 401,
      message: verification.error || "Refresh token tidak valid atau telah kedaluwarsa"
    };
  }

  const user = findUserById(verification.payload.id || verification.payload.sub);
  if (!user) {
    return {
      success: false,
      status: 401,
      message: "Pengguna tidak ditemukan"
    };
  }

  const newToken = generateToken(user, config.tokenSecret);
  const newRefreshToken = generateRefreshToken(user, config.tokenSecret);

  return {
    success: true,
    status: 200,
    message: "Token berhasil diperbarui",
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role || 'user'
      },
      token: newToken,
      refreshToken: newRefreshToken
    }
  };
}

/**
 * Get profile for authenticated user
 * @param {string} userId 
 * @returns {object}
 */
async function getUserProfile(userId) {
  const user = findUserById(userId);
  if (!user) {
    return {
      success: false,
      status: 404,
      message: "Pengguna tidak ditemukan"
    };
  }

  return {
    success: true,
    status: 200,
    message: "Profil pengguna berhasil diambil",
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role || 'user',
      created_at: user.created_at || new Date().toISOString()
    }
  };
}

module.exports = {
  loginUser,
  login: loginUser,
  registerUser,
  register: registerUser,
  refreshAccessToken,
  getUserProfile
};
