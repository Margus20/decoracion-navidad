// ============ 1. IMAGEN DEL ESCENARIO ============
function updateImage() {
    const stageImage = document.getElementById('stageImage');
    stageImage.src = window.innerHeight > window.innerWidth ? 'img/belen/vertical_stage.jpg' : 'img/belen/horizontal_stage.jpg';
}

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

// ============ 3. GEOMETRÍA DE AYUDA ============
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

// Verifica si el centro de la pieza 'a' cae dentro del área de la pieza 'b' (con margen)
function dentroDe(a, b) {
    const ca = centro(a);
    const rb = b.getBoundingClientRect();
    const margen = 12;
    return ca.x >= rb.left - margen && ca.x <= rb.right + margen &&
           ca.y >= rb.top - margen && ca.y <= rb.bottom + margen;
}

function obtenerMapa() {
    const m = {};
    idsNecesarios.forEach(id => {
        const el = document.querySelector('.figura-activa[data-personaje="' + id + '"]');
        if (el) m[id] = el;
    });
    return m;
}

// ============ 4. CRITERIOS DE COHERENCIA (Suman 100 puntos) ============
const criterios = [
    { id: 'completitud', nombre: 'Las 8 piezas presentes', peso: 12, eval: (m) => {
        const presentes = idsNecesarios.filter(id => m[id]).length;
        return presentes / idsNecesarios.length;
    }},
    { id: 'jesus_cuna', nombre: 'Niño Jesús en la Cuna', peso: 12, eval: (m) => {
        if (!m.jesus || !m.cuna) return 0;
        if (dentroDe(m.jesus, m.cuna)) return 1;
        if (cerca(m.jesus, m.cuna, 16)) return 0.8;
        if (cerca(m.jesus, m.cuna, 30)) return 0.5;
        return 0;
    }},
    { id: 'cuna_pesebre', nombre: 'Cuna dentro del Pesebre', peso: 12, eval: (m) => {
        if (!m.cuna || !m.pesebre) return 0;
        if (dentroDe(m.cuna, m.pesebre)) return 1;
        if (cerca(m.cuna, m.pesebre, 18)) return 0.8;
        if (cerca(m.cuna, m.pesebre, 32)) return 0.5;
        return 0;
    }},
    { id: 'estrella_arriba', nombre: 'Estrella arriba del Pesebre', peso: 10, eval: (m) => {
        if (!m.estrella || !m.pesebre) return 0;
        const e = centroY(m.estrella), p = centroY(m.pesebre);
        if (e < p) return 1;
        if (e < p + 60) return 0.5;
        return 0;
    }},
    { id: 'maria_pesebre', nombre: 'María cerca del Pesebre', peso: 10, eval: (m) => {
        if (!m.maria || !m.pesebre) return 0;
        if (cerca(m.maria, m.pesebre, 24)) return 1;
        if (cerca(m.maria, m.pesebre, 38)) return 0.6;
        return 0;
    }},
    { id: 'jose_pesebre', nombre: 'José cerca del Pesebre', peso: 10, eval: (m) => {
        if (!m.jose || !m.pesebre) return 0;
        if (cerca(m.jose, m.pesebre, 24)) return 1;
        if (cerca(m.jose, m.pesebre, 38)) return 0.6;
        return 0;
    }},
    { id: 'oveja_suelo', nombre: 'Oveja en el suelo', peso: 8, eval: (m) => {
        if (!m.oveja || !m.pesebre) return 0;
        const enSuelo = centroY(m.oveja) > centroY(m.pesebre);
        const cercaP = distPct(m.oveja, m.pesebre) <= 34;
        if (enSuelo && cercaP) return 1;
        if (enSuelo) return 0.5;
        return 0;
    }},
    { id: 'burro_suelo', nombre: 'Burro en el suelo', peso: 8, eval: (m) => {
        if (!m.burro || !m.pesebre) return 0;
        const enSuelo = centroY(m.burro) > centroY(m.pesebre);
        const cercaP = distPct(m.burro, m.pesebre) <= 34;
        if (enSuelo && cercaP) return 1;
        if (enSuelo) return 0.5;
        return 0;
    }},
    { id: 'capas', nombre: 'Orden visual correcto', peso: 16, eval: (m) => {
        if (!m.jesus || !m.cuna || !m.pesebre) return 0;
        let pts = 0;
        if (dentroDe(m.jesus, m.cuna) || cerca(m.jesus, m.cuna, 12)) pts += 0.5;
        if (dentroDe(m.cuna, m.pesebre) || cerca(m.cuna, m.pesebre, 14)) pts += 0.5;
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

// ============ 5. SELECCIÓN Y BARRAS ============
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

// ============ 6. CELEBRACIÓN Y MODAL DE RESULTADO ============
let resultadoMostrado = false;

function actualizarProgresoGeneral() {
    const score = calcularScoreGeneral();
    barraGeneral.style.width = score + '%';

    // Mostrar el puntaje en números para que el usuario sepa qué falta
    const etiquetaGeneral = document.querySelector('.panel-progreso .label-progreso');
    if (etiquetaGeneral) {
        etiquetaGeneral.textContent = 'Progreso del Belén: ' + Math.round(score) + '/100';
    }

    if (score < 25) barraGeneral.className = 'barra-relleno nivel-bajo';
    else if (score < 75) barraGeneral.className = 'barra-relleno nivel-medio';
    else barraGeneral.className = 'barra-relleno nivel-alto';

    const figuras = document.querySelectorAll('.figura-activa');
    const hayOchoPiezas = figuras.length === 8;
    const todasUnicas = idsNecesarios.every(id => figuras.filter(f => f.dataset.personaje === id).length === 1);

    if (hayOchoPiezas && todasUnicas && !resultadoMostrado) {
        mostrarResultadoFinal(score);
    }
}

function mostrarResultadoFinal(score) {
    resultadoMostrado = true;
    const modal = document.getElementById('modalResultado');
    const titulo = document.getElementById('resultadoTitulo');
    const puntaje = document.getElementById('resultadoPuntaje');
    const mensaje = document.getElementById('resultadoMensaje');
    const listaDetalles = document.getElementById('listaDetalles');

    const puntajeRedondeado = Math.round(score);
    puntaje.textContent = puntajeRedondeado + '/100';
    puntaje.className = 'modal-resultado-puntaje';

    // Las chispas y el color SOLO para puntaje perfecto (100, según belen-datos.js)
    if (puntajeRedondeado >= UMBRAL_CELEBRACION) {
        puntaje.classList.add('perfecto');
        titulo.textContent = '¡Belén Perfecto!';
        mensaje.textContent = '¡Felicitaciones! Has armado el Belén con maestría. Todas las piezas están en su lugar correcto.';
        activarCelebracion();
    } else if (puntajeRedondeado >= 80) {
        puntaje.classList.add('bueno');
        titulo.textContent = '¡Belén Completado!';
        mensaje.textContent = 'Muy bien hecho. Tu Belén está casi perfecto, pero hay algunas relaciones que pueden mejorar.';
        // Sin chispas ni cambio de color
    } else {
        puntaje.classList.add('regular');
        titulo.textContent = 'Belén Armado';
        mensaje.textContent = 'Has colocado todas las piezas, pero algunas relaciones no son las ideales. Revisa los detalles abajo.';
        // Sin chispas ni cambio de color
    }

    listaDetalles.innerHTML = '';
    const m = obtenerMapa();
    criterios.forEach(c => {
        if (c.id === 'completitud') return;
        const valor = c.eval(m);
        const item = document.createElement('div');
        item.className = 'detalle-item';
        
        let estado = 'fallo';
        let texto = '✗';
        if (valor >= 0.9) { estado = 'ok'; texto = '✓'; }
        else if (valor >= 0.5) { estado = 'parcial'; texto = '~'; }
        
        item.innerHTML = '<span>' + c.nombre + '</span><span class="detalle-estado ' + estado + '">' + texto + '</span>';
        listaDetalles.appendChild(item);
    });

    modal.classList.add('visible');
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
    const simbolos = ['✨', '🌟', '❄️', '⭐', '🎉', '🎊'];
    const direcciones = ['cae', 'sube', 'derecha', 'izquierda', 'diag1', 'diag2', 'diag3', 'diag4'];
    const totalChispas = 80;

    for (let i = 0; i < totalChispas; i++) {
        setTimeout(() => {
            const dir = direcciones[Math.floor(Math.random() * direcciones.length)];
            const chispa = document.createElement('div');
            chispa.className = 'chispa ' + dir;
            chispa.textContent = simbolos[Math.floor(Math.random() * simbolos.length)];
            chispa.style.animationDuration = (Math.random() * 2 + 2.5) + 's';

            if (dir === 'cae') { chispa.style.left = (Math.random() * 100) + 'vw'; chispa.style.top = '-8vh'; }
            else if (dir === 'sube') { chispa.style.left = (Math.random() * 100) + 'vw'; chispa.style.top = '108vh'; }
            else if (dir === 'derecha') { chispa.style.top = (Math.random() * 100) + 'vh'; chispa.style.left = '-8vw'; }
            else if (dir === 'izquierda') { chispa.style.top = (Math.random() * 100) + 'vh'; chispa.style.left = '108vw'; }
            else if (dir === 'diag1') { chispa.style.left = '-8vw'; chispa.style.top = '108vh'; }
            else if (dir === 'diag2') { chispa.style.left = '108vw'; chispa.style.top = '108vh'; }
            else if (dir === 'diag3') { chispa.style.left = '-8vw'; chispa.style.top = '-8vh'; }
            else if (dir === 'diag4') { chispa.style.left = '108vw'; chispa.style.top = '-8vh'; }

            document.body.appendChild(chispa);
            setTimeout(() => chispa.remove(), 5000);
        }, i * 50);
    }
}
