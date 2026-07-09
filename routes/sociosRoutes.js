const express = require("express");
const router = express.Router();
const db = require("../config/db"); // Importamos tu pool de Postgres

// Arreglo temporal en memoria para guardar las notificaciones del Backoffice
let notificaciones = [];

// ==========================================
// 1. RUTAS DE NOTIFICACIONES
// ==========================================

// Obtener las notificaciones activas
router.get("/notificaciones", (req, res) => {
    res.json(notificaciones);
});

// Limpiar o marcar como leídas las notificaciones
router.post("/notificaciones/limpiar", (req, res) => {
    notificaciones = [];
    res.json({ success: true, message: "Notificaciones limpiadas" });
});

// ==========================================
// 2. RUTAS PRINCIPALES DE SOCIOS (GET, POST, DELETE)
// ==========================================

// Traer todos los socios
router.get("/", async (req, res) => {
    try {
        const queryTexto = "SELECT * FROM socios ORDER BY id ASC";
        const result = await db.query(queryTexto);
        
        // Mapeamos los campos en minúscula de Postgres a lo que espera tu frontend en JS
        const sociosMapeados = result.rows.map(socio => ({
            id: socio.id,
            nombre: socio.nombre,
            email: socio.email,
            telefono: socio.telefono || "Sin teléfono",
            planElegido: socio.plan_elegido,
            mensaje: socio.mensaje,
            fechaInscripcion: socio.fecha_inscripcion,
            peso: socio.peso,
            altura: socio.altura,
            sexo: socio.sexo,
            lesiones: socio.lesiones,
            actividadExtra: socio.actividad_extra,
            fechaInicioPlan: socio.fecha_inicio_plan,
            fechaFinPlan: socio.fecha_fin_plan
        }));

        res.json(sociosMapeados);
    } catch (error) {
        console.error("Error en GET /api/socios:", error);
        res.status(500).json({ error: "Error al obtener los socios desde Supabase" });
    }
});

// Guardar un nuevo socio (Inscripción pública)
router.post("/", async (req, res) => {
    const nombre = req.body.nombre || req.body.Nombre;
    const email = req.body.email || req.body.Email;
    const password = req.body.password || req.body.Password; 
    const telefono = req.body.telefono || req.body.Telefono;
    const planElegido = req.body.planElegido || req.body.PlanElegido;
    const mensaje = req.body.mensaje || req.body.Mensaje;

    if (!nombre || !email || !planElegido) {
        return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    try {
        // En Postgres usamos $1, $2... y manejamos las fechas de forma nativa
        const queryTexto = `
            INSERT INTO socios (nombre, email, password, rol, telefono, plan_elegido, mensaje, fecha_inscripcion, fecha_inicio_plan, fecha_fin_plan) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW(), NOW() + INTERVAL '1 month')
        `;
        
        const valores = [
            nombre,
            email,
            password || null,
            "cliente",
            telefono || null,
            planElegido,
            mensaje || null
        ];

        await db.query(queryTexto, valores);

        // Agregar la notificación al panel
        notificaciones.unshift({
            id: Date.now(),
            texto: `¡Nueva inscripción! 👤 ${nombre} se anotó en el plan ${planElegido.toUpperCase()}.`,
            fecha: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });

        res.status(201).json({ success: true, message: "Socio registrado con éxito." });
    } catch (error) {
        console.error("Error en POST /api/socios:", error);
        res.status(500).json({ error: "Error interno en la base de datos" });
    }
});

// Dar de baja un socio por ID
router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        await db.query("DELETE FROM socios WHERE id = $1", [id]);
        res.json({ success: true, message: `Socio #${id} dado de baja` });
    } catch (error) {
        console.error("Error en DELETE /api/socios:", error);
        res.status(500).json({ error: "No se pudo procesar la baja" });
    }
});

