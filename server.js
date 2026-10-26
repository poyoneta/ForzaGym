const express = require("express");
const cors = require("cors");

require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "5mb" })); // 5mb para poder subir fotos de indumentaria
app.use(express.static("public"));

// Ruta existente de socios
app.use(
    "/api/socios",
    require("./routes/sociosRoutes")
);

// NUEVA: Ruta para controlar los planes de ejercicios
app.use(
    "/api/rutinas",
    require("./routes/rutinasRoutes")
);

// Historial de pagos (gráfico mensual del backoffice)
app.use(
    "/api/pagos",
    require("./routes/pagosRoutes")
);

// Configuración editable del sitio (planes, horarios, indumentaria)
app.use(
    "/api/config",
    require("./routes/configRoutes")
);

// Asistencias con el QR de la entrada
app.use(
    "/api/asistencias",
    require("./routes/asistenciasRoutes")
);

// Planes de nutrición con recetas (se arman solos según el objetivo del socio)
app.use(
    "/api/nutricion",
    require("./routes/nutricionRoutes")
);

// Peso corporal del socio con fotos de progreso (privadas)
app.use(
    "/api/peso-corporal",
    require("./routes/pesoCorporalRoutes")
);

// Rutinas completadas desde la app (para la racha y los logros)
app.use(
    "/api/entrenamientos",
    require("./routes/entrenamientosRoutes")
);

// Fotos subidas desde el backoffice
app.use(
    "/api/imagenes",
    require("./routes/imagenesRoutes")
);

// Crea las tablas nuevas si no existen y después arranca el servidor
const inicializarBaseDeDatos = require("./config/initDb");

inicializarBaseDeDatos().finally(() => {
    app.listen(process.env.PORT, () => {
        console.log(
            `Servidor iniciado en puerto ${process.env.PORT}`
        );
    });
});