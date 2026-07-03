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

// === NUEVA RUTA: Obtener las notificaciones activas ===
router.get("/notificaciones", (req, res) => {
    res.json(notificaciones);
});

// === NUEVA RUTA: Limpiar o marcar como leídas las notificaciones ===
router.post("/notificaciones/limpiar", (req, res) => {
    notificaciones = [];
    res.json({ success: true, message: "Notificaciones limpiadas" });
});

// 2. RUTA GET: Traer todos los socios (CORREGIDO: Ahora incluye teléfono)
router.get("/", async (req, res) => {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request().query("SELECT * FROM Socios ORDER BY Id ASC");
        
        const sociosMapeados = result.recordset.map(socio => ({
            id: socio.Id,
            nombre: socio.Nombre,
            email: socio.Email,
            // ✨ SE AGREGA EL TELÉFONO AL MAPEO (Soporta mayúscula y minúscula desde SQL Server)
            telefono: socio.Telefono || socio.telefono || "Sin teléfono",
            planElegido: socio.PlanElegido,
            mensaje: socio.Mensaje,
            fechaInscripcion: socio.FechaInscripcion
        }));

        res.json(sociosMapeados);
    } catch (error) {
        console.error("Error en GET /api/socios:", error);
        res.status(500).json({ error: "Error al obtener los socios desde SQL Server" });
    }
});

// 3. RUTA POST: Guardar un nuevo socio (CORREGIDO: Ahora guarda el teléfono)
router.post("/", async (req, res) => {
    const nombre = req.body.nombre || req.body.Nombre;
    const email = req.body.email || req.body.Email;
    // ✨ SE CAPTURA EL TELÉFONO QUE VIENE DEL FORMULARIO
    const telefono = req.body.telefono || req.body.Telefono;
    const planElegido = req.body.planElegido || req.body.PlanElegido;
    const mensaje = req.body.mensaje || req.body.Mensaje;

    if (!nombre || !email || !planElegido) {
        return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    try {
        let pool = await sql.connect(config);
        
        // ✨ SE AGREGA EL PARÁMETRO Y LA COLUMNA DE TELÉFONO AL INSERT
        await pool.request()
            .input("Nombre", sql.NVarChar(100), nombre)
            .input("Email", sql.NVarChar(100), email)
            .input("Telefono", sql.NVarChar(50), telefono || null) 
            .input("PlanElegido", sql.NVarChar(50), planElegido)
            .input("Mensaje", sql.NVarChar(500), mensaje || null)
            .query("INSERT INTO Socios (Nombre, Email, Telefono, PlanElegido, Mensaje, FechaInscripcion) VALUES (@Nombre, @Email, @Telefono, @PlanElegido, @Mensaje, GETDATE())");

        // 📢 AGREGAMOS LA NOTIFICACIÓN AL ARREGLO
        notificaciones.unshift({
            id: Date.now(),
            texto: `¡Nueva inscripción! 👤 ${nombre} se anotó en ${planElegido.toUpperCase()}.`,
            fecha: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });

        res.status(201).json({ success: true, message: "Socio registrado con éxito." });
    } catch (error) {
        console.error("Error en POST /api/socios:", error);
        res.status(500).json({ error: "Error interno en la base de datos" });
    }
});

// 4. RUTA DELETE: Dar de baja un socio por ID
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
// === NUEVA RUTA: Login de usuarios (Dueño o Cliente) ===
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Faltan ingresar datos obligatorios" });
    }

    try {
        let pool = await sql.connect(config);
        
        // Buscamos si existe el socio con ese email y esa contraseña exactas
        let result = await pool.request()
            .input("Email", sql.NVarChar(100), email)
            .input("Password", sql.NVarChar(255), password)
            .query("SELECT Id, Nombre, Rol FROM Socios WHERE Email = @Email AND Password = @Password");

        if (result.recordset.length > 0) {
            const usuario = result.recordset[0];
            
            // Si todo coincide, respondemos con éxito devolviendo los datos esenciales
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
module.exports = router;