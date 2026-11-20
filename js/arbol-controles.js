// ============ CONTROLES, MODALES E INICIALIZACIÓN (arbol-controles.js) ============

// --- SLIDERS Y CAMPOS NUMÉRICOS ---
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

// --- BOTONES DE CONTROL ---
if (btnVoltear) {
    btnVoltear.addEventListener('click', () => {
        if (piezaActiva && !juegoTerminado) {
            piezaActiva.dataset.volteada = piezaActiva.dataset.volteada === 'true' ? 'false' : 'true';
            aplicarTransform(piezaActiva);
        }
    });
}

if (btnDuplicar) {
    btnDuplicar.addEventListener('click', () => {
        if (piezaActiva && !juegoTerminado) {
            const idP = piezaActiva.dataset.personaje;
            const personaje = personajes.find(p => p.id === idP);
            if (personaje) {
                contadorCopias++;
                const img = document.createElement('img');
                img.src = piezaActiva.src; // Conserva el color actual
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
}

if (btnQuitar) {
    btnQuitar.addEventListener('click', () => {
        if (piezaActiva && !juegoTerminado) {
            // === AJUSTE: Usamos el modal personalizado en lugar del confirm() nativo ===
            const el = piezaActiva; // Capturamos la referencia antes de la función asíncrona
            const idP = el.dataset.personaje;
            const personaje = personajes.find(p => p.id === idP);
            
            confirmarAccion('¿Seguro que quieres quitar ' + (personaje ? personaje.nombre : 'esta pieza') + '?', function () {
                if (piezaActiva === el) piezaActiva = null;
                el.remove();
                panelControles.classList.remove('visible');
                actualizarEstadoAvatar(idP);
                if (!modoLibre) { 
                    actualizarProgresoGeneral(); 
                    verificarInicioRelojFinal(); 
                }
            });
        }
    });
}

// --- CAPAS ---
function renderizarCapas() {
    if (!listaCapas) return;
    listaCapas.innerHTML = '';
    const figuras = Array.from(document.querySelectorAll('.figura-activa')).sort((a, b) => zindex(b) - zindex(a));
    figuras.forEach((fig, index) => {
        const item = document.createElement('div');
        item.className = 'item-capa';
        item.innerHTML = `<span>${index + 1}. ${fig.alt}</span><div><button class="btn-capa" onclick="cambiarCapa('${fig.id}', 1)">⬆</button><button class="btn-capa" onclick="cambiarCapa('${fig.id}', -1)">⬇</button></div>`;
        listaCapas.appendChild(item);
    });
}

window.cambiarCapa = function (id, direccion) {
    if (juegoTerminado) return;
    const el = document.getElementById(id);
    if (el) { 
        el.style.zIndex = zindex(el) + (direccion * 10); 
        renderizarCapas(); 
        if (!modoLibre) verificarInicioRelojFinal(); 
    }
};

if (btnCapas) btnCapas.addEventListener('click', () => { if (!juegoTerminado) { renderizarCapas(); modalCapas.classList.add('visible'); } });
if (btnCerrarCapas) btnCerrarCapas.addEventListener('click', () => modalCapas.classList.remove('visible'));
if (modalCapas) modalCapas.addEventListener('click', (e) => { if (e.target === modalCapas) modalCapas.classList.remove('visible'); });

// --- DESELECCIONAR Y RECALCULAR ---
document.querySelector('.escena-overlay').addEventListener('click', function (e) {
    if (e.target === this || e.target === zonaFiguras) deseleccionar();
});

function recalcularTodasLasFiguras() { 
    document.querySelectorAll('.figura-activa').forEach(f => aplicarTransform(f)); 
}

// --- MODALES Y TABLA DE HONOR ---
function mostrarBotonReinicio() { 
    document.body.classList.add('mostrar-reinicio'); 
}

function guardarEnTablaHonor(nombre, puntaje) {
    let tabla = JSON.parse(localStorage.getItem('arbolTablaHonor')) || [];
    tabla.push({ nombre: nombre || 'Anónimo', puntaje: Math.round(puntaje), fecha: new Date().toLocaleDateString('es-VE') });
    tabla = tabla.sort((a, b) => b.puntaje - a.puntaje).slice(0, 10);
    localStorage.setItem('arbolTablaHonor', JSON.stringify(tabla));
}

function mostrarTablaHonor() {
    const tabla = JSON.parse(localStorage.getItem('arbolTablaHonor')) || [];
    const lista = document.getElementById('listaHonor');
    if (!lista) return;
    lista.innerHTML = tabla.length === 0 ? '<div class="item-honor vacio">Aún no hay registros. ¡Sé el primero!</div>' : '';
    tabla.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'item-honor';
        div.innerHTML = `<span class="puesto">#${index + 1}</span><span class="nombre">${item.nombre}</span><span class="puntaje">${item.puntaje} pts</span>`;
        lista.appendChild(div);
    });
    const modalHonor = document.getElementById('modalHonor');
    if (modalHonor) modalHonor.classList.add('visible');
}

const btnGuardarNombre = document.getElementById('btnGuardarNombre');
if (btnGuardarNombre) {
    btnGuardarNombre.addEventListener('click', () => {
        guardarEnTablaHonor(document.getElementById('inputNombre').value.trim() || 'Anónimo', calcularScoreGeneral());
        document.getElementById('modalResultado').classList.remove('visible');
        mostrarBotonReinicio(); 
        mostrarTablaHonor();
    });
}

const btnCerrarXResultado = document.getElementById('btnCerrarXResultado');
if (btnCerrarXResultado) {
    btnCerrarXResultado.addEventListener('click', () => {
        document.getElementById('modalResultado').classList.remove('visible'); 
        mostrarBotonReinicio();
    });
}

const btnSeguirDecorando = document.getElementById('btnSeguirDecorando');
if (btnSeguirDecorando) {
    btnSeguirDecorando.addEventListener('click', () => { 
        if (typeof activarModoLibre === 'function') activarModoLibre(); 
    });
}

const btnHonor = document.getElementById('btnHonor');
if (btnHonor) btnHonor.addEventListener('click', mostrarTablaHonor);

const btnCerrarHonor = document.getElementById('btnCerrarHonor');
if (btnCerrarHonor) {
    btnCerrarHonor.addEventListener('click', () => {
        document.getElementById('modalHonor').classList.remove('visible');
    });
}

const modalHonorEl = document.getElementById('modalHonor');
if (modalHonorEl) {
    modalHonorEl.addEventListener('click', (e) => { 
        if (e.target.id === 'modalHonor') modalHonorEl.classList.remove('visible'); 
    });
}

const btnReiniciar = document.getElementById('btnReiniciar');
if (btnReiniciar) {
    btnReiniciar.addEventListener('click', () => location.reload());
}

// ==========================================================
// --- INICIALIZACIÓN A PRUEBA DE FALLOS ---
// ==========================================================
function arrancarJuego() {
    if (typeof iniciarRelojGlobal === 'function') iniciarRelojGlobal();
    if (typeof updateImage === 'function') updateImage(); // Esto carga el fondo
}

// Si la página aún se está cargando, espera. Si ya está lista, ejecuta YA.
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', arrancarJuego);
} else {
    arrancarJuego();
}

window.addEventListener('resize', () => { 
    if (typeof updateImage === 'function') updateImage(); 
    if (typeof recalcularTodasLasFiguras === 'function') recalcularTodasLasFiguras(); 
});

window.addEventListener('orientationchange', () => {
    if (typeof updateImage === 'function') updateImage();
});

document.addEventListener('visibilitychange', function () { 
    if (!document.hidden && typeof verificarTiempoTranscurrido === 'function') verificarTiempoTranscurrido(); 
});
