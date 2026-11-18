// ============ DATOS DEL ÁRBOL DE NAVIDAD (arbol-datos.js) ============

// ============ LISTA DE LOS 8 PERSONAJES ============
const personajes = [
    { id: 'arbol', nombre: 'el Árbol', avatar: 'img/arbol/arbol_avatar.jpg', png: 'img/arbol/arbol.png' },
    { id: 'bambalina', nombre: 'la Bambalina', avatar: 'img/arbol/bambalina_avatar.jpg', png: 'img/arbol/bambalina.png' },
    { id: 'baston', nombre: 'el Bastón', avatar: 'img/arbol/baston_avatar.jpg', png: 'img/arbol/baston.png' },
    { id: 'bombilla', nombre: 'la Bombilla', avatar: 'img/arbol/bombilla_avatar.jpg', png: 'img/arbol/bombilla.png' },
    { id: 'cascanuez', nombre: 'el Cascanueces', avatar: 'img/arbol/cascanuez_avatar.jpg', png: 'img/arbol/cascanuez.png' },
    { id: 'estrella', nombre: 'la Estrella', avatar: 'img/arbol/estrella_avatar.jpg', png: 'img/arbol/estrella.png' },
    { id: 'lazo', nombre: 'el Lazo', avatar: 'img/arbol/lazo_avatar.jpg', png: 'img/arbol/lazo.png' },
    { id: 'osito', nombre: 'el Osito', avatar: 'img/arbol/osito_avatar.jpg', png: 'img/arbol/osito.png' }
];

const idsNecesarios = ['arbol', 'bambalina', 'baston', 'bombilla', 'cascanuez', 'estrella', 'lazo', 'osito'];

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
const modalCapas = document.getElementById('modalCapas');
const listaCapas = document.getElementById('listaCapas');
const btnCerrarCapas = document.getElementById('btnCerrarCapas');
// (Se eliminaron las referencias a la barra individual que ya no usamos)

// ============ ESTADO GLOBAL ============
let piezaActiva = null;
let contadorCopias = 1;
let celebracionActivada = false;

// Umbral de celebración: 100 puntos para activar chispas y color
const UMBRAL_CELEBRACION = 100;

// ============ RELOJ DE MEMORIA TEMPORAL (Respaldo de 1 hora) ============
// Limpia la escena si la pestaña se deja abierta indefinidamente, 
// independiente de los relojes de juego (8 min / 45 seg).
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
    document.body.classList.remove('celebracion-activa');
    barraGeneral.style.width = '0%';
    barraGeneral.className = 'barra-relleno nivel-bajo';
    document.querySelectorAll('.avatar-btn').forEach(btn => btn.classList.remove('activo'));
    
    tiempoInicio = Date.now();
    if (temporizadorLimpieza) clearTimeout(temporizadorLimpieza);
    iniciarRelojLimpieza();
}
