const express = require('express');
const router = express.Router();
const todoController = require('../controllers/todoController');
const authMiddleware = require('../middlewares/authMiddleware');
const { validateTodoCreate, validateTodoUpdate } = require('../middlewares/validateTodo');
const { mutationRateLimiter } = require('../middlewares/rateLimiter');

// Protect all todo endpoints with authentication middleware
router.use(authMiddleware);

// GET /api/v1/todos - List todos for authenticated user
router.get('/', todoController.getTodos);

// GET /api/v1/todos/:id - Get single todo by ID
router.get('/:id', todoController.getTodo);

// POST /api/v1/todos - Create new todo
router.post('/', mutationRateLimiter, validateTodoCreate, todoController.createTodo);

// PATCH /api/v1/todos/:id - Update todo status / fields
router.patch('/:id', mutationRateLimiter, validateTodoUpdate, todoController.updateTodo);

// PUT /api/v1/todos/:id - Alias for update
router.put('/:id', mutationRateLimiter, validateTodoUpdate, todoController.updateTodo);

// DELETE /api/v1/todos/:id - Delete todo
router.delete('/:id', mutationRateLimiter, todoController.deleteTodo);

module.exports = router;
