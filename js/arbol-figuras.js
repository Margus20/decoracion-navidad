// ============ FIGURAS Y ARRASTRE (arbol-figuras.js) ============

// Helper seguro para obtener traducciones dinámicas de personajes y mensajes
function tFiguras(key) {
    if (window.SistemaIdioma && window.SistemaIdioma.traducciones) {
        const lang = window.SistemaIdioma.actual();
        return window.SistemaIdioma.traducciones[lang][key] || window.SistemaIdioma.traducciones['es'][key] || key;
    }
    return key;
}

// === DICCIONARIO LOCAL DE LA PALETA (independiente de idioma.js) ===
// Incluye TODOS los colores vistos hasta ahora. Si aparece otro, se agrega aquí.
// Esto garantiza que la paleta se traduzca aunque idioma.js esté cacheado viejo.
const PALETA_ES = {
    titulo: 'Elige el color de {nombre}',
    colores: {
        original: 'Original', amarillo: 'Amarillo', anaranjado: 'Anaranjado',
        azul: 'Azul', morado: 'Morado', rojo: 'Rojo', plateado: 'Plateado'
    }
};
const PALETA_EN = {
    titulo: 'Choose the color of {nombre}',
    colores: {
        original: 'Original', amarillo: 'Yellow', anaranjado: 'Orange',
        azul: 'Blue', morado: 'Purple', rojo: 'Red', plateado: 'Silver'
    }
};

function paletaData() {
    const lang = (window.SistemaIdioma && window.SistemaIdioma.actual) ? window.SistemaIdioma.actual() : 'en';
    return lang === 'es' ? PALETA_ES : PALETA_EN;
}

function tColor(nombreOriginal) {
    const clave = nombreOriginal.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return paletaData().colores[clave] || nombreOriginal;
}

function crearFigura(personaje, pngOverride) {
    contadorCopias++;
    const img = document.createElement('img');
    img.src = pngOverride || personaje.png;
    img.id = 'figura-' + personaje.id + '-' + contadorCopias;
    img.alt = personaje.nombre;
    img.classList.add('figura-activa');
    img.draggable = false;
    img.dataset.personaje = personaje.id;
    img.dataset.x = 50; img.dataset.y = 50; img.dataset.zoom = 100; img.dataset.giro = 0; img.dataset.volteada = 'false';
    aplicarTransform(img);
    hacerArrastrable(img);
    zonaFiguras.appendChild(img);
    actualizarEstadoAvatar(personaje.id);
    seleccionarPieza(img);
    if (!modoLibre) { actualizarProgresoGeneral(); verificarInicioRelojFinal(); chequearVictoria(); }
}

function actualizarEstadoAvatar(idPersonaje) {
    const btn = panelAvatars.querySelector('[data-id="' + idPersonaje + '"]');
    if (!btn) return;
    btn.classList.toggle('activo', document.querySelectorAll('.figura-activa[data-personaje="' + idPersonaje + '"]').length > 0);
}

// --- PALETA DE COLORES (TÍTULO Y COLORES INDEPENDIENTES DE idioma.js + CIERRE ARREGLADO) ---
function abrirPaletaColores(personaje) {
    cerrarPaleta();
    const existente = document.querySelector('.figura-activa[data-personaje="' + personaje.id + '"]');
    const srcActual = existente ? existente.getAttribute('src') : null;
    const overlay = document.createElement('div');
    overlay.className = 'paleta-overlay';
    overlay.id = 'paletaOverlay';
    let opcionesHtml = '';
    
    personaje.colores.forEach(c => {
        const ruta = 'img/arbol/' + c.png;
        const esActual = srcActual && srcActual.indexOf(c.png) !== -1;
        const nombreTraducido = tColor(c.nombre);
        opcionesHtml += `<button class="paleta-opcion${esActual ? ' activo' : ''}" data-ruta="${ruta}" aria-label="Color ${nombreTraducido}"><img src="${ruta}" alt="${nombreTraducido}"><span>${nombreTraducido}</span></button>`;
    });
    
    const titulo = paletaData().titulo.replace('{nombre}', tFiguras('char_' + personaje.id));
    const btnCancelar = tFiguras('conf_cancel');
    
    overlay.innerHTML = `<div class="paleta-panel"><h3>${titulo}</h3><div class="paleta-grid">${opcionesHtml}</div><button class="paleta-cancelar">${btnCancelar}</button></div>`;
    document.body.appendChild(overlay);
    
    // CORRECCIÓN: Detenemos la propagación del evento para que no reabra el panel
    overlay.querySelectorAll('.paleta-opcion').forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            const ruta = btn.dataset.ruta;
            cerrarPaleta(); // Cerramos primero
            aplicarColor(personaje, ruta); // Luego aplicamos
        });
    });
    
    const cancelar = overlay.querySelector('.paleta-cancelar');
    if (cancelar) {
        cancelar.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            cerrarPaleta();
        });
    }
    overlay.addEventListener('click', (e) => { if (e.target === overlay) cerrarPaleta(); });
}

function cerrarPaleta() {
    const o = document.getElementById('paletaOverlay');
    if (o) o.remove();
}

