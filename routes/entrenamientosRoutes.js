const express = require("express");
const router = express.Router();
const db = require("../config/db");

const HOY_ARGENTINA = "(NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date";

// ==========================================
// 1. RUTINAS COMPLETADAS DEL SOCIO (GET /api/entrenamientos/:socioId)
//    Se usan para los logros y la racha semanal
// ==========================================
router.get("/:socioId", async (req, res) => {
    try {
        const r = await db.query(
            `SELECT to_char(fecha, 'YYYY-MM-DD') AS fecha, dia, nombre_dia AS "nombreDia", ejercicios
             FROM entrenamientos WHERE socio_id = $1 ORDER BY fecha DESC, dia`,
            [req.params.socioId]
        );
        res.json(r.rows);
    } catch (error) {
        console.error("Error en GET /api/entrenamientos:", error);
        res.status(500).json({ error: "No se pudieron cargar tus entrenamientos" });
    }
});

// ==========================================
// 2. MARCAR UN DÍA DE RUTINA COMO COMPLETADO HOY (POST /api/entrenamientos/:socioId)
//    { dia: 0, nombreDia: "Piernas", ejercicios: 6 }
// ==========================================
router.post("/:socioId", async (req, res) => {
    const dia = Number(req.body.dia);
    if (!Number.isInteger(dia) || dia < 0 || dia > 13) return res.status(400).json({ error: "Día inválido" });
    try {
        const existe = await db.query("SELECT 1 FROM socios WHERE id = $1", [req.params.socioId]);
        if (existe.rows.length === 0) return res.status(404).json({ error: "No encontramos tu cuenta" });
        await db.query(
            `INSERT INTO entrenamientos (socio_id, fecha, dia, nombre_dia, ejercicios)
             VALUES ($1, ${HOY_ARGENTINA}, $2, $3, $4)
             ON CONFLICT (socio_id, fecha, dia) DO NOTHING`,
            [req.params.socioId, dia, String(req.body.nombreDia || "").slice(0, 100) || null,
             Math.max(0, Math.min(50, Number(req.body.ejercicios) || 0))]
        );
        res.status(201).json({ ok: true });
    } catch (error) {
        console.error("Error en POST /api/entrenamientos:", error);
        res.status(500).json({ error: "No se pudo guardar tu entrenamiento" });
    }
});

// ==========================================
// 3. DESMARCAR (DELETE /api/entrenamientos/:socioId/:dia) — solo el de hoy
// ==========================================
router.delete("/:socioId/:dia", async (req, res) => {
    try {
        await db.query(
            `DELETE FROM entrenamientos WHERE socio_id = $1 AND dia = $2 AND fecha = ${HOY_ARGENTINA}`,
            [req.params.socioId, Number(req.params.dia)]
        );
        res.json({ ok: true });
    } catch (error) {
        console.error("Error en DELETE /api/entrenamientos:", error);
        res.status(500).json({ error: "No se pudo desmarcar" });
    }
});

module.exports = router;
