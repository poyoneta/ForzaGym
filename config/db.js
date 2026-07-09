const { Pool } = require("pg");
require("dotenv").config();

// Se usa la URL completa de conexión (Connection String) que nos da Supabase
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Requerido para conectarse de forma segura a Supabase
    }
});

pool.on("connect", () => {
    console.log("✅ Conectado con éxito a Supabase (PostgreSQL)");
});

pool.on("error", (err) => {
    console.error("❌ Error inesperado en el cliente de Supabase:", err);
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool
};