// ============ VARIABLES DE TIEMPO Y ESTADO ============
let tiempoGlobalRestante = 8 * 60;
let tiempoFinalRestante = 45;
let intervaloGlobal = null;
let intervaloFinal = null;
let juegoTerminado = false;
let modoLibre = false;

// Helper seguro para obtener traducciones dinámicas en acciones del Belén
function tBelenAcciones(key) {
    if (window.SistemaIdioma && window.SistemaIdioma.traducciones) {
        const lang = window.SistemaIdioma.actual();
        return window.SistemaIdioma.traducciones[lang][key] || window.SistemaIdioma.traducciones['es'][key] || key;
    }
    const fallback = {
        msg_remove_confirm: '¿Seguro que quieres quitar {nombre} de la escena?',
        char_belen_maria: 'María', char_belen_jose: 'José', char_belen_jesus: 'el Niño Jesús',
        char_belen_estrella: 'la Estrella', char_belen_oveja: 'la Oveja', char_belen_burro: 'el Burro',
        char_belen_pesebre: 'el Pesebre', char_belen_cuna: 'la Cuna',
        honor_anonymous: 'Anónimo',
        honor_empty: 'Aún no hay registros. ¡Sé el primero!'
    };
    return fallback[key] || key;
}

// ============ 1. RELOJES DEL JUEGO ============
function iniciarRelojGlobal() {
    actualizarDisplayReloj('relojGlobalNumero', tiempoGlobalRestante);
    intervaloGlobal = setInterval(() => {
        tiempoGlobalRestante--;
        actualizarDisplayReloj('relojGlobalNumero', tiempoGlobalRestante);
        if (tiempoGlobalRestante <= 0) {
            finalizarJuego('tiempo');
        }
    }, 1000);
}

function iniciarRelojFinal() {
    document.getElementById('relojFinal').style.display = 'flex';
    actualizarDisplayReloj('relojFinalNumero', tiempoFinalRestante);
    intervaloFinal = setInterval(() => {
        tiempoFinalRestante--;
        actualizarDisplayReloj('relojFinalNumero', tiempoFinalRestante);
        
        const relojFinalEl = document.getElementById('relojFinal');
        if (tiempoFinalRestante <= 20) {
            relojFinalEl.classList.add('urgente');
        }
        
        if (tiempoFinalRestante <= 0) {
            finalizarJuego('tiempo');
        }
    }, 1000);
}

function actualizarDisplayReloj(idElemento, segundos) {
    const m = Math.floor(segundos / 60).toString().padStart(2, '0');
    const s = (segundos % 60).toString().padStart(2, '0');
    document.getElementById(idElemento).textContent = m + ':' + s;
}

function verificarInicioRelojFinal() {
    if (juegoTerminado || modoLibre || intervaloFinal) return;
    const figuras = document.querySelectorAll('.figura-activa');
    const hayOchoPiezas = figuras.length === 8;
    const todasUnicas = idsNecesarios.every(id => figuras.filter(f => f.dataset.personaje === id).length === 1);
    
    if (hayOchoPiezas && todasUnicas) {
        iniciarRelojFinal();
    }
}

function finalizarJuego(motivo) {
    if (juegoTerminado) return;
    juegoTerminado = true;
    clearInterval(intervaloGlobal);
    clearInterval(intervaloFinal);
    
    document.body.classList.add('juego-congelado');
    document.getElementById('relojGlobal').classList.add('agotado');
    const rf = document.getElementById('relojFinal');
    if (rf) rf.classList.add('agotado');
    
    deseleccionar();
    actualizarProgresoGeneral();
    if (typeof liberarEstadoPanelHistory === 'function') liberarEstadoPanelHistory();
    
    if (typeof mostrarResultadoFinal === 'function') {
        mostrarResultadoFinal(calcularScoreGeneral(), motivo);
    }
}

// ============ MODO LIBRE ============
function activarModoLibre() {
    modoLibre = true;
    juegoTerminado = false;
    clearInterval(intervaloGlobal);
    clearInterval(intervaloFinal);
    document.body.classList.remove('juego-congelado');
    document.body.classList.remove('mostrar-reinicio');
    
    const zonaRelojes = document.querySelector('.zona-relojes'); if (zonaRelojes) zonaRelojes.style.display = 'flex';
    const btnDonate = document.querySelector('.btn-donate'); if (btnDonate) btnDonate.style.display = 'inline-flex';
    
    const rg = document.getElementById('relojGlobal'); if (rg) rg.style.display = 'none';
    const rf2 = document.getElementById('relojFinal'); if (rf2) rf2.style.display = 'none';
    
    const pp = document.querySelector('.panel-progreso'); if (pp) pp.style.display = 'none';
    const bh = document.getElementById('btnHonor'); if (bh) bh.style.display = 'none';
    const mr = document.getElementById('modalResultado'); if (mr) mr.classList.remove('visible');
    const mh = document.getElementById('modalHonor'); if (mh) mh.classList.remove('visible');
    
    deseleccionar();
    if (typeof liberarEstadoPanelHistory === 'function') liberarEstadoPanelHistory();
}

