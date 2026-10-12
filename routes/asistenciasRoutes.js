const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const db = require("../config/db");

// La fecha de la asistencia es la de Argentina (si alguien va a las 23:30, cuenta para ese día)
const HOY_ARGENTINA = "(NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date";

async function codigoActual() {
    const r = await db.query("SELECT valor FROM configuracion WHERE clave = 'codigo_asistencia'");
    return r.rows.length ? r.rows[0].valor : null;
}

// ==========================================
// 1. MARCAR ASISTENCIA desde el QR (POST /api/asistencias)
//    { socioId, codigo } -> una sola vez por día
// ==========================================
router.post("/", async (req, res) => {
    const socioId = Number(req.body.socioId);
    const codigo = String(req.body.codigo || "");

    if (!Number.isInteger(socioId) || !codigo) {
        return res.status(400).json({ error: "Faltan datos para registrar la asistencia" });
    }

    try {
        if (codigo !== await codigoActual()) {
            return res.status(403).json({ error: "El código QR no es válido. Escaneá el QR que está en la entrada del gimnasio." });
        }

        const socio = await db.query("SELECT id, nombre, plan_elegido, fecha_fin_plan FROM socios WHERE id = $1", [socioId]);
        if (socio.rows.length === 0) return res.status(404).json({ error: "No encontramos tu cuenta" });

        const insert = await db.query(
            `INSERT INTO asistencias (socio_id, fecha) VALUES ($1, ${HOY_ARGENTINA})
             ON CONFLICT (socio_id, fecha) DO NOTHING RETURNING id`,
            [socioId]
        );

        // Cuántas veces vino este mes (para mostrarle al socio)
        const mes = await db.query(
            `SELECT COUNT(*)::int AS total FROM asistencias
             WHERE socio_id = $1 AND date_trunc('month', fecha) = date_trunc('month', ${HOY_ARGENTINA})`,
            [socioId]
        );

        const s = socio.rows[0];
        res.status(insert.rows.length ? 201 : 200).json({
            success: true,
            yaRegistrada: insert.rows.length === 0,
            nombre: s.nombre,
            plan: s.plan_elegido,
            fechaFinPlan: s.fecha_fin_plan,
            asistenciasMes: mes.rows[0].total
        });
    } catch (error) {
        console.error("Error en POST /api/asistencias:", error);
        res.status(500).json({ error: "No se pudo registrar la asistencia" });
    }
});

// ==========================================
// 2. ASISTENCIAS DE UN PERÍODO (GET /api/asistencias?dias=90) - para el backoffice
// ==========================================
router.get("/", async (req, res) => {
    const dias = Math.min(Math.max(Number(req.query.dias) || 90, 1), 400);
    try {
        const result = await db.query(
            `SELECT socio_id, to_char(fecha, 'YYYY-MM-DD') AS fecha, hora
             FROM asistencias
             WHERE fecha > ${HOY_ARGENTINA} - $1::int
             ORDER BY hora DESC`,
            [dias]
        );
        res.json(result.rows.map(a => ({ socioId: a.socio_id, fecha: a.fecha, hora: a.hora })));
    } catch (error) {
        console.error("Error en GET /api/asistencias:", error);
        res.status(500).json({ error: "Error al obtener las asistencias" });
    }
});

// ==========================================
// 3. ÚLTIMA ASISTENCIA DE CADA SOCIO (GET /api/asistencias/ultimas)
//    para saber quién no viene hace rato
// ==========================================
router.get("/ultimas", async (req, res) => {
    try {
        const result = await db.query(
            `SELECT socio_id, to_char(MAX(fecha), 'YYYY-MM-DD') AS ultima
             FROM asistencias GROUP BY socio_id`
        );
        res.json(result.rows.map(r => ({ socioId: r.socio_id, ultima: r.ultima })));
    } catch (error) {
        console.error("Error en GET /api/asistencias/ultimas:", error);
        res.status(500).json({ error: "Error al obtener las asistencias" });
    }
});

// ==========================================
// 4. CÓDIGO DEL QR (GET) y GENERAR UNO NUEVO (POST) - para el backoffice
// ==========================================
router.get("/codigo", async (req, res) => {
    try {
        res.json({ codigo: await codigoActual() });
    } catch (error) {
        console.error("Error en GET /api/asistencias/codigo:", error);
        res.status(500).json({ error: "Error al obtener el código" });
    }
});

router.post("/codigo", async (req, res) => {
    try {
        const nuevo = crypto.randomBytes(6).toString("hex");
        await db.query(
            `INSERT INTO configuracion (clave, valor, actualizado) VALUES ('codigo_asistencia', $1, NOW())
             ON CONFLICT (clave) DO UPDATE SET valor = EXCLUDED.valor, actualizado = NOW()`,
            [JSON.stringify(nuevo)]
        );
        res.json({ codigo: nuevo });
    } catch (error) {
        console.error("Error en POST /api/asistencias/codigo:", error);
        res.status(500).json({ error: "No se pudo generar el código" });
    }
});

// ==========================================
// 5. ASISTENCIAS DE UN SOCIO (GET /api/asistencias/socio/5) - para su panel
// ==========================================
router.get("/socio/:id", async (req, res) => {
    try {
        const result = await db.query(
            `SELECT to_char(fecha, 'YYYY-MM-DD') AS fecha FROM asistencias
             WHERE socio_id = $1 AND fecha > ${HOY_ARGENTINA} - 120
             ORDER BY fecha DESC`,
            [req.params.id]
        );
        res.json(result.rows.map(r => r.fecha));
    } catch (error) {
        console.error("Error en GET /api/asistencias/socio:", error);
        res.status(500).json({ error: "Error al obtener tus asistencias" });
    }
});

module.exports = router;
