/**
 * Middleware to validate login request body
 */
function validateLogin(req, res, next) {
  const { email, password } = req.body || {};
  const errors = [];

  // Check email presence
  if (!email || typeof email !== 'string' || !email.trim()) {
    errors.push("Email wajib diisi");
  } else {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      errors.push("Format email tidak valid");
    }
  }

  // Check password presence
  if (!password || typeof password !== 'string' || !password.trim()) {
    errors.push("Password wajib diisi");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Email dan password wajib diisi dengan format yang benar",
      errors
    });
  }

  next();
}

module.exports = validateLogin;
