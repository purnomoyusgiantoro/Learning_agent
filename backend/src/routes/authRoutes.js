const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const validateLogin = require('../middlewares/validateLogin');
const validateRegister = require('../middlewares/validateRegister');

// POST /api/login and alias endpoints
router.post('/login', validateLogin, authController.login);

// POST /api/register and alias endpoints
router.post('/register', validateRegister, authController.register);

module.exports = router;
