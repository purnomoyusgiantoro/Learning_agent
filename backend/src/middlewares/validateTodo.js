/**
 * Validation middleware for Todo creation
 */
function validateTodoCreate(req, res, next) {
  const errors = [];
  const { title, description, due_date, priority } = req.body || {};

  // Title validation
  if (title === undefined || title === null || typeof title !== 'string' || title.trim().length === 0) {
    errors.push('Judul todo (title) wajib diisi dan tidak boleh hanya berisi spasi');
  } else if (title.trim().length > 255) {
    errors.push('Judul todo tidak boleh melebihi 255 karakter (maksimal 255 karakter)');
  }

  // Description validation (optional)
  if (description !== undefined && description !== null && typeof description !== 'string') {
    errors.push('Deskripsi todo harus berupa teks');
  }

  // Due Date validation (optional)
  if (due_date !== undefined && due_date !== null && due_date !== '') {
    const parsedDate = new Date(due_date);
    if (isNaN(parsedDate.getTime())) {
      errors.push('Format due_date tidak valid. Gunakan format tanggal yang valid (YYYY-MM-DD atau ISO string)');
    }
  }

  // Priority validation (optional)
  if (priority !== undefined && priority !== null && priority !== '') {
    const validPriorities = ['LOW', 'MEDIUM', 'HIGH'];
    if (!validPriorities.includes(String(priority).toUpperCase())) {
      errors.push('Prioritas (priority) tidak valid. Nilai yang diizinkan: LOW, MEDIUM, HIGH');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validasi data todo gagal',
      errors
    });
  }

  next();
}

/**
 * Validation middleware for Todo update
 */
function validateTodoUpdate(req, res, next) {
  const errors = [];
  const { title, description, is_completed, due_date, priority } = req.body || {};

  // At least one field must be provided for update
  if (
    title === undefined &&
    description === undefined &&
    is_completed === undefined &&
    due_date === undefined &&
    priority === undefined
  ) {
    return res.status(400).json({
      success: false,
      message: 'Setidaknya satu field harus disediakan untuk pembaruan data',
      errors: ['Request body tidak berisi field yang dapat diperbarui']
    });
  }

  // Title validation (if provided)
  if (title !== undefined) {
    if (title === null || typeof title !== 'string' || title.trim().length === 0) {
      errors.push('Judul todo tidak boleh kosong');
    } else if (title.trim().length > 255) {
      errors.push('Judul todo tidak boleh melebihi 255 karakter (maksimal 255 karakter)');
    }
  }

  // is_completed validation (if provided)
  if (is_completed !== undefined) {
    if (typeof is_completed !== 'boolean' && is_completed !== 'true' && is_completed !== 'false') {
      errors.push('Field is_completed harus bernilai boolean (true/false)');
    }
  }

  // Due date validation (if provided and not null)
  if (due_date !== undefined && due_date !== null && due_date !== '') {
    const parsedDate = new Date(due_date);
    if (isNaN(parsedDate.getTime())) {
      errors.push('Format due_date tidak valid. Gunakan format tanggal yang valid (YYYY-MM-DD atau ISO string)');
    }
  }

  // Priority validation (if provided)
  if (priority !== undefined && priority !== null && priority !== '') {
    const validPriorities = ['LOW', 'MEDIUM', 'HIGH'];
    if (!validPriorities.includes(String(priority).toUpperCase())) {
      errors.push('Prioritas (priority) tidak valid. Nilai yang diizinkan: LOW, MEDIUM, HIGH');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validasi pembaruan todo gagal',
      errors
    });
  }

  next();
}

module.exports = {
  validateTodoCreate,
  validateTodoUpdate
};
