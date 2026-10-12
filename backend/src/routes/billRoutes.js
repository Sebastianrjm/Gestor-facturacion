const express = require('express');
const router = express.Router();
const { getNewBillInitialization, getCurrencies, saveBill, generateBillPDF } = require('../controllers/billController');
const verifyToken = require('../middlewares/authMiddleware');

// Ruta protegida para obtener los datos iniciales de una nueva factura
router.get('/nuevo', verifyToken, getNewBillInitialization);
router.get('/divisas', verifyToken, getCurrencies);
router.post('/', verifyToken, saveBill);
router.get('/:id/pdf', verifyToken, generateBillPDF);

module.exports = router;