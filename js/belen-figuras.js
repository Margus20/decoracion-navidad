// ============ PIEZAS, AVATARES Y ARRASTRE (belen-figuras.js) ============

function crearFigura(personaje) {
    contadorCopias++;
    const img = document.createElement('img');
    img.src = personaje.png;
    img.id = 'figura-' + personaje.id + '-' + contadorCopias;
    img.alt = personaje.nombre;
    img.classList.add('figura-activa');
    img.draggable = false;
    img.dataset.personaje = personaje.id;
    img.dataset.x = 50;
    img.dataset.y = 50;
    img.dataset.zoom = 100;
    img.dataset.giro = 0;
    img.dataset.volteada = 'false';
    aplicarTransform(img);
    hacerArrastrable(img);
    zonaFiguras.appendChild(img);
    actualizarEstadoAvatar(personaje.id);
    seleccionarPieza(img);
    if (!modoLibre) {
        actualizarProgresoGeneral();
        verificarInicioRelojFinal();
        chequearVictoria();
    }
}

function actualizarEstadoAvatar(idPersonaje) {
    const btn = panelAvatars.querySelector('[data-id="' + idPersonaje + '"]');
    if (!btn) return;
    const n = document.querySelectorAll('.figura-activa[data-personaje="' + idPersonaje + '"]').length;
    btn.classList.toggle('activo', n > 0);
}

personajes.forEach(function (personaje) {
    const btn = document.createElement('button');
    btn.classList.add('avatar-btn');
    btn.setAttribute('data-id', personaje.id);
    btn.setAttribute('aria-label', personaje.nombre);
    const img = document.createElement('img');
    img.src = personaje.avatar;
    img.alt = personaje.nombre;
    img.draggable = false;
    btn.appendChild(img);
    panelAvatars.appendChild(btn);

    btn.addEventListener('click', function () {
        if (juegoTerminado) return;
        const existentes = document.querySelectorAll('.figura-activa[data-personaje="' + personaje.id + '"]');
        if (existentes.length > 0) {
            const aQuitar = (piezaActiva && piezaActiva.dataset.personaje === personaje.id) ? piezaActiva : existentes[existentes.length - 1];
            const nombrePersonaje = tBelenAcciones('char_belen_' + personaje.id);
            const mensajeBase = tBelenAcciones('msg_remove_confirm');
            const mensajeFinal = mensajeBase.replace('{nombre}', nombrePersonaje);
            confirmarAccion(mensajeFinal, function () {
                if (piezaActiva === aQuitar) deseleccionar();
                aQuitar.remove();
                actualizarEstadoAvatar(personaje.id);
                if (typeof liberarEstadoPanelHistory === 'function') liberarEstadoPanelHistory();
                if (!modoLibre) actualizarProgresoGeneral();
            });
        } else {
            crearFigura(personaje);
        }
        if (modalCapas.classList.contains('visible')) renderizarCapas();
    });
});

// --- ARRASTRE + PELLIZCO ---
function hacerArrastrable(elemento) {
    let arrastrando = false;
    let startX = 0, startY = 0, initX = 0, initY = 0;
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
        startX = cx;
        startY = cy;
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
        const dxPct = (cx - startX) / window.innerWidth * 100;
        const dyPct = (cy - startY) / window.innerHeight * 100;
        elemento.dataset.x = Math.max(0, Math.min(100, initX + dxPct));
        elemento.dataset.y = Math.max(0, Math.min(100, initY + dyPct));
        aplicarTransform(elemento);
        refrescarSliders(elemento);
        if (!modoLibre) actualizarProgresoGeneral();
    }

    function fin(e) {
        if (pinchActivo && (!e || !e.touches || e.touches.length < 2)) {
            pinchActivo = false;
            if (!modoLibre) {
                actualizarProgresoGeneral();
                verificarInicioRelojFinal();
                chequearVictoria();
            }
        }
        if (arrastrando) {
            arrastrando = false;
            if (!modoLibre) {
                actualizarProgresoGeneral();
                verificarInicioRelojFinal();
                chequearVictoria();
            }
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
