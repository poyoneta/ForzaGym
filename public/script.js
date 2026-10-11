// ==========================================================
// ⚙️ DATOS DEL GIMNASIO: cambiá solo estas dos líneas
// ==========================================================
const CONFIG_GYM = {
    // Número con código de país, sin "+", espacios ni guiones. Ej: "5493571234567"
    whatsapp: "549XXXXXXXXXX",
    // Dirección tal cual la buscarías en Google Maps
    direccion: "Calle 123, Ciudad, Córdoba"
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
    mapa.src = `https://www.google.com/maps?q=${encodeURIComponent(CONFIG_GYM.direccion)}&output=embed`;
}

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
