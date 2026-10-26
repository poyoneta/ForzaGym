// El WhatsApp y la dirección del gimnasio están en datos-gym.js (se carga antes que este archivo)

const MENSAJE_WHATSAPP = "¡Hola! Quiero consultar por los planes de Forza Gym.";

// ==========================================================
// Links de WhatsApp (botón flotante, pie, ubicación, consulta)
// ==========================================================
const linkWhatsapp = `https://wa.me/${CONFIG_GYM.whatsapp}?text=${encodeURIComponent(MENSAJE_WHATSAPP)}`;

document.querySelectorAll("[data-whatsapp]").forEach(link => {
    link.href = linkWhatsapp;
    link.target = "_blank";
    link.rel = "noopener";
});

// ==========================================================
// Dirección (al tocarla abre Google Maps) y mapa
// ==========================================================
document.querySelectorAll("[data-direccion]").forEach(el => {
    const link = document.createElement("a");
    link.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONFIG_GYM.busquedaMapa)}`;
    link.target = "_blank";
    link.rel = "noopener";
    link.textContent = CONFIG_GYM.direccion;
    el.replaceChildren(link);
});

const mapa = document.getElementById("mapaGym");
if (mapa) mapa.src = `https://www.google.com/maps?q=${encodeURIComponent(CONFIG_GYM.busquedaMapa)}&output=embed`;

// ==========================================================
// Menú del celular
// ==========================================================
const btnMenu = document.getElementById("btnMenu");
const menu = document.getElementById("menuPrincipal");

if (btnMenu && menu) {
    const cerrarMenu = () => {
        menu.classList.remove("abierto");
        btnMenu.setAttribute("aria-expanded", "false");
        btnMenu.setAttribute("aria-label", "Abrir menú");
    };
    btnMenu.addEventListener("click", () => {
        const abierto = menu.classList.toggle("abierto");
        btnMenu.setAttribute("aria-expanded", String(abierto));
        btnMenu.setAttribute("aria-label", abierto ? "Cerrar menú" : "Abrir menú");
    });
    menu.querySelectorAll("a").forEach(a => a.addEventListener("click", cerrarMenu));
    document.addEventListener("keydown", e => { if (e.key === "Escape") cerrarMenu(); });
}

// ==========================================================
// Visor: al tocar una foto de la tienda se ve en grande
// ==========================================================
const visor = document.getElementById("visorFoto");
const imgVisor = visor ? visor.querySelector("img") : null;