function aplicarColor(personaje, rutaPng) {
    const existente = document.querySelector('.figura-activa[data-personaje="' + personaje.id + '"]');
    if (existente) {
        existente.src = rutaPng;
    } else {
        crearFigura(personaje, rutaPng);
    }
    if (!modoLibre && typeof actualizarProgresoGeneral === 'function') actualizarProgresoGeneral();
}

// --- BOTONES DE AVATAR ---
personajes.forEach(function (personaje) {
    const btn = document.createElement('button');
    btn.classList.add('avatar-btn');
    btn.setAttribute('data-id', personaje.id);
    btn.setAttribute('aria-label', personaje.nombre);
    const img = document.createElement('img');
    img.src = personaje.avatar; img.alt = personaje.nombre; img.draggable = false;
    btn.appendChild(img);
    panelAvatars.appendChild(btn);

    btn.addEventListener('click', function () {
        if (juegoTerminado) return;
        if (personaje.colores && personaje.colores.length) {
            abrirPaletaColores(personaje);
            return;
        }
        const existentes = document.querySelectorAll('.figura-activa[data-personaje="' + personaje.id + '"]');
        if (existentes.length > 0) {
            const aQuitar = (piezaActiva && piezaActiva.dataset.personaje === personaje.id) ? piezaActiva : existentes[existentes.length - 1];
            const nombrePersonaje = tFiguras('char_' + personaje.id);
            const mensajeBase = tFiguras('msg_remove_confirm');
            const mensajeFinal = mensajeBase.replace('{nombre}', nombrePersonaje);
            confirmarAccion(mensajeFinal, function () {
                if (piezaActiva === aQuitar) deseleccionar();
                aQuitar.remove();
                actualizarEstadoAvatar(personaje.id);
                if (typeof liberarEstadoPanelHistory === 'function') liberarEstadoPanelHistory(); // <-- NUEVO: Limpia el historial al quitar
                if (!modoLibre) actualizarProgresoGeneral();
            });
        } else {
            crearFigura(personaje);
        }
        if (modalCapas.classList.contains('visible')) renderizarCapas();
    });
});

// --- ARRASTRE + PELLIZCO (NUEVO: escala con dos dedos sin quitar el arrastre) ---
function hacerArrastrable(elemento) {
    let arrastrando = false, startX = 0, startY = 0, initX = 0, initY = 0;
    let pinchActivo = false, distPinchInicial = 0, zoomPinchInicial = 0;

    function distanciaDosDedos(e) {
        const t = e.touches;
        return Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
    }

    function inicio(e) {
        if (juegoTerminado) return;
        if (e.touches && e.touches.length === 2) {
            pinchActivo = true;
            arrastrando = false;
            e.preventDefault();
            seleccionarPieza(elemento);
            distPinchInicial = distanciaDosDedos(e);
            zoomPinchInicial = parseFloat(elemento.dataset.zoom) || 100;
            return;
        }
        seleccionarPieza(elemento);
        arrastrando = true;
        e.preventDefault();
        const cx = e.touches ? e.touches[0].clientX : e.clientX;
        const cy = e.touches ? e.touches[0].clientY : e.clientY;
        startX = cx; startY = cy;
        initX = parseFloat(elemento.dataset.x) || 50;
        initY = parseFloat(elemento.dataset.y) || 50;
    }

    function mover(e) {
        if (juegoTerminado) return;
        if (pinchActivo) {
            if (!e.touches || e.touches.length < 2) return;
            e.preventDefault();
            const nueva = distanciaDosDedos(e);
            if (distPinchInicial > 0) {
                let nuevoZoom = zoomPinchInicial * (nueva / distPinchInicial);
                nuevoZoom = Math.max(40, Math.min(300, nuevoZoom));
                elemento.dataset.zoom = nuevoZoom;
                aplicarTransform(elemento);
                refrescarSliders(elemento);
                if (!modoLibre) actualizarProgresoGeneral();
            }
            return;
        }
        if (!arrastrando) return;
        e.preventDefault();
        const cx = e.touches ? e.touches[0].clientX : e.clientX;
        const cy = e.touches ? e.touches[0].clientY : e.clientY;
        elemento.dataset.x = Math.max(0, Math.min(100, initX + (cx - startX) / window.innerWidth * 100));
        elemento.dataset.y = Math.max(0, Math.min(100, initY + (cy - startY) / window.innerHeight * 100));
        aplicarTransform(elemento);
        refrescarSliders(elemento);
        if (!modoLibre) actualizarProgresoGeneral();
    }

    function fin(e) {
        if (pinchActivo && (!e || !e.touches || e.touches.length < 2)) {
            pinchActivo = false;
            if (!modoLibre) { actualizarProgresoGeneral(); verificarInicioRelojFinal(); chequearVictoria(); }
        }
        if (arrastrando) {
            arrastrando = false;
            if (!modoLibre) { actualizarProgresoGeneral(); verificarInicioRelojFinal(); chequearVictoria(); }
        }
    }

    elemento.addEventListener('mousedown', inicio);
    document.addEventListener('mousemove', mover);
    document.addEventListener('mouseup', fin);
    elemento.addEventListener('touchstart', inicio, { passive: false });
    document.addEventListener('touchmove', mover, { passive: false });
    document.addEventListener('touchend', fin);
    document.addEventListener('touchcancel', fin);
}
