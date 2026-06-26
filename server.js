const express = require("express");
const cors = require("cors");

require("dotenv").config();

const app = express();

app.use(cors());

app.use(express.json());

app.use(express.static("public"));

app.use(
    "/api/socios",
    require("./routes/sociosRoutes")
);

app.listen(process.env.PORT, () => {

    console.log(
        `Servidor iniciado en puerto ${process.env.PORT}`
    );

});