/**
 * Middleware to validate registration request body
 */
function validateRegister(req, res, next) {
  const { name, email, password } = req.body || {};
  const errors = [];

  // Validate name (required, min 2 chars)
  if (!name || typeof name !== 'string' || !name.trim()) {
    errors.push("Nama wajib diisi");
  } else if (name.trim().length < 2) {
    errors.push("Nama minimal 2 karakter");
  }

  // Validate email (required, valid format)
  if (!email || typeof email !== 'string' || !email.trim()) {
    errors.push("Email wajib diisi");
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      errors.push("Format email tidak valid");
    }
  }

  // Validate password (required, min 6 chars)
  if (!password || typeof password !== 'string' || !password.trim()) {
    errors.push("Password wajib diisi");
  } else if (password.trim().length < 6) {
    errors.push("Password minimal 6 karakter");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Data registrasi tidak lengkap atau tidak valid",
      errors
    });
  }

  next();
}

module.exports = validateRegister;
