const express = require('express');
const router = express.Router();
const { getNewBillInitialization, getCurrencies, saveBill, generateBillPDF, updateInvoiceStatus, getDashboardData, getInvoiceById  } = require('../controllers/billController');
const verifyToken = require('../middlewares/authMiddleware');

// verifyToken sirve para proteger las rutas
// Rutas fijas
router.get('/dashboard', verifyToken, getDashboardData);
router.get('/nuevo', verifyToken, getNewBillInitialization);
router.get('/divisas', verifyToken, getCurrencies);

// Rutas dinamicas
router.patch('/:id/estado', verifyToken, updateInvoiceStatus);
router.get('/:id', verifyToken, getInvoiceById);
router.post('/', verifyToken, saveBill);
router.get('/:id/pdf', verifyToken, generateBillPDF);

module.exports = router;