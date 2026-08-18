const { hashPassword } = require('../utils/crypto');

// Initial in-memory user store with hashed passwords
const users = [
  {
    id: "1",
    email: "user@example.com",
    name: "User Name",
    passwordHash: hashPassword("securepassword123")
  },
  {
    id: "2",
    email: "admin@example.com",
    name: "Administrator",
    passwordHash: hashPassword("admin123")
  },
  {
    id: "3",
    email: "purnomo@example.com",
    name: "Purnomo Yusgiantoro",
    passwordHash: hashPassword("purnomo123")
  }
];

/**
 * Find user by email (case-insensitive)
 * @param {string} email 
 * @returns {object|null}
 */
function findUserByEmail(email) {
  if (!email) return null;
  return users.find(u => u.email.toLowerCase() === email.trim().toLowerCase()) || null;
}

/**
 * Check if email already exists
 * @param {string} email 
 * @returns {boolean}
 */
function emailExists(email) {
  return !!findUserByEmail(email);
}

/**
 * Find user by ID
 * @param {string} id 
 * @returns {object|null}
 */
function findUserById(id) {
  return users.find(u => u.id === id) || null;
}

/**
 * Create a new user in memory
 * @param {object} param0
 * @param {string} param0.name
 * @param {string} param0.email
 * @param {string} param0.password
 * @returns {object} created user without passwordHash
 */
function createUser({ name, email, password }) {
  const maxId = users.reduce((max, u) => {
    const numId = parseInt(u.id, 10);
    return isNaN(numId) ? max : Math.max(max, numId);
  }, 0);
  const nextId = String(maxId + 1);

  const newUser = {
    id: nextId,
    email: email.trim().toLowerCase(),
    name: name.trim(),
    passwordHash: hashPassword(password)
  };

  users.push(newUser);

  return {
    id: newUser.id,
    email: newUser.email,
    name: newUser.name
  };
}

/**
 * Get all users without password hashes (for testing/debug)
 * @returns {Array}
 */
function getAllUsers() {
  return users.map(({ id, email, name }) => ({ id, email, name }));
}

module.exports = {
  findUserByEmail,
  findUserById,
  emailExists,
  createUser,
  getAllUsers
};
