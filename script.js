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

// ============ ZONAS INVISIBLES (x, y en porcentaje, radio de tolerancia) ============
const zonas = {
    estrella: { x: 50, y: 15, radio: 15 },
    jose: { x: 25, y: 55, radio: 15 },
    maria: { x: 75, y: 60, radio: 15 },
    pesebre: { x: 50, y: 65, radio: 15 },
    cuna: { x: 50, y: 70, radio: 12 },
    jesus: { x: 50, y: 70, radio: 10 },
    burro: { x: 20, y: 85, radio: 15 },
    oveja: { x: 80, y: 85, radio: 15 }
};

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

// ============ 1. IMAGEN DEL ESCENARIO SEGÚN ORIENTACIÓN ============
function updateImage() {
    const stageImage = document.getElementById('stageImage');
    stageImage.src = window.innerHeight > window.innerWidth ? 'img/belen/vertical_stage.jpg' : 'img/belen/horizontal_stage.jpg';
}
updateImage();
window.addEventListener('resize', () => { updateImage(); recalcularTodasLasFiguras(); });
window.addEventListener('orientationchange', updateImage);

// ============ 2. UTILIDADES DE ESTADO Y TRANSFORMACIÓN ============
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
    const w = window.innerWidth;
    const h = window.innerHeight;
    const elW = el.offsetWidth || 90;
    const elH = el.offsetHeight || 90;

    // CORRECCIÓN CLAVE: El porcentaje ahora representa el CENTRO de la figura
    const leftPx = (s.x / 100 * w) - (elW / 2);
    const topPx = (s.y / 100 * h) - (elH / 2);

    el.style.left = leftPx + 'px';
    el.style.top = topPx + 'px';
    const flip = s.volteada ? ' scaleX(-1)' : '';
    el.style.transform = 'rotate(' + s.giro + 'deg) scale(' + (s.zoom / 100) + ')' + flip;
}

function refrescarSliders(el) {
    const s = leerEstado(el);
    sliderX.value = s.x;
    sliderY.value = s.y;
    sliderZoom.value = s.zoom;
    sliderGiro.value = s.giro;
}

// ============ 3. SELECCIÓN Y PROGRESO INDIVIDUAL ============
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

function calcularProgresoPieza(el) {
    const id = el.dataset.personaje;
    const zona = zonas[id];
    if (!zona) return 100;

    const rect = el.getBoundingClientRect();
    const elCx = rect.left + rect.width / 2;
    const elCy = rect.top + rect.height / 2;
    const zonaCx = (zona.x / 100) * window.innerWidth;
    const zonaCy = (zona.y / 100) * window.innerHeight;

    const distPx = Math.sqrt(Math.pow(elCx - zonaCx, 2) + Math.pow(elCy - zonaCy, 2));
    const maxDistPx = (zona.radio / 100) * Math.min(window.innerWidth, window.innerHeight);
    
    let porcentaje = Math.max(0, 100 - (distPx / maxDistPx) * 100);
    return Math.min(100, porcentaje);
}

function actualizarBarraIndividual(el) {
    const pct = calcularProgresoPieza(el);
    barraIndividual.style.width = pct + '%';
    if (pct < 30) barraIndividual.className = 'barra-relleno nivel-bajo';
    else if (pct < 80) barraIndividual.className = 'barra-relleno nivel-medio';
    else barraIndividual.className = 'barra-relleno nivel-alto';
}

// ============ 4. PROGRESO GENERAL Y CELEBRACIÓN ============
function actualizarProgresoGeneral() {
    const figuras = document.querySelectorAll('.figura-activa');
    let correctas = 0;
    const totalEsperado = 8;

    figuras.forEach(f => {
        if (calcularProgresoPieza(f) >= 80) correctas++;
    });

    const pctGeneral = (correctas / totalEsperado) * 100;
    barraGeneral.style.width = pctGeneral + '%';

    if (pctGeneral < 25) barraGeneral.className = 'barra-relleno nivel-bajo';
    else if (pctGeneral < 75) barraGeneral.className = 'barra-relleno nivel-medio';
    else barraGeneral.className = 'barra-relleno nivel-alto';

    if (correctas === totalEsperado && !celebracionActivada) {
        activarCelebracion();
    } else if (correctas < totalEsperado && celebracionActivada) {
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

function generarChispas() {
    const simbolos = ['✨', '🌟', '❄️', '⭐'];
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const chispa = document.createElement('div');
            chispa.className = 'chispa';
            chispa.textContent = simbolos[Math.floor(Math.random() * simbolos.length)];
            chispa.style.left = Math.random() * 100 + 'vw';
            chispa.style.animationDuration = (Math.random() * 2 + 2) + 's';
            document.body.appendChild(chispa);
            setTimeout(() => chispa.remove(), 4000);
        }, i * 80);
    }
}

