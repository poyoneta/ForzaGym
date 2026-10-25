// =====================================================================
// GENERADOR DE PLANES DE NUTRICIÓN (sin IA)
// ---------------------------------------------------------------------
// 1. Calcula las calorías del socio (fórmula de Mifflin-St Jeor) según peso,
//    altura, edad, sexo, los días que entrena y su objetivo.
// 2. Arma 4 semanas de menús eligiendo recetas del recetario sin repetir,
//    respetando restricciones (vegetariano, sin TACC, sin lactosa) y
//    evitando las recetas del plan anterior.
// 3. Ajusta la porción de cada receta para llegar a las calorías del día.
// Los valores son orientativos: no reemplazan a un/a nutricionista.
// =====================================================================

const RECETAS = require('./recetas');
const RECETAS_POR_ID = Object.fromEntries(RECETAS.map(r => [r.id, r]));

const OBJETIVOS = {
    bajar:    { nombre: 'Bajar de peso',         ajuste: 0.85, proteinaPorKg: 2.0, preferir: 'liviano' },
    mantener: { nombre: 'Mantenerme en forma',   ajuste: 1.00, proteinaPorKg: 1.6, preferir: null },
    subir:    { nombre: 'Ganar masa muscular',   ajuste: 1.12, proteinaPorKg: 1.8, preferir: 'energetico' }
};

// Reparto de calorías entre las comidas del día
const REPARTO = {
    sinColacion: { desayuno: 0.25, almuerzo: 0.32, merienda: 0.15, cena: 0.28 },
    conColacion: { desayuno: 0.22, almuerzo: 0.28, merienda: 0.13, cena: 0.25, colacion: 0.12 }
};
const TIPO_DE_COMIDA = { desayuno: 'desayuno', merienda: 'desayuno', almuerzo: 'principal', cena: 'principal', colacion: 'colacion' };

const redondear = (n, paso) => Math.round(n / paso) * paso;

// ---------------------------------------------------------------------
// Calorías y macros
// ---------------------------------------------------------------------
function calcularObjetivos(perfil, diasEntrenamiento) {
    const peso = Number(perfil.peso);
    const alturaCm = Number(perfil.altura) < 3 ? Number(perfil.altura) * 100 : Number(perfil.altura); // acepta 1.75 o 175
    const edad = Number(perfil.edad) || 30;
    const base = 10 * peso + 6.25 * alturaCm - 5 * edad;
    const tmb = perfil.sexo === 'Femenino' ? base - 161 : perfil.sexo === 'Masculino' ? base + 5 : base - 78;

    const dias = Number(diasEntrenamiento) || 3;
    const actividad = dias <= 2 ? 1.375 : dias <= 4 ? 1.55 : 1.725;
    const mantenimiento = tmb * actividad;

    const obj = OBJETIVOS[perfil.objetivo] || OBJETIVOS.mantener;
    let kcal = mantenimiento * obj.ajuste;
    if (perfil.objetivo === 'bajar') kcal = Math.max(kcal, mantenimiento - 600);   // déficit moderado
    const minimo = perfil.sexo === 'Femenino' ? 1300 : 1500;                         // nunca por debajo de esto
    kcal = Math.max(redondear(kcal, 50), minimo);

    const proteinas = Math.round(peso * obj.proteinaPorKg);
    const grasas = Math.round((kcal * 0.27) / 9);
    const carbohidratos = Math.max(0, Math.round((kcal - proteinas * 4 - grasas * 9) / 4));

    return { kcal, mantenimiento: redondear(mantenimiento, 50), proteinas, grasas, carbohidratos };
}

