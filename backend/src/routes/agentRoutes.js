const express = require('express');
const router = express.Router();
const agentController = require('../controllers/agentController');
const authMiddleware = require('../middlewares/authMiddleware');
const { validateCreateAgent, validateUpdateAgent } = require('../middlewares/validateAgent');
const validateExecution = require('../middlewares/validateExecution');
const { mutationRateLimiter } = require('../middlewares/rateLimiter');

// List all user agents
router.get('/', authMiddleware, agentController.list);

// Create new agent configuration
router.post('/', authMiddleware, mutationRateLimiter, validateCreateAgent, agentController.create);

// Get single agent details
router.get('/:id', authMiddleware, agentController.getById);

// Update agent configuration
router.put('/:id', authMiddleware, mutationRateLimiter, validateUpdateAgent, agentController.update);
router.patch('/:id', authMiddleware, mutationRateLimiter, validateUpdateAgent, agentController.update);

// Delete agent configuration
router.delete('/:id', authMiddleware, mutationRateLimiter, agentController.remove);

// Execute agent learning loop / task
router.post('/:id/execute', authMiddleware, mutationRateLimiter, validateExecution, agentController.execute);

// Get agent execution status
router.get('/:id/status', authMiddleware, agentController.getStatus);

// Get agent learning logs
router.get('/:id/logs', authMiddleware, agentController.getLogs);

// Get agent metrics
router.get('/:id/metrics', authMiddleware, agentController.getMetrics);

module.exports = router;
