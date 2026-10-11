const express = require('express');
const router = express.Router();
const { getPlantillas, getPlantillaById } = require('../controllers/templateController');
const verifyToken = require('../middlewares/authMiddleware');

// Ambas rutas estarán protegidas por el token del usuario
router.get('/', verifyToken, getPlantillas);
router.get('/:id', verifyToken, getPlantillaById);

module.exports = router;