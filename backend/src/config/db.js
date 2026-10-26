const { Pool } = require('pg');
require('dotenv').config();

// Configuración compatible con Supabase y entorno local
const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false } // Requerido para conexiones externas a Supabase
    }
  : {
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT || 5432,
    };

const pool = new Pool(poolConfig);

pool.on('connect', () => {
    console.log("Conexión exitosa a la base de datos");
});

pool.on("error", (err) => { 
    console.error("Error en la conexión a la base de datos", err);
    process.exit(-1);
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool
};