// ============ 5. CREAR FIGURA ============
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
    const figurasExistentes = document.querySelectorAll('.figura-activa[data-personaje="' + idPersonaje + '"]');
    btn.classList.toggle('activo', figurasExistentes.length > 0);
}

// ============ 6. BOTONES AVATAR ============
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
        const figurasExistentes = document.querySelectorAll('.figura-activa[data-personaje="' + personaje.id + '"]');
        if (figurasExistentes.length > 0) {
            const figuraAQuitar = (piezaActiva && piezaActiva.dataset.personaje === personaje.id) ? piezaActiva : figurasExistentes[figurasExistentes.length - 1];
            if (confirm('¿Seguro que quieres quitar ' + personaje.nombre + ' de la escena?')) {
                if (piezaActiva === figuraAQuitar) deseleccionar();
                figuraAQuitar.remove();
                actualizarEstadoAvatar(personaje.id);
                actualizarProgresoGeneral();
            }
        } else {
            crearFigura(personaje);
        }
        if (modalCapas.classList.contains('visible')) renderizarCapas();
    });
});

// ============ 7. ARRASTRAR (Sincronizado con sliders) ============
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

// ============ 8. CONTROLES DESLIZANTES Y BOTONES ============
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
            img.dataset.volteada = s.volteada;
            
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
        const personaje = personajes.find(p => p.id === idP);
        if (confirm('¿Seguro que quieres quitar ' + (personaje ? personaje.nombre : 'esta pieza') + '?')) {
            const el = piezaActiva;
            piezaActiva = null;
            el.remove();
            panelControles.classList.remove('visible');
            contenedorBarraInd.style.display = 'none';
            actualizarEstadoAvatar(idP);
            actualizarProgresoGeneral();
        }
    }
});

// ============ 9. MODAL DE CAPAS ============
function renderizarCapas() {
    listaCapas.innerHTML = '';
    const figuras = Array.from(document.querySelectorAll('.figura-activa')).sort((a, b) => {
        return parseInt(b.style.zIndex || 100) - parseInt(a.style.zIndex || 100);
    });

    figuras.forEach((fig, index) => {
        const item = document.createElement('div');
        item.className = 'item-capa';
        item.innerHTML = `
            <span>${index + 1}. ${fig.alt}</span>
            <div>
                <button class="btn-capa" onclick="cambiarCapa('${fig.id}', 1)">⬆</button>
                <button class="btn-capa" onclick="cambiarCapa('${fig.id}', -1)">⬇</button>
            </div>
        `;
        listaCapas.appendChild(item);
    });
}

window.cambiarCapa = function(id, direccion) {
    const el = document.getElementById(id);
    if (!el) return;
    let z = parseInt(el.style.zIndex || 100);
    el.style.zIndex = z + (direccion * 10);
    renderizarCapas();
};

btnCapas.addEventListener('click', () => { renderizarCapas(); modalCapas.classList.add('visible'); });
btnCerrarCapas.addEventListener('click', () => { modalCapas.classList.remove('visible'); });
modalCapas.addEventListener('click', (e) => { if (e.target === modalCapas) modalCapas.classList.remove('visible'); });

// ============ 10. DESELECCIONAR AL TOCAR FONDO ============
document.querySelector('.escena-overlay').addEventListener('click', function (e) {
    if (e.target === this || e.target === zonaFiguras) deseleccionar();
});

function recalcularTodasLasFiguras() {
    document.querySelectorAll('.figura-activa').forEach(f => aplicarTransform(f));
                          }
