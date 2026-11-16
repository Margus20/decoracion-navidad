// ============ LISTA DE LOS 8 PERSONAJES ============
const personajes = [
    { id: 'maria', nombre: 'María', avatar: 'img/belen/mary_avatar.jpg', png: 'img/belen/mary.png' },
    { id: 'jose', nombre: 'José', avatar: 'img/belen/joseph_avatar.jpg', png: 'img/belen/joseph.png' },
    { id: 'jesus', nombre: 'el Niño Jesús', avatar: 'img/belen/baby_jesus_avatar.jpg', png: 'img/belen/baby_jesus.png' },
    { id: 'estrella', nombre: 'la Estrella', avatar: 'img/belen/star_avatar.jpg', png: 'img/belen/star.png' },
    { id: 'oveja', nombre: 'la Oveja', avatar: 'img/belen/sheep_avatar.jpg', png: 'img/belen/sheep.png' },
    { id: 'burro', nombre: 'el Burro', avatar: 'img/belen/donkey_avatar.jpg', png: 'img/belen/donkey.png' },
    { id: 'pesebre', nombre: 'el Pesebre', avatar: 'img/belen/hovel_avatar.jpg', png: 'img/belen/hovel.png' },
    { id: 'cuna', nombre: 'la Cuna', avatar: 'img/belen/crib_avatar.jpg', png: 'img/belen/crib.png' }
];

const idsNecesarios = ['maria', 'jose', 'jesus', 'estrella', 'pesebre', 'cuna', 'oveja', 'burro'];

// ============ REFERENCIAS AL DOM ============
const panelAvatars = document.getElementById('panelAvatars');
const zonaFiguras = document.getElementById('zonaFiguras');
const panelControles = document.getElementById('panelControles');
const sliderX = document.getElementById('sliderX');
const sliderY = document.getElementById('sliderY');
const sliderZoom = document.getElementById('sliderZoom');
const sliderGiro = document.getElementById('sliderGiro');
const btnVoltear = document.getElementById('btnVoltear');
const btnDuplicar = document.getElementById('btnDuplicar');
const btnCapas = document.getElementById('btnCapas');
const btnQuitar = document.getElementById('btnQuitar');
const barraGeneral = document.getElementById('barraGeneral');
const contenedorBarraInd = document.getElementById('contenedorBarraIndividual');
const barraIndividual = document.getElementById('barraIndividual');
const textoBarraInd = document.getElementById('textoBarraIndividual');
const modalCapas = document.getElementById('modalCapas');
const listaCapas = document.getElementById('listaCapas');
const btnCerrarCapas = document.getElementById('btnCerrarCapas');

let piezaActiva = null;
let contadorCopias = 1;
let celebracionActivada = false;
const UMBRAL_CELEBRACION = 85;

// ============ RELOJ DE MEMORIA TEMPORAL (1 hora) ============
const TIEMPO_LIMITE_MS = 60 * 60 * 1000; // 1 hora en milisegundos
let tiempoInicio = Date.now();
let temporizadorLimpieza = null;

function iniciarRelojLimpieza() {
    temporizadorLimpieza = setTimeout(() => {
        limpiarEscenaAutomaticamente();
    }, TIEMPO_LIMITE_MS);
}

function verificarTiempoTranscurrido() {
    if (Date.now() - tiempoInicio >= TIEMPO_LIMITE_MS) {
        limpiarEscenaAutomaticamente();
        return true;
    }
    return false;
}

function limpiarEscenaAutomaticamente() {
    zonaFiguras.innerHTML = '';
    piezaActiva = null;
    celebracionActivada = false;
    contadorCopias = 1;
    panelControles.classList.remove('visible');
    contenedorBarraInd.style.display = 'none';
    document.body.classList.remove('celebracion-activa');
    barraGeneral.style.width = '0%';
    barraGeneral.className = 'barra-relleno nivel-bajo';
    document.querySelectorAll('.avatar-btn').forEach(btn => btn.classList.remove('activo'));
    tiempoInicio = Date.now();
    if (temporizadorLimpieza) clearTimeout(temporizadorLimpieza);
    iniciarRelojLimpieza();
}

