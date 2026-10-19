const db = require('../config/db');
const bcript = require('bcrypt');
const jwt = require('jsonwebtoken');
const { uploadLogoToSupabase } = require('../services/supabaseService')

// 1. REGISTRO DE USUARIO Y EMISOR (Transacción)
const register = async (req, res) => {
    const { email, password, nombre, apellido, razonSocial, identificacionFiscal } = req.body;

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
            `INSERT INTO usuarios (emisor_id, email, password_hash, nombre, apellido)
                VALUES ($1, $2, $3, $4, $5) RETURNING id`,
            [emisorId, email, passwordHash, nombre, apellido]
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
            'SELECT id, emisor_id, email, password_hash, nombre, apellido FROM usuarios WHERE email = $1',
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
            { expiresIn: '1h' }
        );

        return res.json({
            message: 'Inicio de sesión exitoso',
            token,
            user: { id: user.id, nombre: user.nombre, email: user.email, emisorId: user.emisor_id, apellido: user.apellido }
        });
    } catch (error) {
        console.error('Error en login:', error);
        return res.status(500).json({ error: 'Error interno del servidor al iniciar sesión.' });
    }
};


const getMe = async (req, res) => {
  try {
    // req.user viene extraído del middleware verifyToken
    const userId = req.user.id || req.user.userId;

    const result = await db.query(
      `SELECT 
         u.id AS usuario_id, 
         u.nombre AS usuario_nombre, 
         u.apellido AS usuario_apellido, 
         u.email AS usuario_email, 
         u.created_at, 
         e.id AS emisor_id, 
         e.razon_social, 
         e.identificacion_fiscal,
         e.direccion,
         e.telefono,
         e.condiciones_defecto,
         e.logo_url
       FROM usuarios u
       INNER JOIN emisores e ON u.emisor_id = e.id
       WHERE u.id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'ERROR', message: 'Usuario no encontrado.' });
    }

    const data = result.rows[0];

    // Devolvemos el formato exacto que consume el frontend en MyProfile.tsx
    return res.json({
      status: 'SUCCESS',
      data: {
        usuario: {
          id: data.usuario_id,
          nombre: data.usuario_nombre,
          apellido: data.usuario_apellido,
          email: data.usuario_email
        },
        emisor: {
          id: data.emisor_id,
          razon_social: data.razon_social,
          identificacion_fiscal: data.identificacion_fiscal,
          direccion: data.direccion,
          telefono: data.telefono,
          notas_defecto: data.notas_defecto,
          logo_url: data.logo_url,
          condiciones_defecto: data.condiciones_defecto
        }
      }
    });

  } catch (error) {
    console.error('Error al obtener perfil:', error);
    return res.status(500).json({ status: 'ERROR', message: 'Error interno del servidor.' });
  }
};

const updateProfile = async (req, res) => {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    const userId = req.user.id || req.user.userId;
    const { nombres, apellidos, correo, direccionEmpresa, numeroEmpresa, notasDefecto } = req.body;

    // 1. Obtener el emisor_id asociado al usuario logueado
    const userRes = await client.query('SELECT emisor_id FROM usuarios WHERE id = $1', [userId]);
    if (userRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ status: 'ERROR', message: 'Usuario no encontrado.' });
    }
    const emisorId = userRes.rows[0].emisor_id;

    // 2. Si viene un archivo en la petición, subirlo a Supabase Storage
    let logoUrl = null;
    if (req.file) {
      // Determinar la extensión del archivo a partir de su mimetype
      const extension = req.file.mimetype === 'image/svg+xml' ? 'svg' : 'png';
      
      // Construir un nombre único basado en el emisorId
      const fileName = `logos/logo-${emisorId}.${extension}`;
      
      // Subir a Supabase Storage
      logoUrl = await uploadLogoToSupabase(
        req.file.buffer,
        fileName,
        req.file.mimetype
      );
    }

    // 3. Actualizar los datos personales en la tabla usuarios
    await client.query(
      `UPDATE usuarios 
       SET nombre = $1, apellido = $2, email = $3, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $4`,
      [nombres, apellidos, correo, userId]
    );

    // 4. Actualizar los datos de la empresa en la tabla emisores (incluyendo el logo si se subió uno nuevo)
    if (logoUrl) {
      await client.query(
        `UPDATE emisores 
         SET direccion = $1, telefono = $2, condiciones_defecto = $3, logo_url = $4, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $5`,
        [direccionEmpresa, numeroEmpresa, notasDefecto, logoUrl, emisorId]
      );
    } else {
      await client.query(
        `UPDATE emisores 
         SET direccion = $1, telefono = $2, condiciones_defecto = $3, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $4`,
        [direccionEmpresa, numeroEmpresa, notasDefecto, emisorId]
      );
    }

    await client.query('COMMIT');

    return res.status(200).json({
      status: 'SUCCESS',
      message: 'Perfil actualizado exitosamente.',
      data: {
        logoUrl: logoUrl || undefined
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al actualizar el perfil:', error);
    return res.status(500).json({ status: 'ERROR', message: 'Error interno del servidor.', error: error.message });
  } finally {
    client.release();
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile
};
