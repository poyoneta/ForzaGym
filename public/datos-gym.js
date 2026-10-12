// ==========================================================
// ⚙️ DATOS DEL GIMNASIO: cambiá solo estas líneas
// Los usan la página principal, el panel del socio y la página de asistencia.
// ==========================================================
const CONFIG_GYM = {
    // Número con código de país, sin "+", espacios ni guiones. Ej: "5493571234567"
    whatsapp: "5493572670648",
    // Dirección que se muestra escrita en la página
    direccion: "Pasaje Bolivia 1285, Villa del Rosario, Córdoba (CP 5963)",
    // Lo que se busca en Google Maps (con el nombre del gimnasio para que marque el local)
    busquedaMapa: "Forza Gym, Pasaje Bolivia 1285, Villa del Rosario, Córdoba, Argentina"
};

// Arma un link de WhatsApp al gimnasio con un mensaje ya escrito
function linkWhatsappGym(mensaje) {
    return `https://wa.me/${CONFIG_GYM.whatsapp}?text=${encodeURIComponent(mensaje)}`;
}
