// ==========================================================
// ⚙️ DATOS DEL GIMNASIO: cambiá solo estas líneas
// ==========================================================
const CONFIG_GYM = {
    // Número con código de país, sin "+", espacios ni guiones. Ej: "5493571234567"
    whatsapp: "5493572670648",
    // Dirección que se muestra escrita en la página
    direccion: "Pasaje Bolivia 1285, Villa del Rosario, Córdoba (CP 5963)",
    // Lo que se busca en Google Maps (con el nombre del gimnasio para que marque el local)
    busquedaMapa: "Forza Gym, Pasaje Bolivia 1285, Villa del Rosario, Córdoba, Argentina"
};

const MENSAJE_WHATSAPP = "¡Hola! Quiero consultar por los planes de Forza Gym.";

// ==========================================================
// Links de WhatsApp (botón flotante, footer, ubicación, consulta)
// ==========================================================
const linkWhatsapp = `https://wa.me/${CONFIG_GYM.whatsapp}?text=${encodeURIComponent(MENSAJE_WHATSAPP)}`;

document.querySelectorAll("[data-whatsapp]").forEach(link => {
    link.href = linkWhatsapp;
    link.target = "_blank";
    link.rel = "noopener";
});

// ==========================================================
// Dirección y mapa
// ==========================================================
document.querySelectorAll("[data-direccion]").forEach(el => {
    el.textContent = CONFIG_GYM.direccion;
});

const mapa = document.getElementById("mapaGym");
if (mapa) {
    mapa.src = `https://www.google.com/maps?q=${encodeURIComponent(CONFIG_GYM.busquedaMapa)}&output=embed`;
}

// Al tocar la dirección se abre Google Maps (en el celu, la app) para ir hasta el gimnasio
document.querySelectorAll("[data-direccion]").forEach(el => {
    const link = document.createElement("a");
    link.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONFIG_GYM.busquedaMapa)}`;
    link.target = "_blank";
    link.rel = "noopener";
    link.textContent = CONFIG_GYM.direccion;
    el.replaceChildren(link);
});

// ==========================================================
// Menú hamburguesa (celular)
// ==========================================================
const btnMenu = document.getElementById("btnMenu");
const menu = document.getElementById("menuPrincipal");

if (btnMenu && menu) {
    const cerrarMenu = () => {
        menu.classList.remove("abierto");
        btnMenu.setAttribute("aria-expanded", "false");
        btnMenu.innerHTML = '<i class="fa-solid fa-bars"></i>';
    };

    btnMenu.addEventListener("click", () => {
        const abierto = menu.classList.toggle("abierto");
        btnMenu.setAttribute("aria-expanded", String(abierto));
        btnMenu.innerHTML = abierto
            ? '<i class="fa-solid fa-xmark"></i>'
            : '<i class="fa-solid fa-bars"></i>';
    });

    // Al tocar un link del menú, se cierra solo
    menu.querySelectorAll("a").forEach(a => a.addEventListener("click", cerrarMenu));
}