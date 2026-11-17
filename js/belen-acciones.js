// ============ VARIABLES DE TIEMPO Y ESTADO ============
let tiempoGlobalRestante = 8 * 60; // 8 minutos en segundos
let tiempoFinalRestante = 45; // 45 segundos
let intervaloGlobal = null;
let intervaloFinal = null;
let juegoTerminado = false;

// ============ 1. RELOJES DEL JUEGO ============
function iniciarRelojGlobal() {
    actualizarDisplayReloj('relojGlobalNumero', tiempoGlobalRestante);
    intervaloGlobal = setInterval(() => {
        tiempoGlobalRestante--;
        actualizarDisplayReloj('relojGlobalNumero', tiempoGlobalRestante);
        if (tiempoGlobalRestante <= 0) {
            terminarJuego();
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
            terminarJuego();
        }
    }, 1000);
}

function actualizarDisplayReloj(idElemento, segundos) {
    const m = Math.floor(segundos / 60).toString().padStart(2, '0');
    const s = (segundos % 60).toString().padStart(2, '0');
    document.getElementById(idElemento).textContent = `${m}:${s}`;
}

function verificarInicioRelojFinal() {
    if (juegoTerminado) return;
    const figuras = document.querySelectorAll('.figura-activa');
    const hayOchoPiezas = figuras.length === 8;
    const todasUnicas = idsNecesarios.every(id => figuras.filter(f => f.dataset.personaje === id).length === 1);
    
    if (hayOchoPiezas && todasUnicas && !intervaloFinal) {
        iniciarRelojFinal();
    }
}

function terminarJuego() {
    if (juegoTerminado) return;
    juegoTerminado = true;
    clearInterval(intervaloGlobal);
    clearInterval(intervaloFinal);
    
    // Congelar visualmente la escena
    document.body.classList.add('juego-congelado');
    document.getElementById('relojGlobal').classList.add('agotado');
    document.getElementById('relojFinal').classList.add('agotado');
    
    // Llamar a la función de evaluación que está en belen-logica.js
    if (typeof mostrarResultadoFinal === 'function') {
        mostrarResultadoFinal(calcularScoreGeneral());
    }
}

// ============ 2. TABLA DE HONOR LOCAL ============
function guardarEnTablaHonor(nombre, puntaje) {
    let tabla = JSON.parse(localStorage.getItem('belenTablaHonor')) || [];
    const fecha = new Date().toLocaleDateString('es-VE');
    tabla.push({ nombre: nombre || 'Anónimo', puntaje: Math.round(puntaje), fecha });
    tabla.sort((a, b) => b.puntaje - a.puntaje);
    tabla = tabla.slice(0, 10); // Guardar solo el Top 10
    localStorage.setItem('belenTablaHonor', JSON.stringify(tabla));
}

function mostrarTablaHonor() {
    const tabla = JSON.parse(localStorage.getItem('belenTablaHonor')) || [];
    const lista = document.getElementById('listaHonor');
    lista.innerHTML = '';
    
    if (tabla.length === 0) {
        lista.innerHTML = '<div class="item-honor vacio">Aún no hay registros. ¡Sé el primero!</div>';
    } else {
        tabla.forEach((item, index) => {
            const div = document.createElement('div');
            div.className = 'item-honor';
            div.innerHTML = `
                <span class="puesto">#${index + 1}</span>
                <span class="nombre">${item.nombre}</span>
                <span class="puntaje">${item.puntaje} pts</span>
            `;
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
    actualizarProgresoGeneral();
    verificarInicioRelojFinal();
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
        if (juegoTerminado) return; // No permitir cambios si el juego terminó
        
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

// ============ 5. ARRASTRAR CON DEDO O MOUSE ============
function hacerArrastrable(elemento) {
    let arrastrando = false;
    let startX = 0, startY = 0, initX = 0, initY = 0;

    function inicio(e) {
        if (juegoTerminado) return;
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
        if (!arrastrando || juegoTerminado) return;
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

    function fin() {
        if (arrastrando) {
            arrastrando = false;
            verificarInicioRelojFinal();
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

// ============ 6. SLIDERS Y BOTONES DE CONTROL ============
sliderX.addEventListener('input', function () {
    if (piezaActiva && !juegoTerminado) { piezaActiva.dataset.x = this.value; aplicarTransform(piezaActiva); actualizarBarraIndividual(piezaActiva); actualizarProgresoGeneral(); }
});
sliderY.addEventListener('input', function () {
    if (piezaActiva && !juegoTerminado) { piezaActiva.dataset.y = this.value; aplicarTransform(piezaActiva); actualizarBarraIndividual(piezaActiva); actualizarProgresoGeneral(); }
});
sliderZoom.addEventListener('input', function () {
    if (piezaActiva && !juegoTerminado) { piezaActiva.dataset.zoom = this.value; aplicarTransform(piezaActiva); }
});
sliderGiro.addEventListener('input', function () {
    if (piezaActiva && !juegoTerminado) { piezaActiva.dataset.giro = this.value; aplicarTransform(piezaActiva); }
});

// Al soltar cualquier barra, re-evaluamos por si acaso
sliderX.addEventListener('change', function () { if (!juegoTerminado) verificarInicioRelojFinal(); });
sliderY.addEventListener('change', function () { if (!juegoTerminado) verificarInicioRelojFinal(); });
sliderZoom.addEventListener('change', function () { if (!juegoTerminado) verificarInicioRelojFinal(); });
sliderGiro.addEventListener('change', function () { if (!juegoTerminado) verificarInicioRelojFinal(); });

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
            actualizarProgresoGeneral();
            verificarInicioRelojFinal();
        }
    }
});

btnQuitar.addEventListener('click', function () {
    if (piezaActiva && !juegoTerminado) {
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
            verificarInicioRelojFinal();
        }
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
    verificarInicioRelojFinal();
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

// ============ 9. GESTIÓN DEL MODAL DE RESULTADO Y TABLA DE HONOR ============
const btnGuardarNombre = document.getElementById('btnGuardarNombre');
if (btnGuardarNombre) {
    btnGuardarNombre.addEventListener('click', function() {
        const inputNombre = document.getElementById('inputNombre');
        const nombre = inputNombre.value.trim() || 'Anónimo';
        const puntaje = calcularScoreGeneral();
        
        guardarEnTablaHonor(nombre, puntaje);
        
        document.getElementById('campoNombre').style.display = 'none';
        document.getElementById('btnCerrarResultado').style.display = 'inline-block';
        
        // Mostrar la tabla de honor automáticamente después de guardar
        mostrarTablaHonor();
    });
}

const btnCerrarResultado = document.getElementById('btnCerrarResultado');
if (btnCerrarResultado) {
    btnCerrarResultado.addEventListener('click', function() {
        document.getElementById('modalResultado').classList.remove('visible');
    });
}

const btnHonor = document.getElementById('btnHonor');
if (btnHonor) {
    btnHonor.addEventListener('click', function() {
        mostrarTablaHonor();
    });
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

// ============ 10. INICIALIZACIÓN ============
iniciarRelojGlobal();
iniciarRelojLimpieza(); // El reloj de 1 hora de limpieza de memoria que ya teníamos
updateImage();
window.addEventListener('resize', () => { updateImage(); recalcularTodasLasFiguras(); });
window.addEventListener('orientationchange', updateImage);
document.addEventListener('visibilitychange', function () {
    if (!document.hidden) verificarTiempoTranscurrido();
});