// ---------------------------------------------------------------------
// Azar reproducible (mismo socio + misma fecha = mismo plan)
// ---------------------------------------------------------------------
function crearAzar(semilla) {
    let h = 2166136261;
    for (const ch of String(semilla)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
    return () => {
        h += 0x6D2B79F5;
        let t = h;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function mezclar(lista, azar) {
    const a = [...lista];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(azar() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

// ---------------------------------------------------------------------
// Recetas disponibles para el socio
// ---------------------------------------------------------------------
function recetasPermitidas(tipo, restricciones) {
    return RECETAS.filter(r => r.tipo === tipo && restricciones.every(t => r.tags.includes(t)));
}

// Elige recetas para un tipo de comida: prioriza las del objetivo y las que no estaban en el plan anterior,
// y va rotando la lista para no repetir hasta que se usen todas.
function crearSelector(tipo, restricciones, preferir, anteriores, azar) {
    // Las restricciones NUNCA se aflojan (un celíaco no puede recibir gluten):
    // si quedan pocas recetas, se repiten más seguido.
    const base = recetasPermitidas(tipo, restricciones);
    const nuevas = base.filter(r => !anteriores.has(r.id));
    const pool = nuevas.length >= Math.min(6, base.length) && nuevas.length > 0 ? nuevas : base;

    // Orden: primero (mezcladas) las que coinciden con el objetivo, después el resto.
    // Las del objetivo aparecen dos veces por ronda para que salgan más seguido.
    const ronda = () => {
        const fav = preferir ? pool.filter(r => r.tags.includes(preferir)) : [];
        return mezclar([...fav, ...pool], azar);
    };
    let cola = ronda();
    let usadasHoy = new Set();

    return {
        nuevoDia() { usadasHoy = new Set(); },
        siguiente() {
            if (pool.length === 0) return null;   // no hay recetas para esta comida con estas restricciones
            for (let intento = 0; intento < cola.length * 2 + 2; intento++) {
                if (cola.length === 0) cola = ronda();
                const r = cola.shift();
                if (!usadasHoy.has(r.id) || pool.length <= 1) { usadasHoy.add(r.id); return r; }
                cola.push(r);
            }
            return pool[0];
        }
    };
}

// ---------------------------------------------------------------------
// Armar el plan
// ---------------------------------------------------------------------
function generarPlan(perfil, { diasEntrenamiento = 3, recetasAnteriores = [], semilla = Date.now() } = {}) {
    const restricciones = ['veg', 'sintacc', 'sinlactosa'].filter(t => (perfil.restricciones || []).includes(t));
    const objetivos = calcularObjetivos(perfil, diasEntrenamiento);
    const obj = OBJETIVOS[perfil.objetivo] || OBJETIVOS.mantener;
    const conColacion = Boolean(perfil.colacion);
    const reparto = conColacion ? REPARTO.conColacion : REPARTO.sinColacion;
    const comidas = Object.keys(reparto);
    const azar = crearAzar(semilla);
    const anteriores = new Set(recetasAnteriores);

    const selectores = {
        desayuno: crearSelector('desayuno', restricciones, obj.preferir, anteriores, azar),
        principal: crearSelector('principal', restricciones, obj.preferir, anteriores, azar),
        colacion: crearSelector('colacion', restricciones, obj.preferir, anteriores, azar)
    };

    const semanas = [];
    for (let s = 0; s < 4; s++) {
        const dias = [];
        for (let d = 0; d < 7; d++) {
            Object.values(selectores).forEach(sel => sel.nuevoDia());
            const dia = comidas.map(comida => {
                const receta = selectores[TIPO_DE_COMIDA[comida]].siguiente();
                if (!receta) return null;
                const objetivoComida = objetivos.kcal * reparto[comida];
                // Porción: múltiplo de 0.25 entre 0.5 y 2
                const porcion = Math.min(2, Math.max(0.5, redondear(objetivoComida / receta.kcal, 0.25)));
                return { comida, id: receta.id, porcion };
            }).filter(Boolean);
            dias.push(dia);
        }
        semanas.push(dias);
    }

    return {
        objetivo: perfil.objetivo,
        objetivoNombre: obj.nombre,
        ...objetivos,
        comidas,
        restricciones,
        semanas
    };
}

// Lista de ids de recetas usadas en un plan (para no repetirlas en el siguiente)
function recetasDelPlan(plan) {
    const ids = new Set();
    (plan && plan.semanas || []).forEach(sem => sem.forEach(dia => dia.forEach(c => ids.add(c.id))));
    return [...ids];
}

module.exports = { generarPlan, calcularObjetivos, recetasDelPlan, RECETAS_POR_ID, OBJETIVOS };
