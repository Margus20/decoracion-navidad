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

// ============ ESTADO GLOBAL ============
let piezaActiva = null;
let contadorCopias = 1;
let celebracionActivada = false;
const UMBRAL_CELEBRACION = 85;

// ============ RELOJ DE MEMORIA TEMPORAL (1 hora) ============
const TIEMPO_LIMITE_MS = 60 * 60 * 1000;
let tiempoInicio = Date.now();
let temporizadorLimpieza = null;

function iniciarRelojLimpieza() {
    temporizadorLimpieza = setTimeout(() => { limpiarEscenaAutomaticamente(); }, TIEMPO_LIMITE_MS);
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
