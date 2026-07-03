const express = require("express");
const router = express.Router();
const sql = require("mssql");

// Corregimos la barra invertida reemplazándola para que no rompa el string en JS
const dbServer = process.env.DB_SERVER ? process.env.DB_SERVER.replace(/\\/g, '\\\\') : "localhost";

const config = {
    user: process.env.DB_USER,          
    password: process.env.DB_PASSWORD,  
    server: dbServer, 
    database: process.env.DB_DATABASE,  
    options: {
        encrypt: false, 
        trustServerCertificate: true 
    }
};

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

// Traer todos los socios con TODAS las columnas de la tabla
router.get("/", async (req, res) => {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request().query("SELECT * FROM Socios ORDER BY Id ASC");
        
        const sociosMapeados = result.recordset.map(socio => ({
            id: socio.Id,
            nombre: socio.Nombre,
            email: socio.Email,
            telefono: socio.Telefono || socio.telefono || "Sin teléfono",
            planElegido: socio.PlanElegido,
            mensaje: socio.Mensaje,
            fechaInscripcion: socio.FechaInscripcion,
            peso: socio.Peso,
            altura: socio.Altura,
            sexo: socio.Sexo,
            lesiones: socio.Lesiones,
            actividadExtra: socio.ActividadExtra,
            // ✨ Nuevos campos para que el Admin y el Cliente controlen las vigencias
            fechaInicioPlan: socio.FechaInicioPlan,
            fechaFinPlan: socio.FechaFinPlan
        }));

        res.json(sociosMapeados);
    } catch (error) {
        console.error("Error en GET /api/socios:", error);
        res.status(500).json({ error: "Error al obtener los socios desde SQL Server" });
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
        let pool = await sql.connect(config);
        
        await pool.request()
            .input("Nombre", sql.NVarChar(100), nombre)
            .input("Email", sql.NVarChar(100), email)
            .input("Password", sql.NVarChar(255), password || null)
            .input("Rol", sql.NVarChar(50), "cliente") 
            .input("Telefono", sql.NVarChar(50), telefono || null) 
            .input("PlanElegido", sql.NVarChar(50), planElegido)
            .input("Mensaje", sql.NVarChar(500), mensaje || null)
            .query("INSERT INTO Socios (Nombre, Email, Password, Rol, Telefono, PlanElegido, Mensaje, FechaInscripcion, FechaInicioPlan, FechaFinPlan) VALUES (@Nombre, @Email, @Password, @Rol, @Telefono, @PlanElegido, @Mensaje, GETDATE(), GETDATE(), DATEADD(month, 1, GETDATE()))");
            // Nota: Por defecto al inscribirse, se sugiere de manera automática 1 mes de duración con DATEADD

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
        let pool = await sql.connect(config);
        await pool.request()
            .input("Id", sql.Int, id)
            .query("DELETE FROM Socios WHERE Id = @Id");

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
        let pool = await sql.connect(config);
        
        let result = await pool.request()
            .input("Email", sql.NVarChar(100), email)
            .input("Password", sql.NVarChar(255), password)
            .query("SELECT Id, Nombre, Rol FROM Socios WHERE Email = @Email AND Password = @Password");

        if (result.recordset.length > 0) {
            const usuario = result.recordset[0];
            
            res.json({ 
                success: true, 
                rol: usuario.Rol || 'cliente', 
                id: usuario.Id,
                nombre: usuario.Nombre 
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
        let pool = await sql.connect(config);
        await pool.request()
            .input("Id", sql.Int, id)
            .input("Peso", sql.Decimal(5,2), peso ? parseFloat(peso) : null)
            .input("Altura", sql.Decimal(3,2), altura ? parseFloat(altura) : null)
            .input("Sexo", sql.NVarChar(20), sexo || null)
            .input("Lesiones", sql.NVarChar(sql.MAX), lesiones || null)
            .input("ActividadExtra", sql.NVarChar(sql.MAX), actividadExtra || null)
            .query("UPDATE Socios SET Peso = @Peso, Altura = @Altura, Sexo = @Sexo, Lesiones = @Lesiones, ActividadExtra = @ActividadExtra WHERE Id = @Id");

        res.json({ success: true, message: "Ficha médica actualizada con éxito" });
    } catch (error) {
        console.error("Error en PUT /api/socios/ficha:", error);
        res.status(500).json({ error: "Error interno al actualizar la ficha médica" });
    }
});

// ✨ NUEVA RUTA: Modificar Plan y fechas de vigencia (La edita el Administrador)
router.put("/plan/:id", async (req, res) => {
    const { id } = req.params;
    const { planElegido, fechaInicioPlan, fechaFinPlan } = req.body;

    if (!planElegido || !fechaInicioPlan || !fechaFinPlan) {
        return res.status(400).json({ error: "Faltan ingresar datos obligatorios del plan" });
    }

    try {
        let pool = await sql.connect(config);
        await pool.request()
            .input("Id", sql.Int, id)
            .input("PlanElegido", sql.NVarChar(50), planElegido)
            .input("FechaInicio", sql.DateTime, fechaInicioPlan)
            .input("FechaFin", sql.DateTime, fechaFinPlan)
            .query("UPDATE Socios SET PlanElegido = @PlanElegido, FechaInicioPlan = @FechaInicio, FechaFinPlan = @FechaFin WHERE Id = @Id");

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
        let pool = await sql.connect(config);
        await pool.request()
            .input("SocioId", sql.Int, socioId)
            .input("Ejercicio", sql.NVarChar(100), ejercicio)
            .input("Peso", sql.Decimal(5,2), parseFloat(peso))
            .query("INSERT INTO HistorialPesos (SocioId, Ejercicio, Peso, Fecha) VALUES (@SocioId, @Ejercicio, @Peso, GETDATE())");

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
        let pool = await sql.connect(config);
        let result = await pool.request()
            .input("SocioId", sql.Int, socioId)
            .query("SELECT Ejercicio, Peso, Fecha FROM HistorialPesos WHERE SocioId = @SocioId ORDER BY Fecha DESC");

        res.json(result.recordset);
    } catch (error) {
        console.error("Error en GET /api/socios/pesos:", error);
        res.status(500).json({ error: "Error al traer el historial de cargas" });
    }
});

module.exports = router;