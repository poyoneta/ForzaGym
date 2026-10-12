const express = require("express");
const router = express.Router();
const db = require("../config/db"); // Tu pool de Postgres para Supabase

// ==========================================
// FORMATO DE LA RUTINA
// La rutina se arma POR DÍA. En la columna 'ejercicios' (TEXT) se guarda un JSON así:
// [
//   { "nombre": "Pecho y tríceps", "ejercicios": [ { "nombre": "Press banca", "series": 4, "repeticiones": "10", "descanso": "1m" } ] },
//   { "nombre": "Espalda y bíceps", "ejercicios": [ ... ] }
// ]
// Las rutinas viejas (una sola lista de ejercicios) se leen como un único "Día 1".
// ==========================================

const texto = (v, max) => String(v ?? "").trim().slice(0, max);

function limpiarEjercicio(e) {
    return {
        nombre: texto(e.nombre, 100),
        series: texto(e.series, 10),
        repeticiones: texto(e.repeticiones, 30),
        descanso: texto(e.descanso, 30)
    };
}

// Acepta el formato nuevo (días) o el viejo (lista de ejercicios) y devuelve siempre días
function normalizarDias(valor) {
    if (!Array.isArray(valor)) return [];
    const esPorDias = valor.length > 0 && valor.every(d => d && Array.isArray(d.ejercicios));
    const dias = esPorDias ? valor : [{ nombre: "", ejercicios: valor }];

    return dias
        .slice(0, 7)
        .map(d => ({
            nombre: texto(d.nombre, 60),
            ejercicios: (d.ejercicios || [])
                .filter(e => e && typeof e === "object")
                .map(limpiarEjercicio)
                .filter(e => e.nombre)
                .slice(0, 30)
        }));
}

function leerDias(valorGuardado, socioId) {
    try {
        const valor = typeof valorGuardado === "string" ? JSON.parse(valorGuardado) : (valorGuardado || []);
        return normalizarDias(valor);
    } catch (e) {
        console.error(`[Supabase] Rutina inválida para el socio #${socioId}:`, e.message);
        return [];
    }
}

// ==========================================
// ENDPOINTS GESTIÓN DE RUTINAS
// ==========================================

// 1. CREAR O ACTUALIZAR UNA RUTINA (POST /api/rutinas)
//    { socioId, duracionSemanas, enfoque, dias: [...] }  (también acepta el viejo "ejercicios")
router.post("/", async (req, res) => {
    const { socioId, duracionSemanas, enfoque } = req.body;
    const dias = normalizarDias(req.body.dias ?? req.body.ejercicios);

    if (!socioId || !duracionSemanas || !enfoque) {
        return res.status(400).json({ error: "Faltan ingresar datos obligatorios de la rutina" });
    }
    if (dias.length === 0 || dias.every(d => d.ejercicios.length === 0)) {
        return res.status(400).json({ error: "La rutina necesita al menos un ejercicio" });
    }

    try {
        const ejercicios = JSON.stringify(dias); // Se guarda como texto en la columna TEXT

        // Verificamos si ya existe una rutina para este socio_id
        const checkResult = await db.query("SELECT id FROM rutinas WHERE socio_id = $1", [socioId]);

        if (checkResult.rows.length > 0) {
            // SI YA EXISTE: Hacemos UPDATE
            await db.query(
                `UPDATE rutinas SET duracion_semanas = $1, enfoque = $2, ejercicios = $3 WHERE socio_id = $4`,
                [duracionSemanas, enfoque, ejercicios, socioId]
            );
            console.log(`[Supabase] Rutina ACTUALIZADA para el socio #${socioId} (${dias.length} días)`);
        } else {
            // SI NO EXISTE: Hacemos INSERT
            await db.query(
                `INSERT INTO rutinas (socio_id, duracion_semanas, enfoque, ejercicios) VALUES ($1, $2, $3, $4)`,
                [socioId, duracionSemanas, enfoque, ejercicios]
            );
            console.log(`[Supabase] Rutina CREADA para el socio #${socioId} (${dias.length} días)`);
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
        const result = await db.query("SELECT * FROM rutinas WHERE socio_id = $1", [socioId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Este socio no tiene una rutina asignada todavía" });
        }

        const rutinaRaw = result.rows[0];
        const dias = leerDias(rutinaRaw.ejercicios, socioId);

        res.json({
            id: rutinaRaw.id,
            socioId: rutinaRaw.socio_id,
            duracionSemanas: rutinaRaw.duracion_semanas,
            enfoque: rutinaRaw.enfoque,
            dias,
            // Lista plana de todos los ejercicios (por compatibilidad con pantallas viejas)
            ejercicios: dias.flatMap(d => d.ejercicios)
        });
    } catch (error) {
        console.error("Error en GET /api/rutinas/:socioId:", error);
        res.status(500).json({ error: "Error al obtener la rutina desde Supabase" });
    }
});

// 3. ELIMINAR LA RUTINA DE UN SOCIO (DELETE /api/rutinas/:socioId)
router.delete("/:socioId", async (req, res) => {
    const { socioId } = req.params;

    try {
        await db.query("DELETE FROM rutinas WHERE socio_id = $1", [socioId]);
        res.json({ success: true, message: "Rutina eliminada correctamente" });
    } catch (error) {
        console.error("Error en DELETE /api/rutinas/:socioId:", error);
        res.status(500).json({ error: "No se pudo eliminar la rutina" });
    }
});

module.exports = router;