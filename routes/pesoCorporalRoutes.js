const express = require("express");
const crypto = require("crypto");
const router = express.Router();
const db = require("../config/db");

const HOY_ARGENTINA = "(NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date";

// Las fotos de progreso son privadas: no se piden por número (1, 2, 3...) como las de
// indumentaria, sino con un código al azar de 32 caracteres imposible de adivinar.
const urlFoto = clave => (clave ? `/api/peso-corporal/foto/${clave}` : null);

function fila(r) {
    return {
        id: r.id,
        fecha: r.fecha,
        peso: Number(r.peso),
        nota: r.nota || "",
        foto: urlFoto(r.foto_clave)
    };
}

// Después de guardar o borrar, la ficha del socio queda con el último peso registrado
async function actualizarPesoFicha(socioId) {
    await db.query(
        `UPDATE socios SET peso = (
             SELECT peso FROM registros_peso_corporal WHERE socio_id = $1 ORDER BY fecha DESC LIMIT 1
         ) WHERE id = $1
         AND EXISTS (SELECT 1 FROM registros_peso_corporal WHERE socio_id = $1)`,
        [socioId]
    );
}

// ==========================================
// 1. VER UNA FOTO (GET /api/peso-corporal/foto/:clave)
//    Va antes que "/:socioId" para que no se confundan las rutas
// ==========================================
router.get("/foto/:clave", async (req, res) => {
    try {
        if (!/^[a-f0-9]{32}$/.test(req.params.clave)) return res.status(404).end();
        const r = await db.query("SELECT foto, foto_tipo FROM registros_peso_corporal WHERE foto_clave = $1", [req.params.clave]);
        if (r.rows.length === 0 || !r.rows[0].foto) return res.status(404).end();
        res.set("Content-Type", r.rows[0].foto_tipo || "image/jpeg");
        res.set("Cache-Control", "private, no-store");   // no queda guardada en ningún lado
        res.send(r.rows[0].foto);
    } catch (error) {
        console.error("Error en GET /api/peso-corporal/foto:", error);
        res.status(500).end();
    }
});

// ==========================================
// 2. HISTORIAL DEL SOCIO (GET /api/peso-corporal/:socioId) — del más viejo al más nuevo
// ==========================================
router.get("/:socioId", async (req, res) => {
    try {
        const r = await db.query(
            `SELECT id, to_char(fecha, 'YYYY-MM-DD') AS fecha, peso, nota, foto_clave
             FROM registros_peso_corporal WHERE socio_id = $1 ORDER BY fecha ASC`,
            [req.params.socioId]
        );
        res.json(r.rows.map(fila));
    } catch (error) {
        console.error("Error en GET /api/peso-corporal:", error);
        res.status(500).json({ error: "No se pudo cargar tu historial de peso" });
    }
});

// ==========================================
// 3. REGISTRAR PESO (POST /api/peso-corporal/:socioId)  { peso, fecha?, nota?, foto? (dataURL) }
//    Un registro por día: si ya cargaste ese día, se actualiza.
//    Si no mandás foto nueva, se conserva la que había.
// ==========================================
router.post("/:socioId", async (req, res) => {
    const socioId = Number(req.params.socioId);
    const peso = Math.round(Number(String(req.body.peso).replace(",", ".")) * 10) / 10;
    const nota = String(req.body.nota || "").trim().slice(0, 200);
    const fecha = /^\d{4}-\d{2}-\d{2}$/.test(req.body.fecha || "") ? req.body.fecha : null;

    if (!socioId) return res.status(400).json({ error: "Falta el socio" });
    if (!(peso >= 30 && peso <= 300)) return res.status(400).json({ error: "Revisá el peso (en kg)" });

    let foto = null, fotoTipo = null;
    if (req.body.foto) {
        const partes = String(req.body.foto).match(/^data:(image\/(?:jpeg|png|webp));base64,(.+)$/);
        if (!partes) return res.status(400).json({ error: "La foto no es válida" });
        foto = Buffer.from(partes[2], "base64");
        fotoTipo = partes[1];
        if (foto.length > 3 * 1024 * 1024) return res.status(400).json({ error: "La foto es muy pesada" });
    }

    try {
        const existe = await db.query("SELECT 1 FROM socios WHERE id = $1", [socioId]);
        if (existe.rows.length === 0) return res.status(404).json({ error: "No encontramos tu cuenta" });

        // La fecha no puede ser futura ni de hace más de 2 años
        const fechaSql = `LEAST(GREATEST(COALESCE($5::date, ${HOY_ARGENTINA}), (${HOY_ARGENTINA} - interval '2 years')::date), ${HOY_ARGENTINA})`;
        const r = await db.query(
            `INSERT INTO registros_peso_corporal (socio_id, fecha, peso, nota, foto, foto_tipo, foto_clave)
             VALUES ($1, ${fechaSql}, $2, $3, $4, $6, CASE WHEN $4::bytea IS NULL THEN NULL ELSE $7 END)
             ON CONFLICT (socio_id, fecha) DO UPDATE SET
                 peso = EXCLUDED.peso,
                 nota = EXCLUDED.nota,
                 foto = COALESCE(EXCLUDED.foto, registros_peso_corporal.foto),
                 foto_tipo = COALESCE(EXCLUDED.foto_tipo, registros_peso_corporal.foto_tipo),
                 foto_clave = COALESCE(EXCLUDED.foto_clave, registros_peso_corporal.foto_clave),
                 creado = NOW()
             RETURNING id, to_char(fecha, 'YYYY-MM-DD') AS fecha, peso, nota, foto_clave`,
            [socioId, peso, nota || null, foto, fecha, fotoTipo, crypto.randomBytes(16).toString("hex")]
        );
        await actualizarPesoFicha(socioId);
        res.status(201).json(fila(r.rows[0]));
    } catch (error) {
        console.error("Error en POST /api/peso-corporal:", error);
        res.status(500).json({ error: "No se pudo guardar tu peso" });
    }
});

// ==========================================
// 4. BORRAR SOLO LA FOTO (DELETE /api/peso-corporal/:socioId/:id/foto)
// ==========================================
router.delete("/:socioId/:id/foto", async (req, res) => {
    try {
        const r = await db.query(
            `UPDATE registros_peso_corporal SET foto = NULL, foto_tipo = NULL, foto_clave = NULL
             WHERE id = $1 AND socio_id = $2`,
            [req.params.id, req.params.socioId]
        );
        if (r.rowCount === 0) return res.status(404).json({ error: "No encontramos ese registro" });
        res.json({ ok: true });
    } catch (error) {
        console.error("Error en DELETE foto /api/peso-corporal:", error);
        res.status(500).json({ error: "No se pudo borrar la foto" });
    }
});

// ==========================================
// 5. BORRAR UN REGISTRO (DELETE /api/peso-corporal/:socioId/:id)
// ==========================================
router.delete("/:socioId/:id", async (req, res) => {
    try {
        const r = await db.query("DELETE FROM registros_peso_corporal WHERE id = $1 AND socio_id = $2",
            [req.params.id, req.params.socioId]);
        if (r.rowCount === 0) return res.status(404).json({ error: "No encontramos ese registro" });
        await actualizarPesoFicha(req.params.socioId);
        res.json({ ok: true });
    } catch (error) {
        console.error("Error en DELETE /api/peso-corporal:", error);
        res.status(500).json({ error: "No se pudo borrar el registro" });
    }
});

module.exports = router;
