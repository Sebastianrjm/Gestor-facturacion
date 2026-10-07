const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const verifyToken = require('../middlewares/authMiddleware');

// Rutas Públicas
router.post('/register', register);
router.post('/login', login);

// Ruta Protegida (pasa primero por verifyToken)
router.get('/me', verifyToken, getMe);

module.exports = router;