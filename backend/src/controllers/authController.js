const db = require('../config/db');
const bcript = require('bcrypt');
const jwt = require('jsonwebtoken');

// 1. REGISTRO DE USUARIO Y EMISOR (Transacción)
const register = async (req, res) => {
    const { email, password, nombre, razonSocial, identificacionFiscal } = req.body;

    try{
        // Verifica si el usuario ya existe
        const userExist = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        if (userExist.rows.length > 0) {
            return res.status(400).json({ error: 'El correo electrónico ya está registrado.' });
        }

        // Encriptar contraseña
        const saltRounds = 10;
        const passwordHash = await bcript.hash(password, saltRounds);

        // Inicia la transacción
        await db.query('BEGIN');

        // Crear el emisor
        const emisorResult = await db.query(
            `INSERT INTO emisores (razon_social, identificacion_fiscal, email)
                VALUES ($1, $2, $3) RETURNING id`,
            [razonSocial, identificacionFiscal, email]
        );

        const emisorId = emisorResult.rows[0].id;

        // Crear el Usuario asociado al Emisor
        const userResult = await db.query(
            `INSERT INTO usuarios (emisor_id, email, password_hash, nombre)
                VALUES ($1, $2, $3, $4) RETURNING id`,
            [emisorId, email, passwordHash, nombre]
        );

        // Commit de la transacción
        await db.query('COMMIT');

        const user = userResult.rows[0];

        // Generar token JWT
        const token = jwt.sign(
            {usuario: user.id, emisorId: user.emisor_id, email: user.email},
            process.env.JWT_SECRET,
            {expiresIn: '1h'}
        )

        return res.status(201).json({ 
            message: 'Usuario registrado exitosamente.', 
            token,
            user: { id: user.id, email: user.email, nombre: user.nombre }
        });

    } catch (error) {
        await db.query('ROLLBACK');
        console.error('Error en registro:', error);
        return res.status(500).json({ error: 'Error interno del servidor al registrar.' });
    }
}

// 2. LOGIN DE USUARIO

const login = async (req, res) => { 
    const { email, password } = req.body;

    try {
        // Busca el usuario en la db

        const result = await db.query(
            'SELECT id, emisor_id, email, password_hash, nombre FROM usuarios WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Credenciales inválidas.' });
        }

        const user = result.rows[0];

        // Validar contraseña
        const validPassword = await bcript.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Credenciales inválidas.' });
        }

        // Generar token JWT
        const token = jwt.sign(
            { id: user.id, emisorID: user.emisor_id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        return res.json({
            message: 'Inicio de sesión exitoso',
            token,
            user: { id: user.id, nombre: user.nombre, email: user.email, emisorId: user.emisor_id }
        });
    } catch (error) {
        console.error('Error en login:', error);
        return res.status(500).json({ error: 'Error interno del servidor al iniciar sesión.' });
    }
};


const getMe = async (req, res) => {
  try {
    // req.user viene extraído del middleware verifyToken
    const userId = req.user.id;

    const result = await db.query(
      `SELECT u.id, u.nombre, u.email, u.created_at, 
              e.id AS emisor_id, e.razon_social, e.identificacion_fiscal
       FROM usuarios u
       INNER JOIN emisores e ON u.emisor_id = e.id
       WHERE u.id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    return res.json({
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

// Recuerda incluir getMe en los exports al final del archivo:
module.exports = {
  register,
  login,
  getMe,
};

module.exports = { register, login, getMe };