const express = require('express');
const router = express.Router();
const { register, login, logout, getMe, updateProfile, updatePassword } = require('../controllers/authController');
const verifyToken = require('../middlewares/authMiddleware');
const multer = require('multer');

// Configurar multer para almacenar el archivo en memoria (Buffer)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 2 * 1024 * 1024 // <-- 2MB limpios y sin símbolos raros
    },
    fileFilter: (req, file, cb) => {
        console.log("Mimetype recibido del archivo:", file.mimetype); // 👈 Revisa esto en tus logs
        
        // Acepta cualquier variante común de png o svg
        if (file.mimetype.includes('png') || file.mimetype.includes('svg') || file.mimetype.includes('image/')) {
            cb(null, true);
        } else {
            cb(new Error(`Formato no soportado: ${file.mimetype}`), false);
        }
    }
});

// Rutas Públicas
router.post('/register', register);
router.post('/login', login);

// Ruta Protegida (pasa primero por verifyToken)
router.get('/perfil', verifyToken, getMe);
router.put('/actualizar-perfil', verifyToken, upload.single('logo'), updateProfile);
router.put('/actualizar-password', verifyToken, updatePassword);
router.post('/logout', verifyToken, logout)

module.exports = router;