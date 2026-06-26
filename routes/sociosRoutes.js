const express = require("express");

const router = express.Router();

const {
    obtenerSocios,
    agregarSocio
} = require("../controllers/sociosController");

router.get("/", obtenerSocios);

router.post("/", agregarSocio);

module.exports = router;