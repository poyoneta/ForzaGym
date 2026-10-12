const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Las fotos se guardan en la base de datos porque en Render el disco se borra en cada deploy.
// El backoffice las achica antes de subirlas (máx. ~1000 px), así que pesan poco.

const TIPOS_PERMITIDOS = ["image/jpeg", "image/png", "image/webp"];
const TAMANO_MAXIMO = 3 * 1024 * 1024; // 3 MB

// 1. SUBIR UNA FOTO (POST /api/imagenes) con { imagen: "data:image/jpeg;base64,..." }
router.post("/", async (req, res) => {
    const coincidencia = /^data:(image\/[a-z]+);base64,(.+)$/.exec(req.body.imagen || "");
    if (!coincidencia || !TIPOS_PERMITIDOS.includes(coincidencia[1])) {
        return res.status(400).json({ error: "Formato de imagen no válido (usá JPG, PNG o WEBP)" });
    }

    const datos = Buffer.from(coincidencia[2], "base64");
    if (datos.length > TAMANO_MAXIMO) {
        return res.status(400).json({ error: "La imagen es demasiado grande" });
    }

    try {
        const result = await db.query(
            "INSERT INTO imagenes (tipo, datos) VALUES ($1, $2) RETURNING id",
            [coincidencia[1], datos]
        );
        const id = result.rows[0].id;
        res.status(201).json({ success: true, id, url: `/api/imagenes/${id}` });
    } catch (error) {
        console.error("Error en POST /api/imagenes:", error);
        res.status(500).json({ error: "No se pudo guardar la imagen" });
    }
});

// 2. VER UNA FOTO (GET /api/imagenes/5)
router.get("/:id", async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(404).end();

    try {
        const result = await db.query("SELECT tipo, datos FROM imagenes WHERE id = $1", [id]);
        if (result.rows.length === 0) return res.status(404).end();

        res.set("Content-Type", result.rows[0].tipo);
        res.set("Cache-Control", "public, max-age=31536000, immutable"); // Una foto subida nunca cambia
        res.send(result.rows[0].datos);
    } catch (error) {
        console.error("Error en GET /api/imagenes:", error);
        res.status(500).end();
    }
});

module.exports = router;
