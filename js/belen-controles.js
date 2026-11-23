// ============ SLIDERS, BOTONES Y CAPAS (belen-controles.js) ============

function sincronizarSliderInput(sliderId, inputId, min, max) {
    const slider = document.getElementById(sliderId);
    const input = document.getElementById(inputId);
    if (!slider || !input) return;
    slider.addEventListener('input', function () {
        if (piezaActiva && !juegoTerminado) {
            const val = parseFloat(this.value);
            input.value = val;
            piezaActiva.dataset[sliderId.replace('slider', '').toLowerCase()] = val;
            aplicarTransform(piezaActiva);
            if (!modoLibre) actualizarProgresoGeneral();
        }
    });
    input.addEventListener('input', function () {
        if (piezaActiva && !juegoTerminado) {
            let val = parseFloat(this.value);
            if (isNaN(val)) return;
            val = Math.max(min, Math.min(max, val));
            slider.value = val;
            piezaActiva.dataset[sliderId.replace('slider', '').toLowerCase()] = val;
            aplicarTransform(piezaActiva);
            if (!modoLibre) actualizarProgresoGeneral();
        }
    });
    input.addEventListener('change', function () {
        if (!juegoTerminado && !modoLibre) {
            verificarInicioRelojFinal();
            chequearVictoria();
        }
    });
}

sincronizarSliderInput('sliderX', 'inputX', 0, 100);
sincronizarSliderInput('sliderY', 'inputY', 0, 100);
sincronizarSliderInput('sliderZoom', 'inputZoom', 40, 300);
sincronizarSliderInput('sliderGiro', 'inputGiro', -180, 180);

const refrescarSlidersOriginal = refrescarSliders;
refrescarSliders = function(el) {
    refrescarSlidersOriginal(el);
    const s = leerEstado(el);
    document.getElementById('inputX').value = s.x;
    document.getElementById('inputY').value = s.y;
    document.getElementById('inputZoom').value = s.zoom;
    document.getElementById('inputGiro').value = s.giro;
};

btnVoltear.addEventListener('click', function () {
    if (piezaActiva && !juegoTerminado) {
        piezaActiva.dataset.volteada = piezaActiva.dataset.volteada === 'true' ? 'false' : 'true';
        aplicarTransform(piezaActiva);
    }
});

btnDuplicar.addEventListener('click', function () {
    if (piezaActiva && !juegoTerminado) {
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
            if (!modoLibre) {
                actualizarProgresoGeneral();
                verificarInicioRelojFinal();
                chequearVictoria();
            }
        }
    }
});

btnQuitar.addEventListener('click', function () {
    if (piezaActiva && !juegoTerminado) {
        const el = piezaActiva;
        const idP = el.dataset.personaje;
        const personaje = personajes.find(p => p.id === idP);
        const nombrePieza = personaje ? tBelenAcciones('char_belen_' + personaje.id) : 'esta pieza';
        const mensajeBase = tBelenAcciones('msg_remove_confirm');
        const mensajeFinal = mensajeBase.replace('{nombre}', nombrePieza);
        confirmarAccion(mensajeFinal, function () {
            if (piezaActiva === el) piezaActiva = null;
            el.remove();
            panelControles.classList.remove('visible');
            actualizarEstadoAvatar(idP);
            if (typeof liberarEstadoPanelHistory === 'function') liberarEstadoPanelHistory();
            if (!modoLibre) {
                actualizarProgresoGeneral();
                verificarInicioRelojFinal();
            }
        });
    }
});

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
    if (juegoTerminado) return;
    const el = document.getElementById(id);
    if (!el) return;
    el.style.zIndex = zindex(el) + (direccion * 10);
    renderizarCapas();
    if (!modoLibre) verificarInicioRelojFinal();
};

btnCapas.addEventListener('click', () => { if (!juegoTerminado) { renderizarCapas(); modalCapas.classList.add('visible'); } });
btnCerrarCapas.addEventListener('click', () => { modalCapas.classList.remove('visible'); });
modalCapas.addEventListener('click', (e) => { if (e.target === modalCapas) modalCapas.classList.remove('visible'); });

document.querySelector('.escena-overlay').addEventListener('click', function (e) {
    if (e.target === this || e.target === zonaFiguras) deseleccionar();
});

function recalcularTodasLasFiguras() {
    document.querySelectorAll('.figura-activa').forEach(f => aplicarTransform(f));
}