// ==========================================
// 3. RUTA DE AUTENTICACIÓN (LOGIN)
// ==========================================
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Faltan ingresar datos obligatorios" });
    }

    try {
        const queryTexto = "SELECT id, nombre, rol FROM socios WHERE email = $1 AND password = $2";
        const result = await db.query(queryTexto, [email, password]);

        if (result.rows.length > 0) {
            const usuario = result.rows[0];
            
            res.json({ 
                success: true, 
                rol: usuario.rol || 'cliente', 
                id: usuario.id,
                nombre: usuario.nombre 
            });
        } else {
            res.status(401).json({ success: false, error: "Email o contraseña incorrectos" });
        }
    } catch (error) {
        console.error("Error en POST /api/socios/login:", error);
        res.status(500).json({ error: "Error al intentar iniciar sesión" });
    }
});

// ==========================================
// 4. RUTAS DE EDICIÓN (CLIENTE Y ADMINISTRADOR)
// ==========================================

// Actualizar la ficha física y médica (La edita el propio Cliente)
router.put("/ficha/:id", async (req, res) => {
    const { id } = req.params;
    const { peso, altura, sexo, lesiones, actividadExtra } = req.body;

    try {
        const queryTexto = `
            UPDATE socios 
            SET peso = $1, altura = $2, sexo = $3, lesiones = $4, actividad_extra = $5 
            WHERE id = $6
        `;
        
        const valores = [
            peso ? parseFloat(peso) : null,
            altura ? parseFloat(altura) : null,
            sexo || null,
            lesiones || null,
            actividadExtra || null,
            id
        ];

        await db.query(queryTexto, valores);

        res.json({ success: true, message: "Ficha médica actualizada con éxito" });
    } catch (error) {
        console.error("Error en PUT /api/socios/ficha:", error);
        res.status(500).json({ error: "Error interno al actualizar la ficha médica" });
    }
});

// Modificar Plan y fechas de vigencia (La edita el Administrador)
router.put("/plan/:id", async (req, res) => {
    const { id } = req.params;
    const { planElegido, fechaInicioPlan, fechaFinPlan } = req.body;

    if (!planElegido || !fechaInicioPlan || !fechaFinPlan) {
        return res.status(400).json({ error: "Faltan ingresar datos obligatorios del plan" });
    }

    try {
        const queryTexto = `
            UPDATE socios 
            SET plan_elegido = $1, fecha_inicio_plan = $2, fecha_fin_plan = $3 
            WHERE id = $4
        `;
        
        await db.query(queryTexto, [planElegido, fechaInicioPlan, fechaFinPlan, id]);

        res.json({ success: true, message: "Plan y vigencia actualizados correctamente" });
    } catch (error) {
        console.error("Error en PUT /api/socios/plan:", error);
        res.status(500).json({ error: "Error interno al actualizar el plan del socio" });
    }
});

// ==========================================
// 5. RUTAS DEL HISTORIAL DE CARGAS (PESOS)
// ==========================================

// Registrar una nueva carga levantada por el alumno
router.post("/pesos", async (req, res) => {
    const { socioId, ejercicio, peso } = req.body;
    try {
        const queryTexto = `
            INSERT INTO historial_pesos (socio_id, ejercicio, peso, fecha) 
            VALUES ($1, $2, $3, NOW())
        `;
        await db.query(queryTexto, [socioId, ejercicio, parseFloat(peso)]);

        res.status(201).json({ success: true, message: "Carga registrada correctamente" });
    } catch (error) {
        console.error("Error en POST /api/socios/pesos:", error);
        res.status(500).json({ error: "No se pudo almacenar la carga" });
    }
});

// Obtener todo el historial de cargas de un alumno específico
router.get("/pesos/:socioId", async (req, res) => {
    const { socioId } = req.params;
    try {
        const queryTexto = "SELECT ejercicio, peso, fecha FROM historial_pesos WHERE socio_id = $1 ORDER BY fecha DESC";
        const result = await db.query(queryTexto, [socioId]);

        res.json(result.rows);
    } catch (error) {
        console.error("Error en GET /api/socios/pesos:", error);
        res.status(500).json({ error: "Error al traer el historial de cargas" });
    }
});

module.exports = router;