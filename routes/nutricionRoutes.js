const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { generarPlan, recetasDelPlan, RECETAS_POR_ID, OBJETIVOS } = require("../config/planNutricion");

const HOY_ARGENTINA = "(NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date";
const RESTRICCIONES = ["veg", "sintacc", "sinlactosa"];

// Datos del socio y de su plan del gimnasio (días de entrenamiento y si incluye nutrición)
async function datosSocio(socioId) {
    const socio = await db.query("SELECT id, nombre, plan_elegido FROM socios WHERE id = $1", [socioId]);
    if (socio.rows.length === 0) return null;
    const config = await db.query("SELECT valor FROM configuracion WHERE clave = 'planes'");
    const planes = config.rows.length ? config.rows[0].valor : [];
    const planGym = (planes || []).find(p => p.nombre === socio.rows[0].plan_elegido) || {};
    const numero = String(planGym.resumen || "").match(/(\d)\s*d[ií]a/i);
    return {
        ...socio.rows[0],
        incluyeNutricion: planes && planes.length ? Boolean(planGym.nutricion) : socio.rows[0].plan_elegido === "Premium",
        diasEntrenamiento: planGym.diasRutina || (numero ? Number(numero[1]) : 3)
    };
}

// Arma la respuesta con las recetas que usa el plan (para no mandar el recetario entero)
function respuesta(fila) {
    const recetas = {};
    recetasDelPlan(fila.plan).forEach(id => { if (RECETAS_POR_ID[id]) recetas[id] = RECETAS_POR_ID[id]; });
    return {
        id: fila.id,
        perfil: fila.perfil,
        plan: fila.plan,
        desde: fila.desde,
        hasta: fila.hasta,
        recetas
    };
}

async function crearPlan(socio, perfil, planAnterior) {
    const plan = generarPlan(perfil, {
        diasEntrenamiento: socio.diasEntrenamiento,
        recetasAnteriores: planAnterior ? recetasDelPlan(planAnterior) : [],
        semilla: `${socio.id}-${Date.now()}`
    });
    const r = await db.query(
        `INSERT INTO planes_nutricion (socio_id, perfil, plan, desde, hasta)
         VALUES ($1, $2, $3, ${HOY_ARGENTINA}, (${HOY_ARGENTINA} + interval '1 month')::date)
         RETURNING id, perfil, plan, to_char(desde, 'YYYY-MM-DD') AS desde, to_char(hasta, 'YYYY-MM-DD') AS hasta`,
        [socio.id, JSON.stringify(perfil), JSON.stringify(plan)]
    );
    return r.rows[0];
}

// Valida lo que manda el socio en el formulario
function limpiarPerfil(p) {
    const perfil = {
        objetivo: OBJETIVOS[p.objetivo] ? p.objetivo : null,
        peso: Number(p.peso),
        altura: Number(p.altura),
        edad: Math.round(Number(p.edad)),
        sexo: ["Masculino", "Femenino", "Otro"].includes(p.sexo) ? p.sexo : "Otro",
        restricciones: (Array.isArray(p.restricciones) ? p.restricciones : []).filter(r => RESTRICCIONES.includes(r)),
        colacion: Boolean(p.colacion)
    };
    if (perfil.altura > 3) perfil.altura = perfil.altura / 100;   // si la pusieron en centímetros
    if (!perfil.objetivo) throw new Error("Elegí tu objetivo");
    if (!(perfil.peso >= 30 && perfil.peso <= 250)) throw new Error("Revisá tu peso (en kg)");
    if (!(perfil.altura >= 1.2 && perfil.altura <= 2.3)) throw new Error("Revisá tu altura (en metros, ej: 1.75)");
    if (!(perfil.edad >= 14 && perfil.edad <= 90)) throw new Error("Revisá tu edad");
    return perfil;
}

// ==========================================
// 1. PLAN ACTUAL DEL SOCIO (GET /api/nutricion/:socioId)
//    Si el plan del mes ya venció, arma uno nuevo solo (con el mismo perfil)
// ==========================================
router.get("/:socioId", async (req, res) => {
    try {
        const socio = await datosSocio(req.params.socioId);
        if (!socio) return res.status(404).json({ error: "No encontramos tu cuenta" });
        if (!socio.incluyeNutricion) return res.status(403).json({ error: "Tu plan no incluye nutrición", sinAcceso: true });

        const ultimo = await db.query(
            `SELECT id, perfil, plan, to_char(desde, 'YYYY-MM-DD') AS desde, to_char(hasta, 'YYYY-MM-DD') AS hasta,
                    hasta <= ${HOY_ARGENTINA} AS vencido
             FROM planes_nutricion WHERE socio_id = $1 ORDER BY creado DESC LIMIT 1`,
            [socio.id]
        );
        if (ultimo.rows.length === 0) return res.status(404).json({ sinPlan: true });

        let fila = ultimo.rows[0];
        if (fila.vencido) {
            fila = await crearPlan(socio, fila.perfil, fila.plan);   // renovación mensual automática
            fila.renovado = true;
        }
        res.json({ ...respuesta(fila), renovado: Boolean(fila.renovado) });
    } catch (error) {
        console.error("Error en GET /api/nutricion:", error);
        res.status(500).json({ error: "No se pudo cargar tu plan de nutrición" });
    }
});

// ==========================================
// 2. ARMAR UN PLAN NUEVO (POST /api/nutricion/:socioId)  { perfil: {...} }
//    Se usa la primera vez y cuando el socio toca "Generar plan nuevo"
// ==========================================
router.post("/:socioId", async (req, res) => {
    let perfil;
    try {
        perfil = limpiarPerfil(req.body.perfil || {});
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }

    try {
        const socio = await datosSocio(req.params.socioId);
        if (!socio) return res.status(404).json({ error: "No encontramos tu cuenta" });
        if (!socio.incluyeNutricion) return res.status(403).json({ error: "Tu plan no incluye nutrición", sinAcceso: true });

        const anterior = await db.query(
            "SELECT plan FROM planes_nutricion WHERE socio_id = $1 ORDER BY creado DESC LIMIT 1",
            [socio.id]
        );
        const fila = await crearPlan(socio, perfil, anterior.rows.length ? anterior.rows[0].plan : null);

        // De paso se actualiza la ficha con el peso, la altura y el sexo
        await db.query("UPDATE socios SET peso = $1, altura = $2, sexo = $3 WHERE id = $4",
            [perfil.peso, perfil.altura, perfil.sexo, socio.id]);

        res.status(201).json(respuesta(fila));
    } catch (error) {
        console.error("Error en POST /api/nutricion:", error);
        res.status(500).json({ error: "No se pudo armar tu plan de nutrición" });
    }
});

module.exports = router;
