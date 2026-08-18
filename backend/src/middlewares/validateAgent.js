/**
 * Middleware to validate Agent creation payload
 */
function validateCreateAgent(req, res, next) {
  const errors = [];
  const { name, model, temperature, max_tokens, learning_rate, discount_factor, exploration_rate } = req.body || {};

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.push('Nama agen (name) wajib diisi');
  } else if (name.trim().length < 3) {
    errors.push('Nama agen minimal 3 karakter');
  } else if (name.trim().length > 100) {
    errors.push('Nama agen maksimal 100 karakter');
  }

  if (model !== undefined && (typeof model !== 'string' || model.trim().length === 0)) {
    errors.push('Model harus berupa teks yang valid');
  }

  if (temperature !== undefined && temperature !== null && temperature !== '') {
    const tempNum = Number(temperature);
    if (isNaN(tempNum) || tempNum < 0 || tempNum > 2.0) {
      errors.push('Temperature harus berupa angka antara 0.0 dan 2.0');
    }
  }

  if (max_tokens !== undefined && max_tokens !== null && max_tokens !== '') {
    const tokensNum = Number(max_tokens);
    if (isNaN(tokensNum) || tokensNum < 1 || tokensNum > 32000) {
      errors.push('Max tokens harus berupa angka integer antara 1 dan 32000');
    }
  }

  if (learning_rate !== undefined && learning_rate !== null && learning_rate !== '') {
    const lrNum = Number(learning_rate);
    if (isNaN(lrNum) || lrNum <= 0 || lrNum > 1.0) {
      errors.push('Learning rate harus berupa angka antara 0.0 dan 1.0');
    }
  }

  if (discount_factor !== undefined && discount_factor !== null && discount_factor !== '') {
    const dfNum = Number(discount_factor);
    if (isNaN(dfNum) || dfNum < 0 || dfNum > 1.0) {
      errors.push('Discount factor harus berupa angka antara 0.0 dan 1.0');
    }
  }

  if (exploration_rate !== undefined && exploration_rate !== null && exploration_rate !== '') {
    const erNum = Number(exploration_rate);
    if (isNaN(erNum) || erNum < 0 || erNum > 1.0) {
      errors.push('Exploration rate harus berupa angka antara 0.0 dan 1.0');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validasi konfigurasi agen gagal',
      errors
    });
  }

  next();
}

/**
 * Middleware to validate Agent update payload
 */
function validateUpdateAgent(req, res, next) {
  const errors = [];
  const { name, model, temperature, max_tokens, learning_rate, discount_factor, exploration_rate } = req.body || {};

  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim().length === 0) {
      errors.push('Nama agen (name) tidak boleh kosong');
    } else if (name.trim().length < 3) {
      errors.push('Nama agen minimal 3 karakter');
    } else if (name.trim().length > 100) {
      errors.push('Nama agen maksimal 100 karakter');
    }
  }

  if (model !== undefined && (typeof model !== 'string' || model.trim().length === 0)) {
    errors.push('Model harus berupa teks yang valid');
  }

  if (temperature !== undefined && temperature !== null && temperature !== '') {
    const tempNum = Number(temperature);
    if (isNaN(tempNum) || tempNum < 0 || tempNum > 2.0) {
      errors.push('Temperature harus berupa angka antara 0.0 dan 2.0');
    }
  }

  if (max_tokens !== undefined && max_tokens !== null && max_tokens !== '') {
    const tokensNum = Number(max_tokens);
    if (isNaN(tokensNum) || tokensNum < 1 || tokensNum > 32000) {
      errors.push('Max tokens harus berupa angka integer antara 1 dan 32000');
    }
  }

  if (learning_rate !== undefined && learning_rate !== null && learning_rate !== '') {
    const lrNum = Number(learning_rate);
    if (isNaN(lrNum) || lrNum <= 0 || lrNum > 1.0) {
      errors.push('Learning rate harus berupa angka antara 0.0 dan 1.0');
    }
  }

  if (discount_factor !== undefined && discount_factor !== null && discount_factor !== '') {
    const dfNum = Number(discount_factor);
    if (isNaN(dfNum) || dfNum < 0 || dfNum > 1.0) {
      errors.push('Discount factor harus berupa angka antara 0.0 dan 1.0');
    }
  }

  if (exploration_rate !== undefined && exploration_rate !== null && exploration_rate !== '') {
    const erNum = Number(exploration_rate);
    if (isNaN(erNum) || erNum < 0 || erNum > 1.0) {
      errors.push('Exploration rate harus berupa angka antara 0.0 dan 1.0');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validasi pembaruan agen gagal',
      errors
    });
  }

  next();
}

module.exports = {
  validateCreateAgent,
  validateUpdateAgent
};
