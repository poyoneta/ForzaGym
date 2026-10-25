// ==========================================================
// PANTALLA DE INICIO ANIMADA DE LA APP (splash)
// ----------------------------------------------------------
// Se muestra solo cuando se abre la app instalada en el celular
// (no en el navegador), una vez por apertura.
// Secuencia: el logo aparece desde un punto -> el nombre sale
// deslizándose desde el logo -> se esconde de nuevo -> el logo se
// achica y entra la app. Tocando la pantalla se saltea.
//
// Para verla en el navegador (para probar): agregá ?splash=1 a la URL.
// Se carga en el <head> para que no se vea la página antes de la animación.
// ==========================================================
(function () {
    const params = new URLSearchParams(location.search);
    const forzado = params.get('splash') === '1';
    const esApp = window.matchMedia('(display-mode: standalone)').matches ||
                  window.matchMedia('(display-mode: fullscreen)').matches ||
                  window.navigator.standalone === true;

    let yaVisto = false;
    try { yaVisto = sessionStorage.getItem('forzaSplashVisto') === '1'; } catch (e) { /* sin storage */ }

    // Promesa que avisa cuando terminó (la usa login.html para entrar directo al panel)
    let avisarFin;
    window.forzaSplash = new Promise(resolve => { avisarFin = resolve; });

    if (!forzado && (!esApp || yaVisto)) { avisarFin(false); return; }
    try { sessionStorage.setItem('forzaSplashVisto', '1'); } catch (e) { /* sin storage */ }

    const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.documentElement.classList.add('con-splash');

    // ---------- Estilos ----------
    const estilos = document.createElement('style');
    estilos.textContent = `
        html.con-splash, html.con-splash body { background: #000 !important; overflow: hidden !important; }
        html.con-splash body { visibility: hidden; }
        #forzaSplash {
            visibility: visible; position: fixed; inset: 0; z-index: 99999;
            background: #000; display: flex; align-items: center; justify-content: center;
            transition: opacity .35s ease;
        }
        #forzaSplash.saliendo { opacity: 0; }
        #forzaSplash .grupo { display: flex; align-items: center; }
        #forzaSplash .logo {
            width: 88px; height: 88px; flex: 0 0 auto;
            transform: scale(0); will-change: transform;
            filter: drop-shadow(0 0 14px rgba(57, 228, 165, .35));
        }
        #forzaSplash .marco-texto { width: 0; overflow: hidden; will-change: width; }
        #forzaSplash .texto {
            display: inline-block; white-space: nowrap; padding-left: 14px;
            font-family: 'Montserrat', 'Arial Black', Arial, sans-serif;
            font-weight: 900; font-style: italic; font-size: 40px; line-height: 1;
            color: #fff; letter-spacing: .02em;
        }
        #forzaSplash .texto span { color: #39e4a5; }
    `;
    document.head.appendChild(estilos);

    // ---------- Pantalla ----------
    const splash = document.createElement('div');
    splash.id = 'forzaSplash';
    splash.setAttribute('aria-hidden', 'true');
    splash.innerHTML = `
        <div class="grupo">
            <img class="logo" src="/imagenes/logo-splash.png" alt="">
            <div class="marco-texto"><span class="texto">FORZA <span>GYM</span></span></div>
        </div>`;

    function montar() {
        document.body.appendChild(splash);
        // Esperamos a que cargue el logo (y la tipografía, si llega rápido) antes de animar
        const img = splash.querySelector('.logo');
        const logoListo = img.complete ? Promise.resolve() : new Promise(r => { img.onload = img.onerror = r; });
        const fuenteLista = document.fonts && document.fonts.load
            ? Promise.race([document.fonts.load("italic 900 40px Montserrat"), esperar(600)])
            : Promise.resolve();
        Promise.all([logoListo, fuenteLista]).then(animar);
    }

    function esperar(ms) { return new Promise(r => setTimeout(r, ms)); }

    let terminado = false;
    function terminar() {
        if (terminado) return;
        terminado = true;
        // Si la página pidió ir a otro lado al terminar (ej: el socio ya tenía sesión), se va sin mostrar el login
        if (window.forzaSplashDestino) {
            avisarFin(true);
            location.replace(window.forzaSplashDestino);
            return;
        }
        splash.classList.add('saliendo');
        document.documentElement.classList.remove('con-splash');
        setTimeout(() => { splash.remove(); avisarFin(true); }, 350);
    }

    // Tocar la pantalla saltea la animación
    splash.addEventListener('click', terminar);

    async function animar() {
        if (terminado) return;
        const logo = splash.querySelector('.logo');
        const marco = splash.querySelector('.marco-texto');
        const texto = splash.querySelector('.texto');

        // Si el nombre no entra en pantallas muy chicas, se achica
        const disponible = window.innerWidth - 88 - 48;
        const anchoTexto = Math.min(texto.scrollWidth, disponible);
        if (texto.scrollWidth > disponible) texto.style.fontSize = (40 * disponible / texto.scrollWidth) + 'px';

        if (reducido || !logo.animate) {
            // Sin animación: logo y nombre fijos un momento
            logo.style.transform = 'scale(1)';
            marco.style.width = anchoTexto + 'px';
            await esperar(1200);
            return terminar();
        }

        const suave = 'cubic-bezier(.22, 1, .36, 1)';
        // Espera a que termine una animación (o varias juntas)
        const pasos = async (anim) => { try { await (anim.finished || anim); } catch (e) { /* cancelada */ } };

        // 1. El logo aparece desde un punto (con un pequeño rebote)
        await pasos(logo.animate(
            [{ transform: 'scale(0)', opacity: 0 }, { transform: 'scale(1.12)', opacity: 1, offset: .7 }, { transform: 'scale(1)', opacity: 1 }],
            { duration: 650, easing: 'ease-out', fill: 'forwards' }));
        await esperar(180);

        // 2. El nombre sale desde el logo (el logo se corre solo porque el grupo está centrado)
        await pasos(Promise.all([
            marco.animate([{ width: '0px' }, { width: anchoTexto + 'px' }], { duration: 650, easing: suave, fill: 'forwards' }).finished,
            texto.animate(
                [{ letterSpacing: '.45em', opacity: 0 }, { letterSpacing: '.02em', opacity: 1 }],
                { duration: 750, easing: suave, fill: 'forwards' }).finished
        ]));

        // 3. Queda quieto un momento
        await esperar(1100);

        // 4. El nombre vuelve a esconderse en el logo
        await pasos(Promise.all([
            marco.animate([{ width: anchoTexto + 'px' }, { width: '0px' }], { duration: 550, easing: 'cubic-bezier(.64, 0, .78, 0)', fill: 'forwards' }).finished,
            texto.animate(
                [{ letterSpacing: '.02em', opacity: 1 }, { letterSpacing: '.45em', opacity: 0 }],
                { duration: 550, easing: 'ease-in', fill: 'forwards' }).finished
        ]));
        await esperar(120);

        // 5. El logo se achica hasta desaparecer y entra la app
        await pasos(logo.animate(
            [{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(1.08)', opacity: 1, offset: .25 }, { transform: 'scale(0)', opacity: 0 }],
            { duration: 450, easing: 'ease-in', fill: 'forwards' }));
        terminar();
    }

    if (document.body) montar();
    else document.addEventListener('DOMContentLoaded', montar);

    // Por si algo falla, nunca queda trabada más de 6 segundos
    setTimeout(terminar, 6000);
})();
