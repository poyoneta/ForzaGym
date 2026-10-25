const db = require("./db");

// ==========================================================
// Valores iniciales del sitio (los mismos que estaban fijos en el index).
// Solo se usan la primera vez: después se editan desde "Editar sitio" en el backoffice.
// ==========================================================
const CONFIG_INICIAL = {
    planes: [
        {
            nombre: "Básico",
            diasRutina: 2,
            precio: 18000,
            resumen: "2 días/sem",
            beneficios: ["2 días por semana", "Rutina personalizada en la app", "Registro de cargas y progreso"],
            destacado: false,
            nutricion: false
        },
        {
            nombre: "Plus",
            diasRutina: 3,
            precio: 23000,
            resumen: "3 días/sem",
            beneficios: ["3 días por semana", "Rutina personalizada en la app", "Registro de cargas y progreso"],
            destacado: false,
            nutricion: false
        },
        {
            nombre: "Premium",
            diasRutina: 5,
            precio: 30000,
            resumen: "Pase libre + Nutrición",
            beneficios: ["Pase libre todos los días", "Asesoramiento nutricional", "Rutina personalizada en la app", "Registro de cargas y progreso"],
            destacado: true,
            nutricion: true
        }
    ],
    horarios: [
        {
            dias: "Lunes a Viernes",
            turnos: [
                { nombre: "Por la mañana", horario: "8:00 a 12:00" },
                { nombre: "Por la tarde", horario: "16:00 a 22:30" }
            ]
        },
        {
            dias: "Sábado",
            turnos: [
                { nombre: "Por la mañana", horario: "10:30 a 12:30" }
            ]
        }
    ],
    productos: [
        { nombre: "Remera deportiva", descripcion: "Tela deportiva con vivos en verde y \"Break Your Limits\" en la espalda.", precio: null, imagen: "imagenes/tienda-remera.jpg", fondoClaro: false, visible: true },
        { nombre: "Remera Team Forza", descripcion: "Logo grande en la espalda con \"One More Rep\" y \"Team Forza\".", precio: null, imagen: "imagenes/tienda-remera-team.jpg", fondoClaro: false, visible: true },
        { nombre: "Musculosa", descripcion: "Ideal para entrenar: franja vertical en verde y logo en el pecho.", precio: null, imagen: "imagenes/tienda-musculosa.jpg", fondoClaro: false, visible: true },
        { nombre: "Buzo con capucha", descripcion: "\"Forza\" al frente y \"Break Your Limits · Team Forza\" en la espalda.", precio: null, imagen: "imagenes/tienda-buzo.jpg", fondoClaro: false, visible: true },
        { nombre: "Conjunto chomba + short", descripcion: "Chomba con vivos verdes y short a juego, con escudo y número.", precio: null, imagen: "imagenes/tienda-chomba.jpg", fondoClaro: true, visible: true }
    ]
};

// Crea las tablas nuevas si todavía no existen (se ejecuta al iniciar el servidor).
// Así no hace falta entrar a Supabase a correr SQL a mano.
async function inicializarBaseDeDatos() {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS pagos (
                id SERIAL PRIMARY KEY,
                socio_id INTEGER NOT NULL REFERENCES socios(id) ON DELETE CASCADE,
                monto NUMERIC(10, 2) NOT NULL DEFAULT 0,
                plan VARCHAR(50),
                periodo_desde DATE NOT NULL,
                periodo_hasta DATE NOT NULL,
                fecha_pago TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        `);
        await db.query(`CREATE INDEX IF NOT EXISTS idx_pagos_socio ON pagos (socio_id)`);
        console.log("✅ Tabla 'pagos' lista");
    } catch (error) {
        console.error("❌ No se pudo crear la tabla 'pagos':", error.message);
    }

    try {
        // Configuración editable del sitio: planes, horarios e indumentaria
        await db.query(`
            CREATE TABLE IF NOT EXISTS configuracion (
                clave VARCHAR(50) PRIMARY KEY,
                valor JSONB NOT NULL,
                actualizado TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        `);

        // Fotos subidas desde el backoffice (se guardan en la base porque el disco de Render se borra)
        await db.query(`
            CREATE TABLE IF NOT EXISTS imagenes (
                id SERIAL PRIMARY KEY,
                tipo VARCHAR(50) NOT NULL,
                datos BYTEA NOT NULL,
                creado TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        `);

        // Carga los valores iniciales solo si esa clave todavía no existe (no pisa lo que ya editaste)
        for (const [clave, valor] of Object.entries(CONFIG_INICIAL)) {
            await db.query(
                `INSERT INTO configuracion (clave, valor) VALUES ($1, $2) ON CONFLICT (clave) DO NOTHING`,
                [clave, JSON.stringify(valor)]
            );
        }
        console.log("✅ Configuración del sitio lista");
    } catch (error) {
        console.error("❌ No se pudo preparar la configuración del sitio:", error.message);
    }

    try {
        // Asistencias: una por socio por día (la fecha es la de Argentina)
        await db.query(`
            CREATE TABLE IF NOT EXISTS asistencias (
                id SERIAL PRIMARY KEY,
                socio_id INTEGER NOT NULL REFERENCES socios(id) ON DELETE CASCADE,
                fecha DATE NOT NULL,
                hora TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                UNIQUE (socio_id, fecha)
            )
        `);
        await db.query(`CREATE INDEX IF NOT EXISTS idx_asistencias_fecha ON asistencias (fecha)`);

        // Código secreto que lleva el QR de la entrada (se puede regenerar desde el backoffice)
        const codigo = require("crypto").randomBytes(6).toString("hex");
        await db.query(
            `INSERT INTO configuracion (clave, valor) VALUES ('codigo_asistencia', $1) ON CONFLICT (clave) DO NOTHING`,
            [JSON.stringify(codigo)]
        );
        console.log("✅ Tabla 'asistencias' lista");
    } catch (error) {
        console.error("❌ No se pudo crear la tabla 'asistencias':", error.message);
    }

    try {
        // Planes de nutrición: uno por mes por socio (se guarda el historial)
        await db.query(`
            CREATE TABLE IF NOT EXISTS planes_nutricion (
                id SERIAL PRIMARY KEY,
                socio_id INTEGER NOT NULL REFERENCES socios(id) ON DELETE CASCADE,
                perfil JSONB NOT NULL,
                plan JSONB NOT NULL,
                desde DATE NOT NULL,
                hasta DATE NOT NULL,
                creado TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        `);
        await db.query(`CREATE INDEX IF NOT EXISTS idx_planes_nutricion_socio ON planes_nutricion (socio_id)`);
        console.log("✅ Tabla 'planes_nutricion' lista");
    } catch (error) {
        console.error("❌ No se pudo crear la tabla 'planes_nutricion':", error.message);
    }
}

module.exports = inicializarBaseDeDatos;