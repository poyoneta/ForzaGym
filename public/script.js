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

// ==========================================================
// Visor: al tocar una foto de la tienda se ve en grande
// ==========================================================
const visor = document.getElementById("visorFoto");
const imgVisor = visor ? visor.querySelector("img") : null;

function abrirVisor(img) {
    if (!visor) return;
    imgVisor.src = img.src;
    imgVisor.alt = img.alt;
    visor.classList.add("abierto");
    visor.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden"; // Evita que la página se mueva atrás
}

function cerrarVisor() {
    if (!visor) return;
    visor.classList.remove("abierto");
    visor.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
}

if (visor) {
    visor.addEventListener("click", cerrarVisor);
    document.addEventListener("keydown", e => { if (e.key === "Escape") cerrarVisor(); });
}

// ==========================================================
// Tienda: botón "Consultar" por WhatsApp (con el nombre de la prenda) y foto ampliable
// ==========================================================
function activarTienda() {
    document.querySelectorAll("[data-producto]").forEach(boton => {
        const mensaje = `¡Hola! Quiero consultar por la indumentaria oficial de Forza Gym: ${boton.dataset.producto}. ¿Qué talles y precio tienen?`;
        boton.href = `https://wa.me/${CONFIG_GYM.whatsapp}?text=${encodeURIComponent(mensaje)}`;
        boton.target = "_blank";
        boton.rel = "noopener";
    });
    document.querySelectorAll("[data-ampliar]").forEach(boton => {
        boton.addEventListener("click", () => abrirVisor(boton.querySelector("img")));
    });
}

activarTienda();

// ==========================================================
// Contenido editable desde el backoffice ("Editar sitio"):
// planes, horarios e indumentaria se leen de la base de datos.
// Si la base no responde, queda el contenido escrito en el HTML.
// ==========================================================
const escapar = t => String(t ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const pesos = n => "$" + Math.round(Number(n) || 0).toLocaleString("es-AR");

function renderPlanes(planes) {
    const cont = document.querySelector("#planes .contenedor-planes");
    if (!cont || !Array.isArray(planes) || planes.length === 0) return;

    cont.innerHTML = planes.map(p => `
        <article class="tarjeta-plan ${p.destacado ? "destacado" : ""}">
            ${p.destacado ? '<span class="etiqueta-destacado">Recomendado</span>' : ""}
            <h3>Plan ${escapar(p.nombre)}</h3>
            <p class="precio">${pesos(p.precio)} <span>/ mes</span></p>
            <ul class="lista-beneficios">
                ${(p.beneficios || []).map(b => `<li><i class="fa-solid fa-check"></i> ${escapar(b)}</li>`).join("")}
            </ul>
            <a href="registro.html?plan=${encodeURIComponent(p.nombre)}" class="btn ${p.destacado ? "btn-principal" : "btn-secundario"}">Elegir plan</a>
        </article>`).join("");
}

function renderHorarios(horarios) {
    const cont = document.querySelector("#horarios .contenedor-horarios");
    if (!cont || !Array.isArray(horarios) || horarios.length === 0) return;

    cont.innerHTML = horarios.map(h => `
        <article class="tarjeta-horario">
            <div class="etiqueta-dia">${escapar(h.dias)}</div>
            ${(h.turnos || []).map((t, i) => `
                ${i > 0 ? '<div class="divisor-horario"></div>' : ""}
                <div class="bloque-turno">
                    <h3>${escapar(t.nombre)}</h3>
                    <p class="hora">${escapar(t.horario)}</p>
                </div>`).join("")}
        </article>`).join("");
}

function renderProductos(productos) {
    const seccion = document.getElementById("tienda");
    const cont = document.querySelector("#tienda .contenedor-tienda");
    if (!cont || !Array.isArray(productos)) return;

    const visibles = productos.filter(p => p.visible !== false);
    // Si no hay prendas para mostrar, se oculta la sección y su link del menú
    seccion.style.display = visibles.length ? "" : "none";
    document.querySelectorAll('a[href="#tienda"]').forEach(a => { a.style.display = visibles.length ? "" : "none"; });
    if (!visibles.length) return;

    cont.innerHTML = visibles.map(p => `
        <article class="tarjeta-producto">
            <button class="imagen-producto ${p.fondoClaro ? "fondo-claro" : ""}" data-ampliar aria-label="Ampliar foto de ${escapar(p.nombre)}">
                ${p.imagen ? `<img src="${escapar(p.imagen)}" alt="${escapar(p.nombre)}" loading="lazy">` : ""}
            </button>
            <div class="info-producto">
                <h3>${escapar(p.nombre)}</h3>
                <p>${escapar(p.descripcion)}</p>
                <p class="precio-producto">${p.precio !== null && p.precio !== undefined && p.precio !== "" ? pesos(p.precio) : ""}</p>
                <a href="#" class="btn btn-secundario" data-producto="${escapar(p.nombre)}"><i class="fa-brands fa-whatsapp"></i> Consultar</a>
            </div>
        </article>`).join("");

    activarTienda();
}

fetch("/api/config")
    .then(res => (res.ok ? res.json() : Promise.reject(res.status)))
    .then(config => {
        renderPlanes(config.planes);
        renderHorarios(config.horarios);
        renderProductos(config.productos);
    })
    .catch(err => console.warn("No se pudo leer la configuración del sitio, se muestra el contenido por defecto.", err));