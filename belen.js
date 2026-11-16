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

const panelAvatars = document.getElementById('panelAvatars');
const zonaFiguras = document.getElementById('zonaFiguras');

// ============ NUEVO: Referencias al Panel de Controles ============
const panelControles = document.getElementById('panelControles');
const sliderX = document.getElementById('sliderX');
const sliderY = document.getElementById('sliderY');
const sliderZoom = document.getElementById('sliderZoom');
const sliderGiro = document.getElementById('sliderGiro');
const btnVoltear = document.getElementById('btnVoltear');
const btnDuplicar = document.getElementById('btnDuplicar');
const btnQuitar = document.getElementById('btnQuitar');

// ============ NUEVO: Estado de selección (solo una pieza a la vez) ============
let piezaActiva = null;
let contadorCopias = 1;

// ============ 1. IMAGEN DEL ESCENARIO SEGÚN ORIENTACIÓN ============
function updateImage() {
    const stageImage = document.getElementById('stageImage');
    if (window.innerHeight > window.innerWidth) {
        stageImage.src = 'img/belen/vertical_stage.jpg';
    } else {
        stageImage.src = 'img/belen/horizontal_stage.jpg';
    }
}

updateImage();
window.addEventListener('resize', updateImage);
window.addEventListener('orientationchange', updateImage);

// ============ 2. POSICIÓN INICIAL DE LA FIGURA ============
function esHorizontal() {
    return window.innerWidth >= 768;
}

function posicionInicial() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    if (esHorizontal()) {
        return { xPct: 50, yPct: 35 }; // Porcentajes para mantener consistencia con sliders
    } else {
        return { xPct: 42, yPct: 50 };
    }
}

// ============ NUEVO: Utilidades de estado de la pieza ============
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

function seleccionarPieza(el) {
    if (piezaActiva === el) return;
    if (piezaActiva) piezaActiva.classList.remove('seleccionada');
    piezaActiva = el;
    el.classList.add('seleccionada');
    panelControles.classList.add('visible');
    refrescarSliders(el);
}

function deseleccionar() {
    if (piezaActiva) {
        piezaActiva.classList.remove('seleccionada');
        piezaActiva = null;
    }
    panelControles.classList.remove('visible');
}

function actualizarEstadoAvatar(idPersonaje) {
    const btn = panelAvatars.querySelector('[data-id="' + idPersonaje + '"]');
    if (!btn) return;
    const figurasExistentes = document.querySelectorAll('.figura-activa[data-personaje="' + idPersonaje + '"]');
    if (figurasExistentes.length > 0) {
        btn.classList.add('activo');
    } else {
        btn.classList.remove('activo');
    }
}

// ============ 3. CREAR LOS BOTONES AVATAR ============
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
        // Buscar si ya existe al menos una figura de este personaje
        const figurasExistentes = document.querySelectorAll('.figura-activa[data-personaje="' + personaje.id + '"]');
        
        if (figurasExistentes.length > 0) {
            // Ya existe: preguntar si quiere quitar una (prioriza la seleccionada, si no, la última)
            const figuraAQuitar = (piezaActiva && piezaActiva.dataset.personaje === personaje.id) 
                ? piezaActiva 
                : figurasExistentes[figurasExistentes.length - 1];
                
            const seguro = confirm('¿Seguro que quieres quitar ' + personaje.nombre + ' de la escena?');
            if (seguro) {
                if (piezaActiva === figuraAQuitar) deseleccionar();
                figuraAQuitar.remove();
                actualizarEstadoAvatar(personaje.id);
            }
        } else {
            // No existe: crearla
            crearFigura(personaje);
        }
    });
});

// ============ 4. CREAR LA FIGURA PNG EN LA ESCENA ============
function crearFigura(personaje) {
    contadorCopias++;
    const img = document.createElement('img');
    img.src = personaje.png;
    img.id = 'figura-' + personaje.id + '-' + contadorCopias; // ID único para permitir duplicados
    img.alt = personaje.nombre;
    img.classList.add('figura-activa');
    img.draggable = false;
    img.dataset.personaje = personaje.id;
    
    // Estado inicial por defecto
    const pos = posicionInicial();
    img.dataset.x = pos.xPct;
    img.dataset.y = pos.yPct;
    img.dataset.zoom = 100;
    img.dataset.giro = 0;
    img.dataset.volteada = 'false';

    aplicarTransform(img);
    hacerArrastrable(img);
    zonaFiguras.appendChild(img);
    actualizarEstadoAvatar(personaje.id);
    seleccionarPieza(img);
}

