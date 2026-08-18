const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const validateLogin = require('../middlewares/validateLogin');
const validateRegister = require('../middlewares/validateRegister');

// POST /api/login and alias endpoints
router.post('/login', validateLogin, authController.login);

// POST /api/register and alias endpoints
router.post('/register', validateRegister, authController.register);

// POST /api/refresh and POST /api/auth/refresh
router.post('/refresh', authController.refresh);

// GET /api/profile and GET /api/auth/profile
router.get('/profile', authMiddleware, authController.profile);

module.exports = router;
