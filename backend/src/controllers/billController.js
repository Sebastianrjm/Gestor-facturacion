const db = require('../config/db');

const getNewBillInitialization = async (req, res) => {
  try {
    // El middleware verifyToken inyecta el usuario decodificado en req.user
    // (Asegúrate de que tu verifyToken guarde el id del usuario, ej: req.user.userId o req.user.id)
    const userId = req.user.userId || req.user.id;

    // 1. Obtener datos del usuario y del emisor (razón social y logo)
    const userQuery = `
      SELECT u.id AS usuario_id, u.nombre AS nombre_usuario, u.emisor_id, e.razon_social AS emisor, e.logo_url 
      FROM usuarios u 
      JOIN emisores e ON u.emisor_id = e.id 
      WHERE u.id = $1
    `;
    const userResult = await db.query(userQuery, [userId]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ status: 'ERROR', message: 'Usuario no encontrado' });
    }

    const { nombre_usuario, emisor_id, emisor, logo_url } = userResult.rows[0];

    // 2. Generar el nuevo código de factura (Folio automático basado en el año actual y conteo)
    const currentYear = new Date().getFullYear();
    
    const countQuery = `SELECT COUNT(*) FROM presupuestos WHERE emisor_id = $1`;
    const countResult = await db.query(countQuery, [emisor_id]);
    
    // El siguiente número será el total + 1 (con formato de 3 dígitos, ej: 025)
    const nextNumber = parseInt(countResult.rows[0].count, 10) + 1;
    const numeroFactura = `FAC-${currentYear}-${String(nextNumber).padStart(3, '0')}`;

    // 3. Retornar la estructura lista para tu formulario
    res.json({
      status: 'SUCCESS',
      data: {
        numeroFactura: numeroFactura,
        estadoFactura: 'BORRADOR',
        emisor: emisor || '',
        nombreUsuario: nombre_usuario || '',
        profileImage: logo_url 
      }
    });

  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      message: 'Error al inicializar los datos de la factura', 
      error: error.message 
    });
  }
};

getCurrencies = async (req, res) => {
    try{
        const query = `
        SELECT codigo, nombre, simbolo, activa
        FROM monedas
        WHERE activa = true
        `;
        const result = await db.query(query);

        if (result.rows.length === 0) {
            return res.status(404).json({ status: 'ERROR', message: 'Divisa no encontrada' });
        }

        res.json({
            status: 'SUCCESS',
            data: result.rows 
        });
    } catch (error) {
        res.status(500).json({ 
        status: 'ERROR', 
        message: 'No se encontraron las divisas', 
        error: error.message 
        });
    }
}

module.exports = {
  getNewBillInitialization,
  getCurrencies
};