iniciarRelojLimpieza();
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) verificarTiempoTranscurrido();
});

// ============ 1. IMAGEN DEL ESCENARIO ============
function updateImage() {
    const stageImage = document.getElementById('stageImage');
    stageImage.src = window.innerHeight > window.innerWidth ? 'img/belen/vertical_stage.jpg' : 'img/belen/horizontal_stage.jpg';
}
updateImage();
window.addEventListener('resize', () => { updateImage(); recalcularTodasLasFiguras(); });
window.addEventListener('orientationchange', updateImage);

// ============ 2. ESTADO Y TRANSFORMACIÓN ============
function leerEstado(el) {
    return {
        x: parseFloat(el.dataset.x) || 50,
        y: parseFloat(el.dataset.y) || 50,
        zoom: parseFloat(el.dataset.zoom) || 100,
        giro: parseFloat(el.dataset.giro) || 0,
        volteada: el.dataset.volteada === 'true'
    };
}

function aplicarTransform(el) {
    const s = leerEstado(el);
    el.style.left = (s.x / 100 * window.innerWidth) + 'px';
    el.style.top = (s.y / 100 * window.innerHeight) + 'px';
    const flip = s.volteada ? ' scaleX(-1)' : '';
    el.style.transform = 'translate(-50%, -50%) rotate(' + s.giro + 'deg) scale(' + (s.zoom / 100) + ')' + flip;
}

function refrescarSliders(el) {
    const s = leerEstado(el);
    sliderX.value = s.x;
    sliderY.value = s.y;
    sliderZoom.value = s.zoom;
    sliderGiro.value = s.giro;
}

// ============ 3. GEOMETRÍA DE AYUDA (Para evaluación flexible) ============
function centro(el) {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}
function centroY(el) { return centro(el).y; }
function distPct(a, b) {
    const ca = centro(a), cb = centro(b);
    const d = Math.hypot(ca.x - cb.x, ca.y - cb.y);
    const diag = Math.hypot(window.innerWidth, window.innerHeight);
    return d / diag * 100;
}
function cerca(a, b, umbral) { return distPct(a, b) <= umbral; }
function zindex(el) { return parseInt(el.style.zIndex) || 100; }

function obtenerMapa() {
    const m = {};
    idsNecesarios.forEach(id => {
        const el = document.querySelector('.figura-activa[data-personaje="' + id + '"]');
        if (el) m[id] = el;
    });
    return m;
}

