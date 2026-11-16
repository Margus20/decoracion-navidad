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

// ============ 2. POSICIÓN INICIAL DE LA FIGURA (evita tapar el panel) ============
function esHorizontal() {
    return window.innerWidth >= 768;
}

function posicionInicial() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    if (esHorizontal()) {
        // Panel abajo: la figura aparece en el centro-alto del área visible
        return { x: w / 2, y: h * 0.35 };
    } else {
        // Panel a la derecha: la figura aparece un poco a la izquierda del centro
        return { x: w * 0.42, y: h * 0.5 };
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
        const figura = document.getElementById('figura-' + personaje.id);
        if (figura) {
            // Ya está colocada: pedir confirmación antes de quitar
            const seguro = confirm('¿Seguro que quieres quitar ' + personaje.nombre + ' de la escena?');
            if (seguro) {
                figura.remove();
                btn.classList.remove('activo');
            }
        } else {
            // No existe: crearla en el centro y activar el botón
            crearFigura(personaje, btn);
        }
    });
});

// ============ 4. CREAR LA FIGURA PNG EN LA ESCENA ============
function crearFigura(personaje, btn) {
    const img = document.createElement('img');
    img.src = personaje.png;
    img.id = 'figura-' + personaje.id;
    img.alt = personaje.nombre;
    img.classList.add('figura-activa');
    img.draggable = false;

    const pos = posicionInicial();
    img.style.left = pos.x + 'px';
    img.style.top = pos.y + 'px';
    img.style.transform = 'translate(-50%, -50%)';

    hacerArrastrable(img);
    zonaFiguras.appendChild(img);
    btn.classList.add('activo');
}

// ============ 5. ARRASTRAR CON DEDO O MOUSE ============
function hacerArrastrable(elemento) {
    let arrastrando = false;
    let startX = 0, startY = 0, initLeft = 0, initTop = 0;

    function inicio(e) {
        arrastrando = true;
        e.preventDefault();
        const cx = e.touches ? e.touches[0].clientX : e.clientX;
        const cy = e.touches ? e.touches[0].clientY : e.clientY;
        startX = cx;
        startY = cy;
        const rect = elemento.getBoundingClientRect();
        initLeft = rect.left;
        initTop = rect.top;
        // Cambiar de transform a left/top absolutos para mover con precisión
        elemento.style.transform = 'none';
        elemento.style.left = initLeft + 'px';
        elemento.style.top = initTop + 'px';
        elemento.style.zIndex = '300';
    }

    function mover(e) {
        if (!arrastrando) return;
        e.preventDefault();
        const cx = e.touches ? e.touches[0].clientX : e.clientX;
        const cy = e.touches ? e.touches[0].clientY : e.clientY;
        elemento.style.left = (initLeft + (cx - startX)) + 'px';
        elemento.style.top = (initTop + (cy - startY)) + 'px';
    }

    function fin() {
        if (arrastrando) {
            arrastrando = false;
            elemento.style.zIndex = '100';
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
