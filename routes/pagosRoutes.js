const express = require("express");
const router = express.Router();
const db = require("../config/db");

// ==========================================
// ENDPOINTS DE PAGOS (historial para el gráfico del backoffice)
// ==========================================

// 1. LISTAR TODOS LOS PAGOS (GET /api/pagos)
router.get("/", async (req, res) => {
    try {
        // Las fechas DATE se devuelven como texto "AAAA-MM-DD" para que no se corran por la zona horaria
        const queryTexto = `
            SELECT id, socio_id, monto, plan,
                   to_char(periodo_desde, 'YYYY-MM-DD') AS periodo_desde,
                   to_char(periodo_hasta, 'YYYY-MM-DD') AS periodo_hasta,
                   fecha_pago
            FROM pagos
            ORDER BY fecha_pago DESC
        `;
        const result = await db.query(queryTexto);

        const pagos = result.rows.map(p => ({
            id: p.id,
            socioId: p.socio_id,
            monto: Number(p.monto),
            plan: p.plan,
            periodoDesde: p.periodo_desde,
            periodoHasta: p.periodo_hasta,
            fechaPago: p.fecha_pago
        }));

        res.json(pagos);
    } catch (error) {
        console.error("Error en GET /api/pagos:", error);
        res.status(500).json({ error: "Error al obtener los pagos" });
    }
});

// 2. REGISTRAR UN PAGO (POST /api/pagos)
router.post("/", async (req, res) => {
    const { socioId, monto, plan, periodoDesde, periodoHasta } = req.body;

    if (!socioId || !periodoDesde || !periodoHasta) {
        return res.status(400).json({ error: "Faltan datos obligatorios del pago" });
    }

    try {
        const queryTexto = `
            INSERT INTO pagos (socio_id, monto, plan, periodo_desde, periodo_hasta)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id
        `;
        const result = await db.query(queryTexto, [
            socioId,
            Number(monto) || 0,
            plan || null,
            periodoDesde,
            periodoHasta
        ]);

        res.status(201).json({ success: true, id: result.rows[0].id });
    } catch (error) {
        console.error("Error en POST /api/pagos:", error);
        res.status(500).json({ error: "No se pudo registrar el pago" });
    }
});

// 3. ELIMINAR UN PAGO cargado por error (DELETE /api/pagos/:id)
router.delete("/:id", async (req, res) => {
    try {
        await db.query("DELETE FROM pagos WHERE id = $1", [req.params.id]);
        res.json({ success: true });
    } catch (error) {
        console.error("Error en DELETE /api/pagos:", error);
        res.status(500).json({ error: "No se pudo eliminar el pago" });
    }
});

module.exports = router;
