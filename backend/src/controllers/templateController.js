const db = require('../config/db');

// Obtener todas las plantillas disponibles
const getPlantillas = async (req, res) => {
  try {
    const result = await db.query('SELECT id, nombre, descripcion, preview_image_url FROM plantillas_presupuesto ORDER BY id ASC');
    res.json({
      status: 'SUCCESS',
      data: result.rows
    });
  } catch (error) {
    res.status(500).json({ status: 'ERROR', message: 'Error al obtener las plantillas', error: error.message });
  }
};

// Obtener una plantilla específica por su ID (para cuando cargues NewBill.tsx)
const getPlantillaById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('SELECT id, nombre, descripcion, preview_image_url FROM plantillas_presupuesto WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'ERROR', message: 'Plantilla no encontrada' });
    }

    res.json({
      status: 'SUCCESS',
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ status: 'ERROR', message: 'Error al obtener la plantilla', error: error.message });
  }
};

module.exports = {
  getPlantillas,
  getPlantillaById
};