// ============ 5. ARRASTRAR CON DEDO O MOUSE (Actualizado para sincronizar con sliders) ============
function hacerArrastrable(elemento) {
    let arrastrando = false;
    let startX = 0, startY = 0, initX = 0, initY = 0;

    function inicio(e) {
        seleccionarPieza(elemento); // Seleccionar al tocar
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
        
        // Calcular cambio en porcentaje de pantalla
        const dxPct = (cx - startX) / window.innerWidth * 100;
        const dyPct = (cy - startY) / window.innerHeight * 100;
        
        let nuevoX = Math.max(0, Math.min(100, initX + dxPct));
        let nuevoY = Math.max(0, Math.min(100, initY + dyPct));
        
        elemento.dataset.x = nuevoX;
        elemento.dataset.y = nuevoY;
        
        aplicarTransform(elemento);
        refrescarSliders(elemento); // Sincronizar barras mientras se arrastra
    }

    function fin() {
        arrastrando = false;
    }

    elemento.addEventListener('mousedown', inicio);
    document.addEventListener('mousemove', mover);
    document.addEventListener('mouseup', fin);

    elemento.addEventListener('touchstart', inicio, { passive: false });
    document.addEventListener('touchmove', mover, { passive: false });
    document.addEventListener('touchend', fin);
    document.addEventListener('touchcancel', fin);
}

// ============ NUEVO: 6. BARRAS DE CONTROL ============
sliderX.addEventListener('input', function () {
    if (piezaActiva) { piezaActiva.dataset.x = this.value; aplicarTransform(piezaActiva); }
});
sliderY.addEventListener('input', function () {
    if (piezaActiva) { piezaActiva.dataset.y = this.value; aplicarTransform(piezaActiva); }
});
sliderZoom.addEventListener('input', function () {
    if (piezaActiva) { piezaActiva.dataset.zoom = this.value; aplicarTransform(piezaActiva); }
});
sliderGiro.addEventListener('input', function () {
    if (piezaActiva) { piezaActiva.dataset.giro = this.value; aplicarTransform(piezaActiva); }
});

btnVoltear.addEventListener('click', function () {
    if (piezaActiva) {
        const nuevo = piezaActiva.dataset.volteada === 'true' ? 'false' : 'true';
        piezaActiva.dataset.volteada = nuevo;
        aplicarTransform(piezaActiva);
    }
});

btnDuplicar.addEventListener('click', function () {
    if (piezaActiva) {
        const idP = piezaActiva.dataset.personaje;
        const personaje = personajes.find(p => p.id === idP);
        if (personaje) {
            // Crear copia manualmente para mantener la posición y estado actual, pero desplazada
            contadorCopias++;
            const img = document.createElement('img');
            img.src = personaje.png;
            img.id = 'figura-' + personaje.id + '-' + contadorCopias;
            img.alt = personaje.nombre + ' (copia)';
            img.classList.add('figura-activa');
            img.draggable = false;
            img.dataset.personaje = personaje.id;
            
            const s = leerEstado(piezaActiva);
            img.dataset.x = Math.min(95, s.x + 5); // Desplazada un 5% a la derecha
            img.dataset.y = Math.min(95, s.y + 5); // Desplazada un 5% abajo
            img.dataset.zoom = s.zoom;
            img.dataset.giro = s.giro;
            img.dataset.volteada = s.volteada;
            
            aplicarTransform(img);
            hacerArrastrable(img);
            zonaFiguras.appendChild(img);
            seleccionarPieza(img);
        }
    }
});

btnQuitar.addEventListener('click', function () {
    if (piezaActiva) {
        const idP = piezaActiva.dataset.personaje;
        const personaje = personajes.find(p => p.id === idP);
        const nombre = personaje ? personaje.nombre : 'esta pieza';
        if (confirm('¿Seguro que quieres quitar ' + nombre + ' de la escena?')) {
            const el = piezaActiva;
            piezaActiva = null;
            el.remove();
            panelControles.classList.remove('visible');
            actualizarEstadoAvatar(idP);
        }
    }
});

// ============ NUEVO: 7. TOCAR EL FONDO PARA DESELECCIONAR ============
document.querySelector('.escena-overlay').addEventListener('click', function (e) {
    if (e.target === this || e.target === zonaFiguras) {
        deseleccionar();
    }
});

// ============ 8. REAJUSTAR AL CAMBIAR ORIENTACIÓN ============
window.addEventListener('resize', function () {
    const figuras = document.querySelectorAll('.figura-activa');
    figuras.forEach(function (f) { aplicarTransform(f); });
});
