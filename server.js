const express = require("express");
const cors = require("cors");

require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());
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

// Crea la tabla de pagos si no existe y después arranca el servidor
const inicializarBaseDeDatos = require("./config/initDb");

inicializarBaseDeDatos().finally(() => {
    app.listen(process.env.PORT, () => {
        console.log(
            `Servidor iniciado en puerto ${process.env.PORT}`
        );
    });
});