// ============ RED DE SEGURIDAD ============
function chequearVictoria() {
    if (juegoTerminado || modoLibre) return;
    const figuras = document.querySelectorAll('.figura-activa');
    if (figuras.length !== 8) return;
    const todasUnicas = idsNecesarios.every(id => figuras.filter(f => f.dataset.personaje === id).length === 1);
    if (!todasUnicas) return;
    
    if (Math.round(calcularScoreGeneral()) >= 100) {
        finalizarJuego('victoria');
    }
}

// ============ 2. TABLA DE HONOR LOCAL ============
function guardarEnTablaHonor(nombre, puntaje) {
    let tabla = JSON.parse(localStorage.getItem('belenTablaHonor')) || [];
    const fecha = new Date().toLocaleDateString('es-VE');
    tabla.push({ nombre: nombre || tBelenAcciones('honor_anonymous'), puntaje: Math.round(puntaje), fecha });
    tabla.sort((a, b) => b.puntaje - a.puntaje);
    tabla = tabla.slice(0, 10);
    localStorage.setItem('belenTablaHonor', JSON.stringify(tabla));
}

function mostrarTablaHonor() {
    const tabla = JSON.parse(localStorage.getItem('belenTablaHonor')) || [];
    const lista = document.getElementById('listaHonor');
    lista.innerHTML = '';
    
    if (tabla.length === 0) {
        lista.innerHTML = '<div class="item-honor vacio">' + tBelenAcciones('honor_empty') + '</div>';
    } else {
        tabla.forEach((item, index) => {
            const div = document.createElement('div');
            div.className = 'item-honor';
            div.innerHTML = '<span class="puesto">#' + (index + 1) + '</span><span class="nombre">' + item.nombre + '</span><span class="puntaje">' + item.puntaje + ' pts</span>';
            lista.appendChild(div);
        });
    }
    document.getElementById('modalHonor').classList.add('visible');
}

// ============ 3. CREAR FIGURA ============
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

// ============ 4. BOTONES AVATAR ============
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
                if (typeof liberarEstadoPanelHistory === 'function') liberarEstadoPanelHistory(); // <-- NUEVO
                if (!modoLibre) actualizarProgresoGeneral();
            });
        } else {
            crearFigura(personaje);
        }
        if (modalCapas.classList.contains('visible')) renderizarCapas();
    });
});

// ============ 5. ARRASTRAR + PELLIZCO (NUEVO) ============
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

// ============ 6. SLIDERS Y CONTROLES ============
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
            if (typeof liberarEstadoPanelHistory === 'function') liberarEstadoPanelHistory(); // <-- NUEVO
            if (!modoLibre) {
                actualizarProgresoGeneral();
                verificarInicioRelojFinal();
            }
        });
    }
});

// ============ 7. MODAL DE CAPAS ============
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

// ============ 8. DESELECCIONAR Y RECALCULAR ============
document.querySelector('.escena-overlay').addEventListener('click', function (e) {
    if (e.target === this || e.target === zonaFiguras) deseleccionar();
});

function recalcularTodasLasFiguras() {
    document.querySelectorAll('.figura-activa').forEach(f => aplicarTransform(f));
}

// ============ 9. RESULTADO Y REINICIO ============
function mostrarBotonReinicio() {
    document.body.classList.add('mostrar-reinicio');
}

const btnGuardarNombre = document.getElementById('btnGuardarNombre');
if (btnGuardarNombre) {
    btnGuardarNombre.addEventListener('click', function() {
        const inputNombre = document.getElementById('inputNombre');
        const nombre = inputNombre.value.trim() || tBelenAcciones('honor_anonymous');
        guardarEnTablaHonor(nombre, calcularScoreGeneral());
        
        document.getElementById('modalResultado').classList.remove('visible');
        mostrarBotonReinicio();
        mostrarTablaHonor();
    });
}

const btnCerrarXResultado = document.getElementById('btnCerrarXResultado');
if (btnCerrarXResultado) {
    btnCerrarXResultado.addEventListener('click', function() {
        document.getElementById('modalResultado').classList.remove('visible');
        mostrarBotonReinicio();
    });
}

const btnSeguirDecorando = document.getElementById('btnSeguirDecorando');
if (btnSeguirDecorando) {
    btnSeguirDecorando.addEventListener('click', function() {
        if (typeof activarModoLibre === 'function') {
            activarModoLibre();
        }
    });
}

const btnHonor = document.getElementById('btnHonor');
if (btnHonor) {
    btnHonor.addEventListener('click', function(
