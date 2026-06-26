let socios = [];

const obtenerSocios = (req, res) => {

    res.json(socios);

};

const agregarSocio = (req, res) => {

     console.log("Datos recibidos:");
    console.log(req.body);
    
    const nuevoSocio = req.body;

    socios.push(nuevoSocio);

    res.json({
        mensaje: "Socio registrado",
        socio: nuevoSocio
    });

};

module.exports = {
    obtenerSocios,
    agregarSocio
};