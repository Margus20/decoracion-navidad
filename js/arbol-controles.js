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
if (typeof btnVoltear !== 'undefined' && btnVoltear) {
    btnVoltear.addEventListener('click', () => {
        if (piezaActiva && !juegoTerminado) {
            piezaActiva.dataset.volteada = piezaActiva.dataset.volteada === 'true' ? 'false' : 'true';
            aplicarTransform(piezaActiva);
        }
    });
}

if (typeof btnDuplicar !== 'undefined' && btnDuplicar) {
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

if (typeof btnQuitar !== 'undefined' && btnQuitar) {
    btnQuitar.addEventListener('click', () => {
        if (piezaActiva && !juegoTerminado) {
            const el = piezaActiva; // Capturamos la referencia antes de la función asíncrona
            const idP = el.dataset.personaje;
            const personaje = personajes.find(p => p.id === idP);
            
            // === AJUSTE SEGURO PARA BILINGÜISMO ===
            const nombrePieza = (typeof tFiguras === 'function') 
                ? tFiguras('char_' + (personaje ? personaje.id : 'unknown')) 
                : (personaje ? personaje.nombre : 'esta pieza');

            const mensajeBase = (typeof tFiguras === 'function') 
                ? tFiguras('msg_remove_confirm') 
                : '¿Seguro que quieres quitar {nombre}?';

            const mensajeFinal = mensajeBase.replace('{nombre}', nombrePieza);
            
            confirmarAccion(mensajeFinal, function () {
                if (piezaActiva === el) piezaActiva = null;
                el.remove();
                panelControles.classList.remove('visible');
                actualizarEstadoAvatar(idP);
                if (typeof liberarEstadoPanelHistory === 'function') liberarEstadoPanelHistory(); // <-- NUEVO: Limpia el historial al quitar
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
    if (typeof listaCapas === 'undefined' || !listaCapas) return;
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

if (typeof btnCapas !== 'undefined' && btnCapas) btnCapas.addEventListener('click', () => { if (!juegoTerminado) { renderizarCapas(); modalCapas.classList.add('visible'); } });
if (typeof btnCerrarCapas !== 'undefined' && btnCerrarCapas) btnCerrarCapas.addEventListener('click', () => modalCapas.classList.remove('visible'));
if (typeof modalCapas !== 'undefined' && modalCapas) modalCapas.addEventListener('click', (e) => { if (e.target === modalCapas) modalCapas.classList.remove('visible'); });

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
    const anonimo = (typeof tFiguras === 'function') ? tFiguras('honor_anonymous') : 'Anónimo';
    tabla.push({ nombre: nombre || anonimo, puntaje: Math.round(puntaje), fecha: new Date().toLocaleDateString('es-VE') });
    tabla = tabla.sort((a, b) => b.puntaje - a.puntaje).slice(0, 10);
    localStorage.setItem('arbolTablaHonor', JSON.stringify(tabla));
}

function mostrarTablaHonor() {
    const tabla = JSON.parse(localStorage.getItem('arbolTablaHonor')) || [];
    const lista = document.getElementById('listaHonor');
    if (!lista) return;
    
    const vacioMsg = (typeof tFiguras === 'function') ? tFiguras('honor_empty') : 'Aún no hay registros. ¡Sé el primero!';
    lista.innerHTML = tabla.length === 0 ? `<div class="item-honor vacio">${vacioMsg}</div>` : '';
    
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
        const anonimo = (typeof tFiguras === 'function') ? tFiguras('honor_anonymous') : 'Anónimo';
        guardarEnTablaHonor(document.getElementById('inputNombre').value.trim() || anonimo, calcularScoreGeneral());
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
// --- NUEVO: AJUSTES DE EXPERIENCIA DE USUARIO ---
// ==========================================================

// --- Ajuste 1: Botón X dentro del panel de controles ---
(function crearBotonCerrarPanel() {
    if (typeof panelControles === 'undefined' || !panelControles) return;
    if (document.getElementById('btnCerrarPanelControles')) return;
    const pos = window.getComputedStyle(panelControles).position;
    if (pos === 'static') panelControles.style.position = 'relative';
    const btn = document.createElement('button');
    btn.id = 'btnCerrarPanelControles';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Cerrar panel');
    btn.textContent = '✕';
    btn.style.cssText = 'position:absolute; top:0.5rem; right:0.6rem; width:2rem; height:2rem; border-radius:50%; border:2px solid #ffd700; background:rgba(0,0,0,0.55); color:#ffd700; font-size:1.1rem; font-weight:bold; line-height:1; cursor:pointer; z-index:20; padding:0; display:flex; align-items:center; justify-content:center;';
    panelControles.appendChild(btn);
    btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        cerrarPanelDeControles();
    });
})();

// --- Ajuste 2: función central de cierre (X + clic en zona vacía) ---
function cerrarPanelDeControles() {
    if (typeof deseleccionar === 'function') deseleccionar();
    if (typeof piezaActiva !== 'undefined') piezaActiva = null;
    if (typeof panelControles !== 'undefined' && panelControles) panelControles.classList.remove('visible');
    if (typeof liberarEstadoPanelHistory === 'function') liberarEstadoPanelHistory();
}

(function reforzarCierrePorClicVacio() {
    function handler(e) {
        if (typeof panelControles === 'undefined' || !panelControles || !panelControles.classList.contains('visible')) return;
        if (e.target.closest && e.target.closest('.panel-controles, .figura-activa, .avatar-btn, .menu-hamburguesa-btn, .menu-desplegable, .modal-capas, .modal-resultado, .modal-honor, .paleta-overlay, .zona-relojes, .panel-progreso')) return;
        cerrarPanelDeControles();
    }
    const overlay = document.querySelector('.escena-overlay');
    const container = document.querySelector('.container');
    if (overlay) overlay.addEventListener('click', handler);
    if (container) container.addEventListener('click', handler);
})();

// --- Ajuste 3: botón de regresar no sale de la página si hay panel abierto ---
let panelHistoryActivo = false;

function asegurarEstadoPanelHistory() {
    if (!panelHistoryActivo) {
        try { history.pushState({ panelAbierto: true }, ''); } catch (e) {}
        panelHistoryActivo = true;
    }
}

function liberarEstadoPanelHistory() {
    if (panelHistoryActivo) {
        panelHistoryActivo = false;
        try { history.back(); } catch (e) {}
    }
}

window.addEventListener('popstate', function () {
    if (panelHistoryActivo) {
        panelHistoryActivo = false;
        if (typeof deseleccionar === 'function') deseleccionar();
        if (typeof piezaActiva !== 'undefined') piezaActiva = null;
        if (typeof panelControles !== 'undefined' && panelControles) panelControles.classList.remove('visible');
    }
});

(function envolverSeleccionarPieza() {
    if (typeof seleccionarPieza !== 'function') return;
    const original = seleccionarPieza;
    window.seleccionarPieza = function (el) {
        original(el);
        asegurarEstadoPanelHistory();
    };
})();

// ==========================================================
// --- INICIALIZACIÓN A PRUEBA DE FALLOS ---
// ==========================================================
function arrancarJuego() {
    if (typeof iniciarRelojGlobal === 'function') iniciarRelojGlobal();
    if (typeof updateImage === 'function') updateImage(); // Esto carga el fondo
}

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
