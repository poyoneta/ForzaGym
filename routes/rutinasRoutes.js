const express = require("express");
const router = express.Router();
const sql = require("mssql");

// Reutilizamos tu misma lógica exacta para mapear el servidor local
const dbServer = process.env.DB_SERVER ? process.env.DB_SERVER.replace(/\\/g, '\\\\') : "localhost";

const config = {
    user: process.env.DB_USER,          
    password: process.env.DB_PASSWORD,  
    server: dbServer, 
    database: process.env.DB_DATABASE,  
    options: {
        encrypt: false, 
        trustServerCertificate: true 
    }
};

// ==========================================
// ENDPOINTS GESTIÓN DE RUTINAS
// ==========================================

// 1. CREAR O ACTUALIZAR UNA RUTINA (POST /api/rutinas)
router.post("/", async (req, res) => {
    const { socioId, duracionSemanas, enfoque, ejercicios } = req.body;

    if (!socioId || !duracionSemanas || !enfoque || !ejercicios) {
        return res.status(400).json({ error: "Faltan ingresar datos obligatorios de la rutina" });
    }

    try {
        // Convertimos el array de ejercicios de JavaScript a una cadena JSON stringificada
        const ejerciciosJSON = JSON.stringify(ejercicios);
        
        // Abrimos conexión usando tu objeto de configuración real
        let pool = await sql.connect(config);

        // Verificamos si ya existe una rutina guardada para este socioId
        const checkResult = await pool.request()
            .input("socioId", sql.Int, socioId)
            .query("SELECT id FROM rutinas WHERE socioId = @socioId");

        if (checkResult.recordset.length > 0) {
            // SI YA EXISTE: Hacemos un UPDATE
            await pool.request()
                .input("socioId", sql.Int, socioId)
                .input("duracion", sql.Int, duracionSemanas)
                .input("enfoque", sql.VarChar(100), enfoque)
                .input("ejercicios", sql.VarChar(sql.MAX), ejerciciosJSON)
                .query("UPDATE rutinas SET duracionSemanas = @duracion, enfoque = @enfoque, ejercicios = @ejercicios WHERE socioId = @socioId");
            
            console.log(`[SQL Server] Rutina ACTUALIZADA para el socio #${socioId}`);
        } else {
            // SI NO EXISTE: Hacemos un INSERT
            await pool.request()
                .input("socioId", sql.Int, socioId)
                .input("duracion", sql.Int, duracionSemanas)
                .input("enfoque", sql.VarChar(100), enfoque)
                .input("ejercicios", sql.VarChar(sql.MAX), ejerciciosJSON)
                .query("INSERT INTO rutinas (socioId, duracionSemanas, enfoque, ejercicios) VALUES (@socioId, @duracion, @enfoque, @ejercicios)");
            
            console.log(`[SQL Server] Rutina CREADA para el socio #${socioId}`);
        }

        res.json({ success: true, message: "Rutina guardada con éxito en la base de datos." });
    } catch (error) {
        console.error("Error en POST /api/rutinas:", error);
        res.status(500).json({ error: "Error interno al guardar la rutina en SQL Server" });
    }
});

// 2. OBTENER LA RUTINA DE UN SOCIO (GET /api/rutinas/:socioId)
router.get("/:socioId", async (req, res) => {
    const { socioId } = req.params;

    try {
        let pool = await sql.connect(config);
        const result = await pool.request()
            .input("socioId", sql.Int, socioId)
            .query("SELECT * FROM rutinas WHERE socioId = @socioId");

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: "Este socio no tiene una rutina asignada todavía" });
        }

        const rutina = result.recordset[0];
        
        // Volvemos a convertir el VARCHAR(MAX) de texto de la DB a un array real de objetos JS
        rutina.ejercicios = JSON.parse(rutina.ejercicios);

        res.json(rutina);
    } catch (error) {
        console.error("Error en GET /api/rutinas/:socioId:", error);
        res.status(500).json({ error: "Error al obtener la rutina desde SQL Server" });
    }
});

// 3. ELIMINAR LA RUTINA DE UN SOCIO (DELETE /api/rutinas/:socioId)
router.delete("/:socioId", async (req, res) => {
    const { socioId } = req.params;

    try {
        let pool = await sql.connect(config);
        await pool.request()
            .input("socioId", sql.Int, socioId)
            .query("DELETE FROM rutinas WHERE socioId = @socioId");

        res.json({ success: true, message: "Rutina eliminada correctamente" });
    } catch (error) {
        console.error("Error en DELETE /api/rutinas/:socioId:", error);
        res.status(500).json({ error: "No se pudo eliminar la rutina" });
    }
});

module.exports = router;