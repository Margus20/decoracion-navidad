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
// (Eliminada la referencia a btnLimpiar ya que se quitó del HTML)

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
const UMBRAL_CELEBRACION = 85; // Puntuación mínima para la celebración

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

// ============ 3. GEOMETRÍA DE AYUDA PARA EVALUACIÓN FLEXIBLE ============
function centro(el) {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}
function centroY(el) { return centro(el).y; }
function distPct(a, b) {
    const ca = centro(a), cb = centro
