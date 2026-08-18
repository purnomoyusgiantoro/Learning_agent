const todoService = require('../services/todoService');

/**
 * Handle GET /api/v1/todos - List todos for current authenticated user
 */
async function listTodos(req, res, next) {
  try {
    const result = await todoService.getTodos(req.user.id, req.query);

    return res.status(result.status || 200).json({
      success: true,
      message: result.message,
      data: result.data,
      pagination: result.pagination,
      summary: result.summary
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Handle GET /api/v1/todos/:id - Get single todo by ID
 */
async function getTodo(req, res, next) {
  try {
    const { id } = req.params;
    const result = await todoService.getTodoById(id, req.user.id);

    if (!result.success) {
      return res.status(result.status || 404).json({
        success: false,
        message: result.message
      });
    }

    return res.status(result.status || 200).json({
      success: true,
      message: result.message,
      data: result.data
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Handle POST /api/v1/todos - Create new todo
 */
async function createTodo(req, res, next) {
  try {
    const result = await todoService.createTodo(req.user.id, req.body);

    return res.status(result.status || 201).json({
      success: true,
      message: result.message,
      data: result.data
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Handle PATCH /api/v1/todos/:id - Partial or complete update of todo
 */
async function updateTodo(req, res, next) {
  try {
    const { id } = req.params;
    const result = await todoService.updateTodo(id, req.user.id, req.body);

    if (!result.success) {
      return res.status(result.status || 400).json({
        success: false,
        message: result.message
      });
    }

    return res.status(result.status || 200).json({
      success: true,
      message: result.message,
      data: result.data
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Handle DELETE /api/v1/todos/:id - Delete todo
 */
async function deleteTodo(req, res, next) {
  try {
    const { id } = req.params;
    const result = await todoService.deleteTodo(id, req.user.id);

    if (!result.success) {
      return res.status(result.status || 400).json({
        success: false,
        message: result.message
      });
    }

    return res.status(result.status || 200).json({
      success: true,
      message: result.message,
      data: result.data
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listTodos,
  getTodos: listTodos,
  getTodo,
  getTodoDetail: getTodo,
  createTodo,
  updateTodo,
  deleteTodo
};
