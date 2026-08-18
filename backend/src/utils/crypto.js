const crypto = require('crypto');

/**
 * Hash a plain text password using scrypt
 * @param {string} password 
 * @param {string} salt (optional)
 * @returns {string} salt:hash format
 */
function hashPassword(password, salt = null) {
  const generatedSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, generatedSalt, 64).toString('hex');
  return `${generatedSalt}:${hash}`;
}

/**
 * Verify a plain text password against a stored salt:hash string
 * @param {string} password 
 * @param {string} storedHash 
 * @returns {boolean}
 */
function verifyPassword(password, storedHash) {
  if (!password || !storedHash || !storedHash.includes(':')) {
    return false;
  }
  const [salt, key] = storedHash.split(':');
  const hashedBuffer = crypto.scryptSync(password, salt, 64);
  const keyBuffer = Buffer.from(key, 'hex');
  if (hashedBuffer.length !== keyBuffer.length) {
    return false;
  }
  return crypto.timingSafeEqual(hashedBuffer, keyBuffer);
}

/**
 * Generate a secure authentication token for a user
 * @param {object} user 
 * @param {string} secret 
 * @returns {string}
 */
function generateToken(user, secret = 'default_secret') {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    sub: user.id,
    email: user.email,
    name: user.name,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
  })).toString('base64url');

  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${header}.${payload}`)
    .digest('base64url');

  return `${header}.${payload}.${signature}`;
}

module.exports = {
  hashPassword,
  verifyPassword,
  generateToken
};
