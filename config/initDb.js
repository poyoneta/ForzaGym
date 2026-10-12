const db = require("./db");

// Crea las tablas nuevas si todavía no existen (se ejecuta al iniciar el servidor).
// Así no hace falta entrar a Supabase a correr SQL a mano.
async function inicializarBaseDeDatos() {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS pagos (
                id SERIAL PRIMARY KEY,
                socio_id INTEGER NOT NULL REFERENCES socios(id) ON DELETE CASCADE,
                monto NUMERIC(10, 2) NOT NULL DEFAULT 0,
                plan VARCHAR(50),
                periodo_desde DATE NOT NULL,
                periodo_hasta DATE NOT NULL,
                fecha_pago TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        `);
        await db.query(`CREATE INDEX IF NOT EXISTS idx_pagos_socio ON pagos (socio_id)`);
        console.log("✅ Tabla 'pagos' lista");
    } catch (error) {
        console.error("❌ No se pudo crear la tabla 'pagos':", error.message);
    }
}

module.exports = inicializarBaseDeDatos;
