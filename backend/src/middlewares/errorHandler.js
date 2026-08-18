/**
 * 404 Not Found Middleware
 */
function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.originalUrl} tidak ditemukan`
  });
}

/**
 * Centralized Error Handler Middleware
 */
function errorHandler(err, req, res, next) {
  // Handle JSON parse error (e.g. malformed JSON in request body)
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: "Format JSON pada request body tidak valid",
      errors: [err.message]
    });
  }

  console.error('[Error]', err);

  // Default server error response
  return res.status(err.status || 500).json({
    success: false,
    message: err.message && process.env.NODE_ENV === 'development'
      ? err.message
      : "Terjadi kesalahan pada server"
  });
}

module.exports = {
  notFoundHandler,
  errorHandler
};
