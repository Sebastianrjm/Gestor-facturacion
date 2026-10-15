// backend/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Importar rutas y conexión a la BD
const db = require('./src/config/db');
const authRoutes = require('./src/routes/authRoutes');
const templateRoutes = require('./src/routes/templateRoutes');
const billRoutes = require('./src/routes/billRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares globales
app.use(cors()); // Permitir peticiones desde el Frontend
app.use(express.json()); // Parsear JSON en el body de las peticiones

// Rutas de la API
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/plantillas', templateRoutes);
app.use('/api/v1/presupuestos', billRoutes);


// Ruta de prueba de estado del servidor
app.get('/api/v1/health', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW()');
    res.json({ 
      status: 'OK', 
      message: 'Servidor y PostgreSQL funcionando correctamente',
      dbTime: result.rows[0].now 
    });
  } catch (error) {
    res.status(500).json({ status: 'ERROR', message: 'Error al conectar a la base de datos', error: error.message });
  }
});
app.get('/api/ping', (req, res) => {
  res.send('pong');
});

// Capturadora de cualquier cosa para 404 debe ir siempre al final

app.use((req, res) => {
  res.status(404).json({
    status: 'ERROR',
    message: 'El endpoint de la API solicitado no existe'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});