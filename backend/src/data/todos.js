const crypto = require('crypto');

const DEFAULT_TODOS = [
  {
    id: "e4a2d3b4-1001-4000-8000-000000000001",
    user_id: "1",
    title: "Pelajari arsitektur Learning Agent",
    description: "Pelajari integrasi backend dan frontend sistem",
    is_completed: true,
    due_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    priority: "HIGH",
    created_at: new Date(Date.now() - 3600000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "todo-102",
    user_id: "1",
    title: "Selesaikan modul testing QA",
    description: "Buat automated test untuk API dan UI",
    is_completed: false,
    due_date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
    priority: "MEDIUM",
    created_at: new Date(Date.now() - 1800000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "e4a2d3b4-2002-4000-8000-000000000001",
    user_id: "2",
    title: "Tugas rahasia Admin",
    description: "Todo milik admin untuk verifikasi isolasi IDOR",
    is_completed: false,
    due_date: null,
    priority: "HIGH",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

let todos = JSON.parse(JSON.stringify(DEFAULT_TODOS));

/**
 * Find todos by user ID with filter and pagination
 * @param {string} userId
 * @param {object} options
 * @returns {object} { items, total, pagination, summary }
 */
function findTodosByUserId(userId, options = {}) {
  let userTodos = todos.filter(t => String(t.user_id) === String(userId));

  const totalAll = userTodos.length;
  const totalCompleted = userTodos.filter(t => t.is_completed).length;
  const totalActive = totalAll - totalCompleted;

  if (options.is_completed !== undefined && options.is_completed !== null && options.is_completed !== '') {
    const isCompleted = options.is_completed === true || options.is_completed === 'true' || options.is_completed === '1';
    userTodos = userTodos.filter(t => t.is_completed === isCompleted);
  }

  if (options.priority) {
    const p = String(options.priority).toUpperCase();
    userTodos = userTodos.filter(t => String(t.priority).toUpperCase() === p);
  }

  if (options.search) {
    const q = String(options.search).toLowerCase();
    userTodos = userTodos.filter(t =>
      (t.title && t.title.toLowerCase().includes(q)) ||
      (t.description && t.description.toLowerCase().includes(q))
    );
  }

  // Sort by field (default: created_at desc)
  const sortBy = options.sortBy || options.sort || 'created_at';
  const sortOrder = (options.sortOrder || options.order || 'desc').toLowerCase();

  userTodos.sort((a, b) => {
    let valA = a[sortBy] || '';
    let valB = b[sortBy] || '';
    if (sortBy === 'created_at' || sortBy === 'updated_at' || sortBy === 'due_date') {
      const timeA = valA ? new Date(valA).getTime() : 0;
      const timeB = valB ? new Date(valB).getTime() : 0;
      return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
    }
    if (typeof valA === 'string') {
      return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    return sortOrder === 'asc' ? valA - valB : valB - valA;
  });

  return {
    items: userTodos,
    total: userTodos.length,
    summary: {
      all: totalAll,
      total: totalAll,
      completed: totalCompleted,
      active: totalActive,
      pending: totalActive,
      progressPercentage: totalAll > 0 ? Math.round((totalCompleted / totalAll) * 100) : 0
    },
    pagination: {
      total: userTodos.length,
      page: parseInt(options.page, 10) || 1,
      limit: parseInt(options.limit, 10) || 50
    }
  };
}

/**
 * Direct array getter for backward compatibility
 */
function getTodosByUserId(userId, options = {}) {
  return findTodosByUserId(userId, options).items;
}

/**
 * Find single todo by ID
 * @param {string} id
 * @returns {object|null}
 */
function findTodoById(id) {
  if (!id) return null;
  return todos.find(t => String(t.id) === String(id)) || null;
}

/**
 * Create new todo
 * @param {object} data
 * @returns {object}
 */
function createTodo({ userId, title, description = null, due_date = null, priority = 'MEDIUM', is_completed = false }) {
  const newTodo = {
    id: `todo-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    user_id: String(userId),
    title: String(title).trim(),
    description: description ? String(description).trim() : null,
    is_completed: is_completed === true || is_completed === 'true',
    due_date: due_date || null,
    priority: (priority || 'MEDIUM').toUpperCase(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  todos.unshift(newTodo);
  return newTodo;
}

/**
 * Update todo with user ownership check
 * @param {string} id
 * @param {string} userId
 * @param {object} updates
 * @returns {object} { todo } or { error: 'NOT_FOUND'|'FORBIDDEN' }
 */
function updateTodo(id, userId, updates = {}) {
  const index = todos.findIndex(t => String(t.id) === String(id));
  if (index === -1) {
    return { error: 'NOT_FOUND' };
  }

  const current = todos[index];
  if (userId && String(current.user_id) !== String(userId)) {
    return { error: 'FORBIDDEN' };
  }

  const updated = {
    ...current,
    ...updates,
    id: current.id,
    user_id: current.user_id,
    created_at: current.created_at,
    updated_at: new Date().toISOString()
  };

  if (updates.is_completed !== undefined) {
    updated.is_completed = updates.is_completed === true || updates.is_completed === 'true';
  }

  todos[index] = updated;
  return { todo: updated };
}

/**
 * Delete todo with user ownership check
 * @param {string} id
 * @param {string} userId
 * @returns {object} { id } or { error: 'NOT_FOUND'|'FORBIDDEN' }
 */
function deleteTodo(id, userId) {
  const index = todos.findIndex(t => String(t.id) === String(id));
  if (index === -1) {
    return { error: 'NOT_FOUND' };
  }

  const current = todos[index];
  if (userId && String(current.user_id) !== String(userId)) {
    return { error: 'FORBIDDEN' };
  }

  const [removed] = todos.splice(index, 1);
  return { id: removed.id };
}

/**
 * Reset todos store
 */
function resetTodos() {
  todos = JSON.parse(JSON.stringify(DEFAULT_TODOS));
}

/**
 * Seed initial todos
 */
function seedTodos(initial = []) {
  todos = JSON.parse(JSON.stringify(initial));
}

module.exports = {
  findTodosByUserId,
  getTodosByUserId,
  findTodoById,
  createTodo,
  updateTodo,
  deleteTodo,
  resetTodos,
  seedTodos
};