function abrirVisor(img) {
    if (!visor || !img) return;
    imgVisor.src = img.src;
    imgVisor.alt = img.alt;
    visor.classList.add("abierto");
    visor.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
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

// Tienda: "Consultar" por WhatsApp con el nombre de la prenda, y foto ampliable
function activarTienda() {
    document.querySelectorAll("[data-producto]").forEach(boton => {
        const mensaje = `¡Hola! Quiero consultar por la indumentaria oficial de Forza Gym: ${boton.dataset.producto}. ¿Qué talles y precio tienen?`;
        boton.href = `https://wa.me/${CONFIG_GYM.whatsapp}?text=${encodeURIComponent(mensaje)}`;
        boton.target = "_blank";
        boton.rel = "noopener";
    });
    document.querySelectorAll("[data-ampliar]").forEach(boton => {
        boton.onclick = () => abrirVisor(boton.querySelector("img"));
    });
}
activarTienda();

// ==========================================================
// HORARIOS: grilla semanal y cartel de "abierto ahora"
// Los textos vienen de "Editar sitio" (ej: "Lunes a Viernes" / "8:00 a 12:00").
// Si algún texto no se entiende, se muestra solo la lista.
// ==========================================================
const DIAS = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"];
const DIAS_LINDOS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const DIAS_CORTOS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const sinTildes = t => String(t || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const indiceDia = palabra => DIAS.findIndex(d => palabra.startsWith(d.slice(0, 3)));

// "Lunes a Viernes" → [0,1,2,3,4] · "Lunes, Miércoles y Viernes" → [0,2,4] · "Sábados" → [5]
function leerDias(texto) {
    const t = sinTildes(texto).replace(/feriados?/g, "");
    const dias = new Set();
    const rango = t.match(/([a-z]+)\s*(?:a|-|al|hasta)\s*([a-z]+)/);
    if (rango && indiceDia(rango[1]) >= 0 && indiceDia(rango[2]) >= 0) {
        for (let i = indiceDia(rango[1]); i <= indiceDia(rango[2]); i++) dias.add(i);
    }
    (t.match(/[a-z]+/g) || []).forEach(p => { if (p.length >= 3 && indiceDia(p) >= 0) dias.add(indiceDia(p)); });
    return [...dias].sort();
}

// "8:00 a 12:00" / "16 a 22.30 hs" → { desde: 8, hasta: 12 } (en horas)
function leerHorario(texto) {
    const horas = [...sinTildes(texto).matchAll(/(\d{1,2})(?:[:.](\d{2}))?/g)].map(m => Number(m[1]) + (Number(m[2]) || 0) / 60);
    if (horas.length < 2 || horas[0] > 24 || horas[1] > 24) return null;
    return { desde: horas[0], hasta: horas[1] <= horas[0] ? horas[1] + 24 : horas[1] };
}

const textoHora = h => `${Math.floor(h % 24)}:${String(Math.round((h % 1) * 60)).padStart(2, "0")}`;

// Día (0 = lunes) y hora actual en Argentina
function ahoraArgentina() {
    const partes = new Intl.DateTimeFormat("en-US", {
        timeZone: "America/Argentina/Buenos_Aires", weekday: "short", hour: "numeric", minute: "numeric", hourCycle: "h23"
    }).formatToParts(new Date());
    const valor = tipo => partes.find(p => p.type === tipo).value;
    const dia = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(valor("weekday"));
    return { dia, hora: Number(valor("hour")) + Number(valor("minute")) / 60 };
}

function renderHorarios(horarios) {
    if (!Array.isArray(horarios) || horarios.length === 0) return;
    const escapar = t => String(t ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

    // Lista de texto (siempre visible)
    document.getElementById("listaHorarios").innerHTML = horarios.map(h => `
        <div>
            <dt>${escapar(h.dias)}</dt>
            ${(h.turnos || []).map(t => `<dd>${t.nombre ? escapar(t.nombre) + ": " : ""}${escapar(t.horario)}</dd>`).join("")}
        </div>`).join("");

    // Semana: para cada día, sus turnos
    const semana = DIAS.map(() => []);
    let seEntiende = true;
    horarios.forEach(h => {
        const dias = leerDias(h.dias);
        if (!dias.length) seEntiende = false;
        (h.turnos || []).forEach(t => {
            const rango = leerHorario(t.horario);
            if (!rango) { seEntiende = false; return; }
            dias.forEach(d => semana[d].push({ ...rango, nombre: t.nombre }));
        });
    });
    if (!seEntiende) return;
    semana.forEach(turnos => turnos.sort((a, b) => a.desde - b.desde));

    // Estado de ahora
    const { dia, hora } = ahoraArgentina();
    const abiertoAhora = semana[dia].find(t => hora >= t.desde && hora < t.hasta)
        || semana[(dia + 6) % 7].find(t => t.hasta > 24 && hora + 24 < t.hasta);   // turno que pasa la medianoche
    const estado = document.querySelector(".estado");
    const textoEstado = document.getElementById("estadoTexto");
    if (abiertoAhora) {
        estado.classList.add("abierto");
        textoEstado.textContent = `Abierto ahora, hasta las ${textoHora(abiertoAhora.hasta)}`;
    } else {
        estado.classList.remove("abierto");
        // Próxima apertura: hoy más tarde, o el próximo día con turnos
        let proximo = null;
        for (let k = 0; k < 7 && !proximo; k++) {
            const d = (dia + k) % 7;
            const turno = semana[d].find(t => k > 0 || t.desde > hora);
            if (turno) proximo = { k, d, turno };
        }
        textoEstado.textContent = !proximo ? "Cerrado"
            : proximo.k === 0 ? `Cerrado ahora. Abre hoy a las ${textoHora(proximo.turno.desde)}`
            : proximo.k === 1 ? `Cerrado. Abre mañana a las ${textoHora(proximo.turno.desde)}`
            : `Cerrado. Abre el ${DIAS_LINDOS[proximo.d].toLowerCase()} a las ${textoHora(proximo.turno.desde)}`;
    }

    // Grilla: de la hora más temprana a la más tarde (redondeado)
    const todos = semana.flat();
    const inicio = Math.floor(Math.min(...todos.map(t => t.desde)));
    const fin = Math.ceil(Math.max(...todos.map(t => t.hasta)));
    const pos = h => ((h - inicio) / (fin - inicio)) * 100;

    const filas = semana.map((turnos, d) => {
        const esHoy = d === dia;
        const barras = turnos.map(t => `
            <span class="semana-turno ${pos(t.hasta) - pos(t.desde) < 22 ? "angosto" : ""}" data-corto="${textoHora(t.desde)}" style="left:${pos(t.desde)}%; width:${pos(t.hasta) - pos(t.desde)}%"
                  title="${escapar(t.nombre || "")} ${textoHora(t.desde)} a ${textoHora(t.hasta)}">${textoHora(t.desde)} a ${textoHora(t.hasta)}</span>`).join("");
        const marcaAhora = esHoy && hora >= inicio && hora <= fin ? `<span class="semana-ahora" style="left:${pos(hora)}%" title="Ahora"></span>` : "";
        return `
            <div class="semana-fila ${esHoy ? "hoy" : ""}">
                <span class="semana-dia"><span class="largo">${DIAS_LINDOS[d]}</span><span class="corto">${DIAS_CORTOS[d]}</span></span>
                <div class="semana-pista">${barras || '<span class="semana-cerrado">Cerrado</span>'}${marcaAhora}</div>
            </div>`;
    }).join("");

    // Reglita de horas abajo (cada 2 o 4 horas según el ancho)
    const paso = fin - inicio > 10 ? 4 : 2;
    let reglas = "";
    for (let h = Math.ceil(inicio / paso) * paso; h <= fin; h += paso) reglas += `<span style="left:${pos(h)}%">${h % 24}h</span>`;

    const grilla = document.getElementById("grillaSemana");
    grilla.innerHTML = filas + `<div class="semana-reglas" aria-hidden="true"><span></span><div>${reglas}</div></div>`;
    grilla.hidden = false;
    grilla.setAttribute("aria-hidden", "true");   // la lista de texto ya dice lo mismo para lectores de pantalla
    document.getElementById("horariosBajada").textContent = "Cuándo podés venir, día por día. La franja verde es hoy.";
}

// ==========================================================
// Planes e indumentaria (editables desde "Editar sitio" en el backoffice)
// Si la base no responde, queda el contenido escrito en el HTML.
// ==========================================================
const escapar = t => String(t ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const precio = n => Math.round(Number(n) || 0).toLocaleString("es-AR");

function renderPlanes(planes) {
    const cont = document.getElementById("listaPlanes");
    if (!cont || !Array.isArray(planes) || planes.length === 0) return;
    cont.style.gridTemplateColumns = window.matchMedia("(min-width: 1001px)").matches ? `repeat(${Math.min(planes.length, 4)}, 1fr)` : "";
    cont.innerHTML = planes.map(p => `
        <article class="plan ${p.destacado ? "plan-destacado" : ""}">
            ${p.destacado ? '<p class="plan-marca">Recomendado</p>' : ""}
            <h3>${escapar(p.nombre)}</h3>
            <p class="plan-dias">${escapar(p.resumen || "")}</p>
            <p class="plan-precio"><span class="signo">$</span>${precio(p.precio)}<span class="mes">por mes</span></p>
            <ul>${(p.beneficios || []).map(b => `<li>${escapar(b)}</li>`).join("")}</ul>
            <a href="registro.html?plan=${encodeURIComponent(p.nombre)}" class="btn ${p.destacado ? "btn-verde" : "btn-linea"}">Elegir ${escapar(p.nombre)}</a>
        </article>`).join("");
}

function renderProductos(productos) {
    const seccion = document.getElementById("tienda");
    const cont = document.getElementById("listaProductos");
    if (!cont || !Array.isArray(productos)) return;

    const visibles = productos.filter(p => p.visible !== false);
    // Sin prendas para mostrar: se oculta la sección y su link del menú
    seccion.style.display = visibles.length ? "" : "none";
    document.querySelectorAll('a[href="#tienda"]').forEach(a => { a.style.display = visibles.length ? "" : "none"; });
    if (!visibles.length) return;

    cont.innerHTML = visibles.map(p => `
        <article class="producto">
            <button class="producto-foto ${p.fondoClaro ? "claro" : ""}" data-ampliar aria-label="Ampliar foto: ${escapar(p.nombre)}">
                ${p.imagen ? `<img src="${escapar(p.imagen)}" alt="${escapar(p.nombre)}" loading="lazy">` : ""}
            </button>
            <h3>${escapar(p.nombre)}</h3>
            <p>${escapar(p.descripcion)}</p>
            ${p.precio !== null && p.precio !== undefined && p.precio !== "" ? `<p class="precio">$${precio(p.precio)}</p>` : ""}
            <a href="#" class="consultar" data-producto="${escapar(p.nombre)}"><i class="fa-brands fa-whatsapp" aria-hidden="true"></i> Consultar</a>
        </article>`).join("");
    activarTienda();
}

// Horarios por defecto (los mismos del HTML) por si la base no responde
const HORARIOS_POR_DEFECTO = [
    { dias: "Lunes a Viernes", turnos: [{ nombre: "Por la mañana", horario: "8:00 a 12:00" }, { nombre: "Por la tarde", horario: "16:00 a 22:30" }] },
    { dias: "Sábado", turnos: [{ nombre: "Por la mañana", horario: "10:30 a 12:30" }] }
];

fetch("/api/config")
    .then(res => (res.ok ? res.json() : Promise.reject(res.status)))
    .then(config => {
        renderPlanes(config.planes);
        renderHorarios(config.horarios && config.horarios.length ? config.horarios : HORARIOS_POR_DEFECTO);
        renderProductos(config.productos);
    })
    .catch(err => {
        console.warn("No se pudo leer la configuración del sitio, se muestra el contenido por defecto.", err);
        renderHorarios(HORARIOS_POR_DEFECTO);
    });

// En el celular, el botón flotante de WhatsApp aparece recién después de la portada (para no tapar los botones)
const flotante = document.querySelector(".wpp-flotante");
const portada = document.querySelector(".portada");
if (flotante && portada && "IntersectionObserver" in window) {
    new IntersectionObserver(([e]) => flotante.classList.toggle("escondido", e.isIntersecting), { threshold: 0.25 }).observe(portada);
}