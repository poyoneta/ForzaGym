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