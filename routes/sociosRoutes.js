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

// 2. RUTA GET: Traer todos los socios y mapearlos a minúsculas para tu frontend
router.get("/", async (req, res) => {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request().query("SELECT * FROM Socios ORDER BY Id ASC");
        
        // Convertimos las mayúsculas de SQL a las minúsculas que espera tu script.js / admin.html
        const sociosMapeados = result.recordset.map(socio => ({
            id: socio.Id,
            nombre: socio.Nombre,
            email: socio.Email,
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

// 3. RUTA POST: Guardar un nuevo socio (Soporta si vienen en mayúscula o minúscula)
router.post("/", async (req, res) => {
    // Capturamos las variables admitiendo ambas variantes por si acaso
    const nombre = req.body.nombre || req.body.Nombre;
    const email = req.body.email || req.body.Email;
    const planElegido = req.body.planElegido || req.body.PlanElegido;
    const mensaje = req.body.mensaje || req.body.Mensaje;

    if (!nombre || !email || !planElegido) {
        return res.status(400).json({ error: "Faltan datos obligatorios (Nombre, Email o Plan)" });
    }

    try {
        let pool = await sql.connect(config);
        
        await pool.request()
            .input("Nombre", sql.NVarChar(100), nombre)
            .input("Email", sql.NVarChar(100), email)
            .input("PlanElegido", sql.NVarChar(50), planElegido)
            .input("Mensaje", sql.NVarChar(500), mensaje || null)
            .query("INSERT INTO Socios (Nombre, Email, PlanElegido, Mensaje, FechaInscripcion) VALUES (@Nombre, @Email, @PlanElegido, @Mensaje, GETDATE())");

        console.log("\n==================================================");
        console.log("📢 🚀 ¡NUEVA INSCRIPCIÓN GUARDADA EN BASE DE DATOS!");
        console.log(`👤 Socio: ${nombre}`);
        console.log("==================================================\n");

        res.status(201).json({ success: true, message: "Socio registrado con éxito en SQL Server." });
    } catch (error) {
        console.error("Error en POST /api/socios:", error);
        res.status(500).json({ error: "Error interno al guardar el socio en la base de datos" });
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

        res.json({ success: true, message: `Socio #${id} dado de baja correctamente` });
    } catch (error) {
        console.error("Error en DELETE /api/socios:", error);
        res.status(500).json({ error: "No se pudo procesar la baja en SQL Server" });
    }
});

module.exports = router;