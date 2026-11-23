// ============ RESULTADO, UX E INICIALIZACIÓN (belen-ux.js) ============

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
        if (typeof activarModoLibre === 'function') activarModoLibre();
    });
}

const btnHonor = document.getElementById('btnHonor');
if (btnHonor) {
    btnHonor.addEventListener('click', function() { mostrarTablaHonor(); });
}

const btnCerrarHonor = document.getElementById('btnCerrarHonor');
if (btnCerrarHonor) {
    btnCerrarHonor.addEventListener('click', function() {
        document.getElementById('modalHonor').classList.remove('visible');
    });
}

document.getElementById('modalHonor').addEventListener('click', (e) => {
    if (e.target.id === 'modalHonor') document.getElementById('modalHonor').classList.remove('visible');
});

const btnReiniciar = document.getElementById('btnReiniciar');
if (btnReiniciar) {
    btnReiniciar.addEventListener('click', function() { location.reload(); });
}

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

// --- Ajuste 2: cierre central (X + clic en zona vacía) ---
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

// --- Ajuste 3: botón de regresar no sale si hay panel abierto ---
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

// ============ INICIALIZACIÓN ============
iniciarRelojGlobal();
if (typeof iniciarRelojLimpieza === 'function') iniciarRelojLimpieza();
updateImage();
window.addEventListener('resize', () => { updateImage(); recalcularTodasLasFiguras(); });
window.addEventListener('orientationchange', updateImage);
document.addEventListener('visibilitychange', function () {
    if (!document.hidden && typeof verificarTiempoTranscurrido === 'function') verificarTiempoTranscurrido();
});
