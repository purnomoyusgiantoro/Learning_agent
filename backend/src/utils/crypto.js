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
  if (!salt || !key) {
    return false;
  }
  const hashedBuffer = crypto.scryptSync(password, salt, 64);
  const keyBuffer = Buffer.from(key, 'hex');
  if (hashedBuffer.length !== keyBuffer.length) {
    return false;
  }
  return crypto.timingSafeEqual(hashedBuffer, keyBuffer);
}

/**
 * Generate a secure JWT authentication token for a user
 * @param {object} user 
 * @param {string} secret 
 * @param {number} expiresInSeconds (default: 24h = 86400s)
 * @returns {string}
 */
function generateToken(user, secret = 'default_secret', expiresInSeconds = 86400) {
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    sub: user.id || user.sub,
    id: user.id || user.sub,
    email: user.email,
    name: user.name,
    role: user.role || 'user',
    token_type: 'access',
    iat: now,
    exp: now + expiresInSeconds
  })).toString('base64url');

  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${header}.${payload}`)
    .digest('base64url');

  return `${header}.${payload}.${signature}`;
}

/**
 * Generate a secure refresh token for a user
 * @param {object} user 
 * @param {string} secret 
 * @param {number} expiresInSeconds (default: 7 days = 604800s)
 * @returns {string}
 */
function generateRefreshToken(user, secret = 'default_secret', expiresInSeconds = 604800) {
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    sub: user.id || user.sub,
    id: user.id || user.sub,
    email: user.email,
    name: user.name,
    role: user.role || 'user',
    token_type: 'refresh',
    token_id: crypto.randomBytes(16).toString('hex'),
    iat: now,
    exp: now + expiresInSeconds
  })).toString('base64url');

  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${header}.${payload}`)
    .digest('base64url');

  return `${header}.${payload}.${signature}`;
}

/**
 * Verify an authentication or refresh token
 * @param {string} token 
 * @param {string} secret 
 * @returns {object} { valid: boolean, payload?: object, error?: string, expired?: boolean }
 */
function verifyToken(token, secret = 'default_secret') {
  if (!token || typeof token !== 'string') {
    return { valid: false, error: 'Token autentikasi tidak disediakan' };
  }

  const parts = token.trim().split('.');
  if (parts.length !== 3) {
    return { valid: false, error: 'Format token tidak valid' };
  }

  const [headerB64, payloadB64, signatureB64] = parts;

  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${headerB64}.${payloadB64}`)
      .digest('base64url');

    const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
    const providedBuffer = Buffer.from(signatureB64, 'utf8');

    if (expectedBuffer.length !== providedBuffer.length || !crypto.timingSafeEqual(expectedBuffer, providedBuffer)) {
      return { valid: false, error: 'Signature token tidak valid' };
    }

    const payloadJson = Buffer.from(payloadB64, 'base64url').toString('utf8');
    const payload = JSON.parse(payloadJson);

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return { valid: false, error: 'Token telah kedaluwarsa', expired: true };
    }

    return {
      valid: true,
      payload: {
        id: payload.sub || payload.id,
        sub: payload.sub || payload.id,
        email: payload.email,
        name: payload.name,
        role: payload.role || 'user',
        token_type: payload.token_type || 'access',
        iat: payload.iat,
        exp: payload.exp
      }
    };
  } catch (err) {
    return { valid: false, error: 'Gagal memverifikasi token' };
  }
}

module.exports = {
  hashPassword,
  verifyPassword,
  generateToken,
  generateRefreshToken,
  verifyToken
};
