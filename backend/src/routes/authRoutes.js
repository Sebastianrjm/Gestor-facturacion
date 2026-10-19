const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile } = require('../controllers/authController');
const verifyToken = require('../middlewares/authMiddleware');
const multer = require('multer');

// Configurar multer para almacenar el archivo en memoria (Buffer)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 1024 * 1024 * 2 // Límite de 2MB
    },
    fileFilter: (req, file, cb) => {
        // Validar que solo sean imágenes PNG o SVG
        if (file.mimetype === 'image/png' || file.mimetype === 'image/svg+xml') {
            cb(null, true);
        } else {
            cb(new Error('Formato no soportado. Solo se permiten archivos PNG y SVG.'), false);
        }
    }
})

// Rutas Públicas
router.post('/register', register);
router.post('/login', login);

// Ruta Protegida (pasa primero por verifyToken)
router.get('/perfil', verifyToken, getMe);
router.put('/actualizar-perfil', verifyToken, upload.single('logo'), updateProfile);

module.exports = router;