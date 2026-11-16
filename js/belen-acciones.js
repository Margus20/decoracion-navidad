// ============ 1. CREAR FIGURA ============
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
    actualizarProgresoGeneral();
}

function actualizarEstadoAvatar(idPersonaje) {
    const btn = panelAvatars.querySelector('[data-id="' + idPersonaje + '"]');
    if (!btn) return;
    const n = document.querySelectorAll('.figura-activa[data-personaje="' + idPersonaje + '"]').length;
    btn.classList.toggle('activo', n > 0);
}

// ============ 2. BOTONES AVATAR ============
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
        const existentes = document.querySelectorAll('.figura-activa[data-personaje="' + personaje.id + '"]');
        if (existentes.length > 0) {
            const aQuitar = (piezaActiva && piezaActiva.dataset.personaje === personaje.id) ? piezaActiva : existentes[existentes.length - 1];
            if (confirm('¿Seguro que quieres quitar ' + personaje.nombre + ' de la escena?')) {
                if (piezaActiva === aQuitar) deseleccionar();
                aQuitar.remove();
                actualizarEstadoAvatar(personaje.id);
                actualizarProgresoGeneral();
            }
        } else {
            crearFigura(personaje);
        }
        if (modalCapas.classList.contains('visible')) renderizarCapas();
    });
});

// ============ 3. ARRASTRAR CON DEDO O MOUSE ============
function hacerArrastrable(elemento) {
    let arrastrando = false;
    let startX = 0, startY = 0, initX = 0, initY = 0;

    function inicio(e) {
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
        actualizarBarraIndividual(elemento);
        actualizarProgresoGeneral();
    }

    function fin() { arrastrando = false; }

    elemento.addEventListener('mousedown', inicio);
    document.addEventListener('mousemove', mover);
    document.addEventListener('mouseup', fin);
    elemento.addEventListener('touchstart', inicio, { passive: false });
    document.addEventListener('touchmove', mover, { passive: false });
    document.addEventListener('touchend', fin);
    document.addEventListener('touchcancel', fin);
}

// ============ 4. SLIDERS Y BOTONES DE CONTROL ============
sliderX.addEventListener('input', function () {
    if (piezaActiva) { piezaActiva.dataset.x = this.value; aplicarTransform(piezaActiva); actualizarBarraIndividual(piezaActiva); actualizarProgresoGeneral(); }
});
sliderY.addEventListener('input', function () {
    if (piezaActiva) { piezaActiva.dataset.y = this.value; aplicarTransform(piezaActiva); actualizarBarraIndividual(piezaActiva); actualizarProgresoGeneral(); }
});
sliderZoom.addEventListener('input', function () {
    if (piezaActiva) { piezaActiva.dataset.zoom = this.value; aplicarTransform(piezaActiva); }
});
sliderGiro.addEventListener('input', function () {
    if (piezaActiva) { piezaActiva.dataset.giro = this.value; aplicarTransform(piezaActiva); }
});

btnVoltear.addEventListener('click', function () {
    if (piezaActiva) {
        piezaActiva.dataset.volteada = piezaActiva.dataset.volteada === 'true' ? 'false' : 'true';
        aplicarTransform(piezaActiva);
    }
});

btnDuplicar.addEventListener('click', function () {
    if (piezaActiva) {
        const idP = piezaActiva.dataset.personaje;
        const personaje = personajes.find(p => p.id === idP);
        if (personaje) {
            contadorCopias++;
            const img = document.createElement('img');
            img.src = personaje.png;
            img.id = 'figura-' + personaje.id + '-' + contadorCopias;
            img.alt = personaje.nombre + ' (copia)';
            img.classList.add('figura-activa');
            img.draggable = false;
            img.dataset.personaje = personaje.id;
            const s = leerEstado(piezaActiva);
            img.dataset.x = Math.min(95, s.x + 5);
            img.dataset.y = Math.min(95, s.y + 5);
            img.dataset.zoom = s.zoom;
            img.dataset.giro = s.giro;
            img.dataset.volteada = s.volteada ? 'true' : 'false';
            img.style.zIndex = zindex(piezaActiva) + 10;
            aplicarTransform(img);
            hacerArrastrable(img);
            zonaFiguras.appendChild(img);
            actualizarEstadoAvatar(personaje.id);
            seleccionarPieza(img);
            actualizarProgresoGeneral();
        }
    }
});

btnQuitar.addEventListener('click', function () {
    if (piezaActiva) {
        const idP = piezaActiva.dataset.personaje;
        const personaje = personajes.find(p => p.id === idP);
        if (confirm('¿Seguro que quieres quitar ' + (personaje ? personaje.nombre : 'esta pieza') + '?')) {
            const el = piezaActiva;
            piezaActiva = null;
            el.remove();
            panelControles.classList.remove('visible');
            contenedorBarraInd.style.display = 'none';
            actualizarEstadoAvatar(idP);
            actualizarProgresoGeneral();
        }
    }
});

// ============ 5. MODAL DE CAPAS ============
function renderizarCapas() {
    listaCapas.innerHTML = '';
    const figuras = Array.from(document.querySelectorAll('.figura-activa')).sort((a, b) => zindex(b) - zindex(a));
    figuras.forEach((fig, index) => {
        const item = document.createElement('div');
        item.className = 'item-capa';
        item.innerHTML = '<span>' + (index + 1) + '. ' + fig.alt + '</span><div><button class="btn-capa" onclick="cambiarCapa(\'' + fig.id + '\', 1)">⬆</button><button class="btn-capa" onclick="cambiarCapa(\'' + fig.id + '\', -1)">⬇</button></div>';
        listaCapas.appendChild(item);
    });
}

window.cambiarCapa = function (id, direccion) {
    const el = document.getElementById(id);
    if (!el) return;
    el.style.zIndex = zindex(el) + (direccion * 10);
    renderizarCapas();
};

btnCapas.addEventListener('click', () => { renderizarCapas(); modalCapas.classList.add('visible'); });
btnCerrarCapas.addEventListener('click', () => { modalCapas.classList.remove('visible'); });
modalCapas.addEventListener('click', (e) => { if (e.target === modalCapas) modalCapas.classList.remove('visible'); });

// ============ 6. DESELECCIONAR Y RECALCULAR ============
document.querySelector('.escena-overlay').addEventListener('click', function (e) {
    if (e.target === this || e.target === zonaFiguras) deseleccionar();
});

function recalcularTodasLasFiguras() {
    document.querySelectorAll('.figura-activa').forEach(f => aplicarTransform(f));
}

// ============ 7. INICIALIZACIÓN ============
iniciarRelojLimpieza();
updateImage();
window.addEventListener('resize', () => { updateImage(); recalcularTodasLasFiguras(); });
window.addEventListener('orientationchange', updateImage);
document.addEventListener('visibilitychange', function () {
    if (!document.hidden) verificarTiempoTranscurrido();
});
