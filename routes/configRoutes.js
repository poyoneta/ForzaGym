const express = require("express");
const router = express.Router();
const db = require("../config/db");

const CLAVES = ["planes", "horarios", "productos"];

// ==========================================
// Validaciones: que no se guarde nada roto
// ==========================================
const texto = (v, max = 300) => String(v ?? "").trim().slice(0, max);
const numeroOpcional = v => (v === null || v === "" || v === undefined || isNaN(Number(v)) ? null : Math.max(0, Number(v)));

function limpiarPlanes(lista) {
    if (!Array.isArray(lista) || lista.length === 0) throw new Error("Tiene que haber al menos un plan");
    const planes = lista.map(p => ({
        nombre: texto(p.nombre, 50),
        precio: numeroOpcional(p.precio) ?? 0,
        resumen: texto(p.resumen, 60),
        beneficios: (Array.isArray(p.beneficios) ? p.beneficios : []).map(b => texto(b, 120)).filter(Boolean).slice(0, 12),
        destacado: Boolean(p.destacado),
        nutricion: Boolean(p.nutricion)
    }));
    if (planes.some(p => !p.nombre)) throw new Error("Todos los planes necesitan un nombre");
    const nombres = planes.map(p => p.nombre.toLowerCase());
    if (new Set(nombres).size !== nombres.length) throw new Error("Hay dos planes con el mismo nombre");
    return planes;
}

function limpiarHorarios(lista) {
    if (!Array.isArray(lista)) throw new Error("Formato de horarios inválido");
    return lista
        .map(h => ({
            dias: texto(h.dias, 60),
            turnos: (Array.isArray(h.turnos) ? h.turnos : [])
                .map(t => ({ nombre: texto(t.nombre, 60), horario: texto(t.horario, 60) }))
                .filter(t => t.nombre || t.horario)
                .slice(0, 6)
        }))
        .filter(h => h.dias);
}

function limpiarProductos(lista) {
    if (!Array.isArray(lista)) throw new Error("Formato de indumentaria inválido");
    const productos = lista.map(p => ({
        nombre: texto(p.nombre, 80),
        descripcion: texto(p.descripcion, 300),
        precio: numeroOpcional(p.precio),
        imagen: texto(p.imagen, 300),
        fondoClaro: Boolean(p.fondoClaro),
        visible: p.visible !== false
    }));
    if (productos.some(p => !p.nombre)) throw new Error("Todas las prendas necesitan un nombre");
    // Solo se aceptan imágenes del propio sitio
    if (productos.some(p => p.imagen && !/^(imagenes\/[\w.\- ]+|\/api\/imagenes\/\d+)$/.test(p.imagen))) {
        throw new Error("Imagen inválida");
    }
    return productos;
}

const LIMPIADORES = { planes: limpiarPlanes, horarios: limpiarHorarios, productos: limpiarProductos };

// ==========================================
// ENDPOINTS
// ==========================================

// 1. TODA LA CONFIGURACIÓN (GET /api/config) - la usa el index
router.get("/", async (req, res) => {
    try {
        const result = await db.query("SELECT clave, valor FROM configuracion");
        const config = {};
        result.rows.forEach(fila => { config[fila.clave] = fila.valor; });
        res.json(config);
    } catch (error) {
        console.error("Error en GET /api/config:", error);
        res.status(500).json({ error: "Error al obtener la configuración" });
    }
});

// 2. UNA PARTE (GET /api/config/planes)
router.get("/:clave", async (req, res) => {
    const { clave } = req.params;
    if (!CLAVES.includes(clave)) return res.status(404).json({ error: "Configuración inexistente" });

    try {
        const result = await db.query("SELECT valor FROM configuracion WHERE clave = $1", [clave]);
        res.json(result.rows.length ? result.rows[0].valor : []);
    } catch (error) {
        console.error(`Error en GET /api/config/${clave}:`, error);
        res.status(500).json({ error: "Error al obtener la configuración" });
    }
});

// 3. GUARDAR UNA PARTE (PUT /api/config/planes) - la usa el backoffice
// Para planes se puede mandar "renombres": [{ de: "Plus", a: "Plus Full" }]
// así los socios y pagos que tenían el nombre viejo pasan al nuevo.
router.put("/:clave", async (req, res) => {
    const { clave } = req.params;
    if (!CLAVES.includes(clave)) return res.status(404).json({ error: "Configuración inexistente" });

    let valor;
    try {
        valor = LIMPIADORES[clave](req.body.valor);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }

    const cliente = await db.pool.connect();
    try {
        await cliente.query("BEGIN");

        if (clave === "planes" && Array.isArray(req.body.renombres)) {
            for (const r of req.body.renombres) {
                const de = texto(r.de, 50);
                const a = texto(r.a, 50);
                if (!de || !a || de === a) continue;
                await cliente.query("UPDATE socios SET plan_elegido = $1 WHERE plan_elegido = $2", [a, de]);
                await cliente.query("UPDATE pagos SET plan = $1 WHERE plan = $2", [a, de]);
            }
        }

        await cliente.query(
            `INSERT INTO configuracion (clave, valor, actualizado) VALUES ($1, $2, NOW())
             ON CONFLICT (clave) DO UPDATE SET valor = EXCLUDED.valor, actualizado = NOW()`,
            [clave, JSON.stringify(valor)]
        );

        await cliente.query("COMMIT");
        res.json({ success: true, valor });
    } catch (error) {
        await cliente.query("ROLLBACK");
        console.error(`Error en PUT /api/config/${clave}:`, error);
        res.status(500).json({ error: "No se pudo guardar la configuración" });
    } finally {
        cliente.release();
    }
});

module.exports = router;
