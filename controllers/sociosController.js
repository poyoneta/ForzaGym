// Importamos el pool de conexión que creamos en tu nuevo config/db.js
const db = require('../config/db');

// Obtener todos los socios desde Supabase (PostgreSQL)
const obtenerSocios = async (req, res) => {
    try {
        // En Postgres las consultas se hacen directo con db.query
        // Cambiamos los nombres de las columnas a minúsculas/guion bajo
        const queryTexto = `
            SELECT id, nombre, telefono, email, plan_elegido, mensaje, fecha_inscripcion 
            FROM socios
        `;
        const resultado = await db.query(queryTexto);
        
        // ✨ NOTA: Postgres guarda las filas en '.rows' (en lugar de '.recordset')
        res.json(resultado.rows);
    } catch (error) {
        console.error("Error al obtener socios desde Supabase:", error);
        res.status(500).json({ error: "Error al obtener los socios desde la base de datos" });
    }
};

// Agregar un nuevo socio en Supabase (PostgreSQL)
const agregarSocio = async (req, res) => {
    console.log("Datos recibidos en el backend:", req.body);
    
    const { nombre, telefono, email, planElegido, mensaje } = req.body;

    try {
        // En Postgres usamos parámetros seguros con $1, $2, $3... en lugar de .input() y @Nombre
        const queryTexto = `
            INSERT INTO socios (nombre, telefono, email, plan_elegido, mensaje) 
            VALUES ($1, $2, $3, $4, $5)
        `;
        
        // Pasamos las variables en un array ordenado que coincide con los $1, $2...
        const valores = [
            nombre, 
            telefono, 
            email, 
            planElegido, 
            mensaje || ''
        ];

        await db.query(queryTexto, valores);

        res.json({
            mensaje: "Socio registrado con éxito en Supabase",
            socio: { nombre, telefono, email, planElegido, mensaje }
        });
    } catch (error) {
        console.error("Error al insertar el socio en Supabase:", error);
        res.status(500).json({ error: "No se pudo guardar el socio en la base de datos" });
    }
};

module.exports = {
    obtenerSocios,
    agregarSocio
};