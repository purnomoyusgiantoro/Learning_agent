const todosData = require('../data/todos');

/**
 * Get all todos for an authenticated user with query filters, pagination, and progress summary
 * @param {string} userId 
 * @param {object} options 
 * @returns {object}
 */
async function getTodos(userId, options = {}) {
  const result = todosData.findTodosByUserId(userId, options);

  return {
    success: true,
    status: 200,
    message: 'Daftar todo berhasil diambil',
    data: result.items,
    pagination: result.pagination,
    summary: result.summary
  };
}

/**
 * Get single todo by ID with strict resource ownership validation (Zero-IDOR)
 * @param {string} id 
 * @param {string} userId 
 * @returns {object}
 */
async function getTodoById(id, userId) {
  const todo = todosData.findTodoById(id);

  if (!todo) {
    return {
      success: false,
      status: 404,
      message: 'Todo tidak ditemukan'
    };
  }

  // IDOR Protection: Verify resource ownership
  if (String(todo.user_id) !== String(userId)) {
    return {
      success: false,
      status: 403,
      message: 'Akses ditolak: Anda tidak memiliki izin untuk mengakses todo ini'
    };
  }

  return {
    success: true,
    status: 200,
    message: 'Detail todo berhasil diambil',
    data: todo
  };
}

/**
 * Create a new todo item for the authenticated user
 * @param {string} userId 
 * @param {object} data 
 * @returns {object}
 */
async function createTodo(userId, data = {}) {
  const newTodo = todosData.createTodo({
    userId,
    title: data.title,
    description: data.description,
    due_date: data.due_date,
    priority: data.priority,
    is_completed: data.is_completed
  });

  return {
    success: true,
    status: 201,
    message: 'Todo berhasil ditambahkan',
    data: newTodo
  };
}

/**
 * Update todo item with strict resource ownership verification (Zero-IDOR)
 * @param {string} id 
 * @param {string} userId 
 * @param {object} updates 
 * @returns {object}
 */
async function updateTodo(id, userId, updates = {}) {
  const result = todosData.updateTodo(id, userId, updates);

  if (result.error === 'NOT_FOUND') {
    return {
      success: false,
      status: 404,
      message: 'Todo tidak ditemukan'
    };
  }

  if (result.error === 'FORBIDDEN') {
    return {
      success: false,
      status: 403,
      message: 'Akses ditolak: Anda tidak memiliki izin untuk memperbarui todo ini'
    };
  }

  return {
    success: true,
    status: 200,
    message: 'Todo berhasil diperbarui',
    data: result.todo
  };
}

/**
 * Delete todo item with strict resource ownership verification (Zero-IDOR)
 * @param {string} id 
 * @param {string} userId 
 * @returns {object}
 */
async function deleteTodo(id, userId) {
  const result = todosData.deleteTodo(id, userId);

  if (result.error === 'NOT_FOUND') {
    return {
      success: false,
      status: 404,
      message: 'Todo tidak ditemukan'
    };
  }

  if (result.error === 'FORBIDDEN') {
    return {
      success: false,
      status: 403,
      message: 'Akses ditolak: Anda tidak memiliki izin untuk menghapus todo ini'
    };
  }

  return {
    success: true,
    status: 200,
    message: 'Todo berhasil dihapus',
    data: { id: result.id }
  };
}

module.exports = {
  getTodos,
  getUserTodos: getTodos,
  getTodoById,
  getTodoDetail: getTodoById,
  createTodo,
  createUserTodo: createTodo,
  updateTodo,
  updateUserTodo: updateTodo,
  deleteTodo,
  deleteUserTodo: deleteTodo
};
