// Importamos la librería directamente desde tu archivo de configuración
const { sql, config } = require('../config/db');

// Obtener todos los socios desde SQL Server
const obtenerSocios = async (req, res) => {
    try {
        // Abrimos la conexión usando el objeto config que exportás en db.js
        let pool = await sql.connect(config);
        
        // ✨ CORRECCIÓN 1: Agregamos "Telefono" al SELECT para que admin.html pueda mostrarlo
        let resultado = await pool.request().query("SELECT Id, Nombre, Telefono, Email, PlanElegido, Mensaje, FechaInscripcion FROM Socios");
        
        // Retornamos las filas
        res.json(resultado.recordset);
    } catch (error) {
        console.error("Error al obtener socios desde SQL:", error);
        res.status(500).json({ error: "Error al obtener los socios desde la base de datos" });
    }
};

// Agregar un nuevo socio en SQL Server
const agregarSocio = async (req, res) => {
    console.log("Datos recibidos en el backend:", req.body);
    
    // ✨ CORRECCIÓN 2: Agregamos "telefono" a la desestructuración del req.body
    const { nombre, telefono, email, planElegido, mensaje } = req.body;

    try {
        let pool = await sql.connect(config);
        
        // Insertamos los datos usando parámetros seguros
        // ✨ CORRECCIÓN 3: Sumamos el .input de Telefono y lo agregamos en el INSERT INTO
        await pool.request()
            .input('Nombre', sql.VarChar, nombre)
            .input('Telefono', sql.VarChar, telefono) 
            .input('Email', sql.VarChar, email)
            .input('PlanElegido', sql.VarChar, planElegido)
            .input('Mensaje', sql.VarChar, mensaje || '')
            .input('FechaInscripcion', sql.DateTime, new Date()) 
            .query(`
                INSERT INTO Socios (Nombre, Telefono, Email, PlanElegido, Mensaje, FechaInscripcion) 
                VALUES (@Nombre, @Telefono, @Email, @PlanElegido, @Mensaje, @FechaInscripcion)
            `);

        res.json({
            mensaje: "Socio registrado con éxito en SQL Server",
            socio: { nombre, telefono, email, planElegido, mensaje }
        });
    } catch (error) {
        console.error("Error al insertar el socio en SQL:", error);
        res.status(500).json({ error: "No se pudo guardar el socio en la base de datos" });
    }
};

module.exports = {
    obtenerSocios,
    agregarSocio
};