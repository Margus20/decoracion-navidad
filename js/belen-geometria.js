// ============ GEOMETRÍA Y ESTADO (belen-geometria.js) ============
const MARGEN_LADO = 0.25;

function updateImage() {
    const stageImage = document.getElementById('stageImage');
    stageImage.src = window.innerHeight > window.innerWidth ? 'img/belen/vertical_stage.jpg' : 'img/belen/horizontal_stage.jpg';
}

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
    el.style.transform = `translate(-50%, -50%) rotate(${s.giro}deg) scale(${s.zoom / 100})${flip}`;
}

function refrescarSliders(el) {
    const s = leerEstado(el);
    sliderX.value = s.x; sliderY.value = s.y;
    sliderZoom.value = s.zoom; sliderGiro.value = s.giro;
    const inputX = document.getElementById('inputX');
    const inputY = document.getElementById('inputY');
    const inputZoom = document.getElementById('inputZoom');
    const inputGiro = document.getElementById('inputGiro');
    if (inputX) inputX.value = s.x;
    if (inputY) inputY.value = s.y;
    if (inputZoom) inputZoom.value = s.zoom;
    if (inputGiro) inputGiro.value = s.giro;
}

function centro(el) {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}
function centroY(el) { return centro(el).y; }
function anchoPx(el) { return el.getBoundingClientRect().width; }

function distPct(a, b) {
    const ca = centro(a), cb = centro(b);
    const d = Math.hypot(ca.x - cb.x, ca.y - cb.y);
    const diag = Math.hypot(window.innerWidth, window.innerHeight);
    return (d / diag) * 100;
}
function cerca(a, b, umbral) { return distPct(a, b) <= umbral; }
function zindex(el) { return parseInt(el.style.zIndex) || 100; }

function dentroDe(a, b) {
    const ca = centro(a);
    const rb = b.getBoundingClientRect();
    const margen = 12;
    return ca.x >= rb.left - margen && ca.x <= rb.right + margen &&
           ca.y >= rb.top - margen && ca.y <= rb.bottom + margen;
}

function centroDentroDe(a, b) {
    const ca = centro(a);
    const rb = b.getBoundingClientRect();
    return ca.x >= rb.left && ca.x <= rb.right && ca.y >= rb.top && ca.y <= rb.bottom;
}

function obtenerMapa() {
    const m = {};
    idsNecesarios.forEach(id => {
        const el = document.querySelector(`.figura-activa[data-personaje="${id}"]`);
        if (el) m[id] = el;
    });
    return m;
}

// Orientación: naturalIzquierda = true (María, José, Oveja) | false (Burro)
function orientacionCorrecta(figuraEl, pesebreEl, naturalIzquierda) {
    if (!figuraEl || !pesebreEl) return true;
    const estaVolteada = figuraEl.dataset.volteada === 'true';
    const estaALaIzquierda = centro(figuraEl).x < centro(pesebreEl).x;
    const debeMirarIzquierda = !estaALaIzquierda;
    let miraIzquierda = naturalIzquierda ? !estaVolteada : estaVolteada;
    return miraIzquierda === debeMirarIzquierda;
}

function ladoAnimalOk(m, animalEl) {
    if (!m.pesebre || !m.oveja || !m.burro || !m.maria || !m.jose) return true;
    const mariaADerecha = centro(m.maria).x > centro(m.pesebre).x;
    const figuraDerecha = mariaADerecha ? m.maria : m.jose;
    const figuraIzquierda = mariaADerecha ? m.jose : m.maria;
    const ladoO = centro(m.oveja).x > centro(m.pesebre).x ? 1 : -1;
    const ladoB = centro(m.burro).x > centro(m.pesebre).x ? 1 : -1;
    if (ladoO === ladoB) return false;
    const ladoActual = centro(animalEl).x > centro(m.pesebre).x ? 1 : -1;
    if (ladoActual === 1) {
        return centro(animalEl).x >= centro(figuraDerecha).x + (anchoPx(figuraDerecha) * MARGEN_LADO);
    } else {
        return centro(animalEl).x <= centro(figuraIzquierda).x - (anchoPx(figuraIzquierda) * MARGEN_LADO);
    }
}