// ============ 4. CRITERIOS DE COHERENCIA (suman 100 puntos) ============
const criterios = [
    { id: 'completitud', peso: 12, eval: (m) => {
        const presentes = idsNecesarios.filter(id => m[id]).length;
        return presentes / idsNecesarios.length;
    }},
    { id: 'jesus_cuna', peso: 12, eval: (m) => {
        if (!m.jesus || !m.cuna) return 0;
        if (cerca(m.jesus, m.cuna, 16)) return 1;
        if (cerca(m.jesus, m.cuna, 30)) return 0.5;
        return 0;
    }},
    { id: 'cuna_pesebre', peso: 12, eval: (m) => {
        if (!m.cuna || !m.pesebre) return 0;
        if (cerca(m.cuna, m.pesebre, 18)) return 1;
        if (cerca(m.cuna, m.pesebre, 32)) return 0.5;
        return 0;
    }},
    { id: 'estrella_arriba', peso: 10, eval: (m) => {
        if (!m.estrella || !m.pesebre) return 0;
        const e = centroY(m.estrella), p = centroY(m.pesebre);
        if (e < p) return 1;
        if (e < p + 60) return 0.5;
        return 0;
    }},
    { id: 'maria_pesebre', peso: 10, eval: (m) => {
        if (!m.maria || !m.pesebre) return 0;
        if (cerca(m.maria, m.pesebre, 24)) return 1;
        if (cerca(m.maria, m.pesebre, 38)) return 0.6;
        return 0;
    }},
    { id: 'jose_pesebre', peso: 10, eval: (m) => {
        if (!m.jose || !m.pesebre) return 0;
        if (cerca(m.jose, m.pesebre, 24)) return 1;
        if (cerca(m.jose, m.pesebre, 38)) return 0.6;
        return 0;
    }},
    { id: 'oveja_suelo', peso: 8, eval: (m) => {
        if (!m.oveja || !m.pesebre) return 0;
        const enSuelo = centroY(m.oveja) > centroY(m.pesebre);
        const cerca = distPct(m.oveja, m.pesebre) <= 34;
        if (enSuelo && cerca) return 1;
        if (enSuelo) return 0.5;
        return 0;
    }},
    { id: 'burro_suelo', peso: 8, eval: (m) => {
        if (!m.burro || !m.pesebre) return 0;
        const enSuelo = centroY(m.burro) > centroY(m.pesebre);
        const cerca = distPct(m.burro, m.pesebre) <= 34;
        if (enSuelo && cerca) return 1;
        if (enSuelo) return 0.5;
        return 0;
    }},
    { id: 'capas', peso: 16, eval: (m) => {
        if (!m.jesus || !m.cuna || !m.pesebre) return 0;
        let pts = 0;
        if (zindex(m.jesus) >= zindex(m.cuna)) pts += 0.5;
        if (zindex(m.cuna) >= zindex(m.pesebre)) pts += 0.5;
        return pts;
    }}
];

const criteriosPorPieza = {
    jesus: ['completitud', 'jesus_cuna', 'capas'],
    cuna: ['completitud', 'jesus_cuna', 'cuna_pesebre', 'capas'],
    pesebre: ['completitud', 'cuna_pesebre', 'estrella_arriba', 'maria_pesebre', 'jose_pesebre', 'oveja_suelo', 'burro_suelo', 'capas'],
    estrella: ['completitud', 'estrella_arriba'],
    maria: ['completitud', 'maria_pesebre'],
    jose: ['completitud', 'jose_pesebre'],
    oveja: ['completitud', 'oveja_suelo'],
    burro: ['completitud', 'burro_suelo']
};

function calcularScoreGeneral() {
    const m = obtenerMapa();
    let total = 0;
    criterios.forEach(c => { total += c.peso * c.eval(m); });
    return total;
}

function calcularScoreIndividual(el) {
    const m = obtenerMapa();
    const idP = el.dataset.personaje;
    const ids = criteriosPorPieza[idP] || ['completitud'];
    let obtenido = 0, maximo = 0;
    criterios.forEach(c => {
        if (ids.includes(c.id)) {
            obtenido += c.peso * c.eval(m);
            maximo += c.peso;
        }
    });
    if (maximo === 0) return 0;
    return (obtenido / maximo) * 100;
}

// ============ 5. SELECCIÓN Y BARRA INDIVIDUAL ============
function seleccionarPieza(el) {
    if (piezaActiva === el) return;
    if (piezaActiva) piezaActiva.classList.remove('seleccionada');
    piezaActiva = el;
    el.classList.add('seleccionada');
    panelControles.classList.add('visible');
    contenedorBarraInd.style.display = 'flex';
    textoBarraInd.textContent = 'Ubicación de: ' + el.alt;
    refrescarSliders(el);
    actualizarBarraIndividual(el);
}

function deseleccionar() {
    if (piezaActiva) {
        piezaActiva.classList.remove('seleccionada');
        piezaActiva = null;
    }
    panelControles.classList.remove('visible');
    contenedorBarraInd.style.display = 'none';
}

function actualizarBarraIndividual(el) {
    const pct = calcularScoreIndividual(el);
    barraIndividual.style.width = pct + '%';
    if (pct < 40) barraIndividual.className = 'barra-relleno nivel-bajo';
    else if (pct < 80) barraIndividual.className = 'barra-relleno nivel-medio';
    else barraIndividual.className = 'barra-relleno nivel-alto';
}

