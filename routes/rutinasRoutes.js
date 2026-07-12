const express = require("express");
const router = express.Router();
const db = require("../config/db"); // Tu pool de Postgres para Supabase

// ==========================================
// ENDPOINTS GESTIÓN DE RUTINAS
// ==========================================

// 1. CREAR O ACTUALIZAR UNA RUTINA (POST /api/rutinas)
router.post("/", async (req, res) => {
    let { socioId, duracionSemanas, enfoque, ejercicios } = req.body;

    if (!socioId || !duracionSemanas || !enfoque || !ejercicios) {
        return res.status(400).json({ error: "Faltan ingresar datos obligatorios de la rutina" });
    }

    try {
        // Aseguramos que 'ejercicios' se guarde como String puro para la columna TEXT
        if (typeof ejercicios !== "string") {
            ejercicios = JSON.stringify(ejercicios);
        }

        // Verificamos si ya existe una rutina para este socio_id
        const checkQuery = "SELECT id FROM rutinas WHERE socio_id = $1";
        const checkResult = await db.query(checkQuery, [socioId]);

        if (checkResult.rows.length > 0) {
            // SI YA EXISTE: Hacemos UPDATE
            const updateQuery = `
                UPDATE rutinas 
                SET duracion_semanas = $1, enfoque = $2, ejercicios = $3 
                WHERE socio_id = $4
            `;
            await db.query(updateQuery, [duracionSemanas, enfoque, ejercicios, socioId]);
            console.log(`[Supabase] Rutina ACTUALIZADA para el socio #${socioId}`);
        } else {
            // SI NO EXISTE: Hacemos INSERT
            const insertQuery = `
                INSERT INTO rutinas (socio_id, duracion_semanas, enfoque, ejercicios) 
                VALUES ($1, $2, $3, $4)
            `;
            await db.query(insertQuery, [socioId, duracionSemanas, enfoque, ejercicios]);
            console.log(`[Supabase] Rutina CREADA para el socio #${socioId}`);
        }

        res.json({ success: true, message: "Rutina guardada con éxito en la base de datos." });
    } catch (error) {
        console.error("Error en POST /api/rutinas:", error);
        res.status(500).json({ error: "Error interno al guardar la rutina en Supabase" });
    }
});

// 2. OBTENER LA RUTINA DE UN SOCIO (GET /api/rutinas/:socioId)
router.get("/:socioId", async (req, res) => {
    const { socioId } = req.params;

    try {
        const queryTexto = "SELECT * FROM rutinas WHERE socio_id = $1";
        const result = await db.query(queryTexto, [socioId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Este socio no tiene una rutina asignada todavía" });
        }

        const rutinaRaw = result.rows[0];

        // Mapeamos directo los campos al frontend. 
        // Como 'ejercicios' ya es texto en la DB, pasa directo sin alterar.
        const rutina = {
            id: rutinaRaw.id,
            socioId: rutinaRaw.socio_id,
            duracionSemanas: rutinaRaw.duracion_semanas,
            enfoque: rutinaRaw.enfoque,
            ejercicios: rutinaRaw.ejercicios 
        };

        res.json(rutina);
    } catch (error) {
        console.error("Error en GET /api/rutinas/:socioId:", error);
        res.status(500).json({ error: "Error al obtener la rutina desde Supabase" });
    }
});

// 3. ELIMINAR LA RUTINA DE UN SOCIO (DELETE /api/rutinas/:socioId)
router.delete("/:socioId", async (req, res) => {
    const { socioId } = req.params;

    try {
        const queryTexto = "DELETE FROM rutinas WHERE socio_id = $1";
        await db.query(queryTexto, [socioId]);
        res.json({ success: true, message: "Rutina eliminada correctamente" });
    } catch (error) {
        console.error("Error en DELETE /api/rutinas/:socioId:", error);
        res.status(500).json({ error: "No se pudo eliminar la rutina" });
    }
});

module.exports = router;