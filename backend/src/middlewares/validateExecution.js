/**
 * Middleware to validate Agent execution payload
 */
function validateExecution(req, res, next) {
  const errors = [];
  const { prompt, iterations, parameters } = req.body || {};

  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    errors.push('Prompt eksekusi (prompt) wajib diisi');
  } else if (prompt.trim().length > 10000) {
    errors.push('Prompt eksekusi maksimal 10.000 karakter');
  }

  if (iterations !== undefined && iterations !== null && iterations !== '') {
    const iterNum = Number(iterations);
    if (isNaN(iterNum) || !Number.isInteger(iterNum) || iterNum < 1 || iterNum > 100) {
      errors.push('Jumlah iterasi (iterations) harus berupa bilangan bulat antara 1 dan 100');
    }
  }

  if (parameters !== undefined && (typeof parameters !== 'object' || parameters === null || Array.isArray(parameters))) {
    errors.push('Parameters harus berupa JSON Object yang valid');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validasi eksekusi agen gagal',
      errors
    });
  }

  next();
}

module.exports = validateExecution;