// ============ 6. BARRA GENERAL Y CELEBRACIÓN (CON CANDADO DE 8 PIEZAS) ============
function actualizarProgresoGeneral() {
    const score = calcularScoreGeneral();
    barraGeneral.style.width = score + '%';
    if (score < 25) barraGeneral.className = 'barra-relleno nivel-bajo';
    else if (score < 75) barraGeneral.className = 'barra-relleno nivel-medio';
    else barraGeneral.className = 'barra-relleno nivel-alto';

    // CANDADO ESTRICTO: Debe haber exactamente 8 piezas y ninguna repetida
    const figuras = document.querySelectorAll('.figura-activa');
    const hayOchoPiezas = figuras.length === 8;
    const todasUnicas = idsNecesarios.every(id => 
        figuras.filter(f => f.dataset.personaje === id).length === 1
    );
    
    const listoParaFestejo = score >= UMBRAL_CELEBRACION && hayOchoPiezas && todasUnicas;

    if (listoParaFestejo && !celebracionActivada) {
        activarCelebracion();
    } else if (!listoParaFestejo && celebracionActivada) {
        desactivarCelebracion();
    }
}

function activarCelebracion() {
    celebracionActivada = true;
    document.body.classList.add('celebracion-activa');
    generarChispas();
}

function desactivarCelebracion() {
    celebracionActivada = false;
    document.body.classList.remove('celebracion-activa');
}

// ============ 7. CHISPAS MULTIDIRECCIONALES ============
function generarChispas() {
    const simbolos = ['✨', '🌟', '❄️', '⭐', '🎉', '🎊'];
    const direcciones = ['cae', 'sube', 'derecha', 'izquierda', 'diag1', 'diag2', 'diag3', 'diag4'];
    const totalChispas = 80;

    for (let i = 0; i < totalChispas; i++) {
        setTimeout(() => {
            const dir = direcciones[Math.floor(Math.random() * direcciones.length)];
            const chispa = document.createElement('div');
            chispa.className = 'chispa ' + dir;
            chispa.textContent = simbolos[Math.floor(Math.random() * simbolos.length)];

            const dur = (Math.random() * 2 + 2.5) + 's';
            chispa.style.animationDuration = dur;

            // Posición inicial según la dirección elegida
            if (dir === 'cae') {
                chispa.style.left = (Math.random() * 100) + 'vw';
                chispa.style.top = '-8vh';
            } else if (dir === 'sube') {
                chispa.style.left = (Math.random() * 100) + 'vw';
                chispa.style.top = '108vh';
            } else if (dir === 'derecha') {
                chispa.style.top = (Math.random() * 100) + 'vh';
                chispa.style.left = '-8vw';
            } else if (dir === 'izquierda') {
                chispa.style.top = (Math.random() * 100) + 'vh';
                chispa.style.left = '108vw';
            } else if (dir === 'diag1') { // abajo-izq -> arriba-der
                chispa.style.left = '-8vw';
                chispa.style.top = '108vh';
            } else if (dir === 'diag2') { // abajo-der -> arriba-izq
                chispa.style.left = '108vw';
                chispa.style.top = '108vh';
            } else if (dir === 'diag3') { // arriba-izq -> abajo-der
                chispa.style.left = '-8vw';
                chispa.style.top = '-8vh';
            } else if (dir === 'diag4') { // arriba-der -> abajo-izq
                chispa.style.left = '108vw';
                chispa.style.top = '-8vh';
            }

            document.body.appendChild(chispa);
            setTimeout(() => chispa.remove(), 5000);
        }, i * 50);
    }
}

// ============ 8. CREAR FIGURA ============
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

// ============ 9. BOTONES AVATAR ============
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

// ============ 10. ARRASTRAR CON DEDO O MOUSE ============
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

// ============ 11. SLIDERS Y BOTONES DE CONTROL ============
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
        const person
