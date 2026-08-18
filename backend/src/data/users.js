const { hashPassword } = require('../utils/crypto');

const DEFAULT_USERS = [
  {
    id: "1",
    email: "user@example.com",
    name: "User Name",
    role: "user",
    passwordHash: hashPassword("securepassword123"),
    created_at: "2026-08-01T00:00:00.000Z",
    updated_at: "2026-08-01T00:00:00.000Z"
  },
  {
    id: "2",
    email: "admin@example.com",
    name: "Administrator",
    role: "admin",
    passwordHash: hashPassword("admin123"),
    created_at: "2026-08-01T00:00:00.000Z",
    updated_at: "2026-08-01T00:00:00.000Z"
  },
  {
    id: "3",
    email: "purnomo@example.com",
    name: "Purnomo Yusgiantoro",
    role: "agent_manager",
    passwordHash: hashPassword("purnomo123"),
    created_at: "2026-08-01T00:00:00.000Z",
    updated_at: "2026-08-01T00:00:00.000Z"
  }
];

let users = JSON.parse(JSON.stringify(DEFAULT_USERS));

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
  if (!id) return null;
  return users.find(u => String(u.id) === String(id)) || null;
}

/**
 * Create a new user in memory
 * @param {object} param0
 * @param {string} param0.name
 * @param {string} param0.email
 * @param {string} param0.password
 * @param {string} param0.role
 * @returns {object} created user without passwordHash
 */
function createUser({ name, email, password, role = 'user' }) {
  const maxId = users.reduce((max, u) => {
    const numId = parseInt(u.id, 10);
    return isNaN(numId) ? max : Math.max(max, numId);
  }, 0);
  const nextId = String(maxId + 1);
  const now = new Date().toISOString();

  const newUser = {
    id: nextId,
    email: email.trim().toLowerCase(),
    name: name.trim(),
    role: role || 'user',
    passwordHash: hashPassword(password),
    created_at: now,
    updated_at: now
  };

  users.push(newUser);

  return {
    id: newUser.id,
    email: newUser.email,
    name: newUser.name,
    role: newUser.role,
    created_at: newUser.created_at,
    updated_at: newUser.updated_at
  };
}

/**
 * Get all users without password hashes (for testing/debug)
 * @returns {Array}
 */
function getAllUsers() {
  return users.map(({ id, email, name, role, created_at, updated_at }) => ({
    id,
    email,
    name,
    role,
    created_at,
    updated_at
  }));
}

/**
 * Reset users to initial defaults
 */
function resetUsers() {
  users = JSON.parse(JSON.stringify(DEFAULT_USERS));
}

/**
 * Seed users
 */
function seedUsers(customUsers = []) {
  users = JSON.parse(JSON.stringify(customUsers));
}

module.exports = {
  findUserByEmail,
  findUserById,
  emailExists,
  createUser,
  getAllUsers,
  resetUsers,
  seedUsers
};
