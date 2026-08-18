const { findUserByEmail, createUser } = require('../data/users');
const { verifyPassword, generateToken } = require('../utils/crypto');
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

  return {
    success: true,
    status: 200,
    message: "Login berhasil",
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      token
    }
  };
}

/**
 * Register a new user
 * @param {object} param0
 * @param {string} param0.name
 * @param {string} param0.email
 * @param {string} param0.password
 * @returns {object} result with success, status, message, and data (if successful)
 */
async function registerUser(nameOrObj, email, password) {
  let name;
  if (typeof nameOrObj === 'object' && nameOrObj !== null) {
    name = nameOrObj.name;
    email = nameOrObj.email;
    password = nameOrObj.password;
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

  const newUser = createUser({ name, email, password });

  return {
    success: true,
    status: 201,
    message: "Registrasi berhasil",
    data: {
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email
      }
    }
  };
}

module.exports = {
  loginUser,
  login: loginUser,
  registerUser,
  register: registerUser
};
