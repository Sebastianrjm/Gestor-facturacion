const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ 
            status: 'ERROR', 
            message: 'Acceso denegado. No se encontró la sesión activa.' 
        });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified; // { usuario, emisorId, email }
        next();
    } catch (error) {
        return res.status(403).json({ 
            status: 'ERROR', 
            message: 'Token inválido o expirado.' 
        });
    }
};

module.exports = verifyToken;