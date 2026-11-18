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
    el.style.transform = `translate(-50%, -50%) rotate(${s.giro}deg) scale(${s.zoom / 100})${flip}`;
}

function refrescarSliders(el) {
    const s = leerEstado(el);
    sliderX.value = s.x;
    sliderY.value = s.y;
    sliderZoom.value = s.zoom;
    sliderGiro.value = s.giro;
    
    // AJUSTE DE CONSOLIDACIÓN: Actualizar también los campos numéricos si existen
    const inputX = document.getElementById('inputX');
    const inputY = document.getElementById('inputY');
    const inputZoom = document.getElementById('inputZoom');
    const inputGiro = document.getElementById('inputGiro');
    if (inputX) inputX.value = s.x;
    if (inputY) inputY.value = s.y;
    if (inputZoom) inputZoom.value = s.zoom;
    if (inputGiro) inputGiro.value = s.giro;
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
function obtenerMapa() {
    const m = {};
    idsNecesarios.forEach(id => {
        const el = document.querySelector(`.figura-activa[data-personaje="${id}"]`);
        if (el) m[id] = el;
    });
    return m;
}

// ============ 4. CRITERIOS DE COHERENCIA (Suman EXACTAMENTE 100 puntos) ============
const criterios = [
    { id: 'completitud', nombre: 'Las 8 piezas presentes', peso: 12, eval: (m) => idsNecesarios.filter(id => m[id]).length / idsNecesarios.length },
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
    { id: 'oveja_suelo', nombre: 'Oveja en el suelo', peso: 9, eval: (m) => {
        if (!m.oveja || !m.pesebre) return 0;
        const enSuelo = centroY(m.oveja) > centroY(m.pesebre);
        const cercaP = distPct(m.oveja, m.pesebre) <= 34;
        if (enSuelo && cercaP) return 1;
        if (enSuelo) return 0.5;
        return 0;
    }},
    { id: 'burro_suelo', nombre: 'Burro en el suelo', peso: 9, eval: (m) => {
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

function calcularScoreGeneral() {
    const m = obtenerMapa();
    return criterios.reduce((total, c) => total + (c.peso * c.eval(m)), 0);
}

// ============ 5. SELECCIÓN ============
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

// ============ 6. BARRA, LUPA, DIAGNÓSTICO Y DISPARO COHERENTE ============
function actualizarProgresoGeneral() {
    const score = calcularScoreGeneral();
    const m = obtenerMapa();
    const todasPresentes = idsNecesarios.every(id => m[id]);
    const totalFiguras = document.querySelectorAll('.figura-activa').length;
    const juegoTerminadoActivo = (typeof juegoTerminado !== 'undefined' && juegoTerminado);
    const disparoCargado = (typeof finalizarJuego === 'function');

    barraGeneral.style.width = score + '%';
    const etiquetaGeneral = document.querySelector('.panel-progreso .label-progreso');
    if (etiquetaGeneral) {
        etiquetaGeneral.textContent = `Progreso del Belén: ${score.toFixed(2)}/100`;
    }
    barraGeneral.className = 'barra-relleno ' + (score < 25 ? 'nivel-bajo' : score < 75 ? 'nivel-medio' : 'nivel-alto');

    // --- LUPA MATEMÁTICA + DIAGNÓSTICO EN VIVO ---
    const panel = document.getElementById('debugPanel');
    const content = document.getElementById('debugContent');
    if (panel && content && panel.style.display === 'block') {
        let html = `<div style="text-align:center; font-size:1.5em; margin-bottom:15px; color:${score>=100?'#44ff44':'#ff4444'}; font-weight:bold;">Puntaje Real: ${score.toFixed(2)}</div>`;
        criterios.forEach(c => {
            const val = c.eval(m);
            const pts = (val * c.peso).toFixed(1);
            let icon = '❌', color = '#ff4444';
            if (val >= 0.9) { icon = '✅'; color = '#44ff44'; }
            else if (val >= 0.5) { icon = '⚠️'; color = '#ffcc00'; }
            html += `<div style="display:flex; justify-content:space-between; margin-bottom:8px; border-bottom:1px solid #444; padding-bottom:4px;">
                <span style="color:#fff;">${c.nombre}</span>
                <span style="color:${color}; font-weight:bold;">${icon} ${pts}/${c.peso}</span>
            </div>`;
        });
        
        // DIAGNÓSTICO DEL DISPARO: aquí ves en vivo por qué celebra o no
        html += `<div style="margin-top:12px; padding:10px; background:rgba(255,215,0,0.1); border:1px solid #ffd700; border-radius:8px; font-size:0.85em; color:#fff; line-height:1.6;">
            <b style="color:#ffd700;">🔧 DIAGNÓSTICO DEL FESTEJO</b><br>
            Puntaje >= 100: ${Math.round(score) >= 100 ? '✅ SÍ' : '❌ NO'}<br>
            Las 8 presentes: ${todasPresentes ? '✅ SÍ' : '❌ NO'}<br>
            Total piezas en pantalla: ${totalFiguras} ${totalFiguras === 8 ? '✅' : '⚠️ (revisa duplicadas)'}<br>
            Función festejo cargada: ${disparoCargado ? '✅ SÍ' : '❌ NO (falta belen-acciones.js o caché)'}<br>
            Juego ya terminado: ${juegoTerminadoActivo ? '⚠️ SÍ (por eso no dispara)' : '✅ NO'}
        </div>`;
        content.innerHTML = html;
    }

    // --- DISPARO COHERENTE CON LA LUPA ---
    // Antes exigía "exactamente 8 y sin duplicados". Ahora exige lo mismo que la lupa:
    // puntaje 100 con las 8 presentes. Así barra, lupa y festejo dicen lo mismo.
    if (!juegoTerminadoActivo && Math.round(score) >= 100 && todasPresentes && disparoCargado) {
        finalizarJuego('victoria');
    }
}

function mostrarResultadoFinal(score, motivo) {
    const modal = document.getElementById('modalResultado');
    const puntajeRedondeado = Math.round(score);
    const m = obtenerMapa();
    let parciales = 0, fallidas = 0;
    criterios.forEach(c => {
        const v = c.eval(m);
        if (v < 0.9 && v >= 0.5) parciales++;
        else if (v < 0.5) fallidas++;
    });
    document.getElementById('resultadoPuntaje').textContent = `${puntajeRedondeado}/100`;
    document.getElementById('resultadoPuntaje').className = 'modal-resultado-puntaje ' + (puntajeRedondeado >= 100 ? 'perfecto' : puntajeRedondeado >= 80 ? 'bueno' : 'regular');
    const faltan = 100 - puntajeRedondeado;
    const prefijoTiempo = motivo === 'tiempo' ? 'Se acabó el tiempo. ' : '';
    let mensajeTexto = '';
    if (puntajeRedondeado >= 100) {
        document.getElementById('resultadoTitulo').textContent = '¡Belén Perfecto!';
        mensajeTexto = '¡Felicitaciones! Todas las relaciones están correctas y alcanzaste los 100 puntos. Has armado el Belén con maestría.';
        activarCelebracion();
    } else if (puntajeRedondeado >= 80) {
        document.getElementById('resultadoTitulo').textContent = '¡Belén Completado!';
        mensajeTexto = `${prefijoTiempo}Te faltan ${faltan} puntos para la perfección. `;
        if (fallidas > 0) mensajeTexto += `Hay ${fallidas} relación(es) que no se cumplen. `;
        if (parciales > 0) mensajeTexto += `Hay ${parciales} relación(es) casi correctas que puedes afinar. `;
        mensajeTexto += 'Revisa abajo las marcadas con ~ o ✗.';
    } else {
        document.getElementById('resultadoTitulo').textContent = 'Belén Armado';
        mensajeTexto = `${prefijoTiempo}Te faltan ${faltan} puntos. `;
        if (fallidas > 0) mensajeTexto += `Hay ${fallidas} relación(es) que no se cumplen. `;
        if (parciales > 0) mensajeTexto += `Hay ${parciales} relación(es) que pueden mejorar. `;
        mensajeTexto += 'Revisa abajo las marcadas con ~ o ✗.';
    }
    document.getElementById('resultadoMensaje').textContent = mensajeTexto;
    const listaDetalles = document.getElementById('listaDetalles');
    listaDetalles.innerHTML = '';
    criterios.forEach(c => {
        const valor = c.eval(m);
        const puntosObtenidos = Math.round(c.peso * valor);
        const item = document.createElement('div');
        item.className = 'detalle-item';
        let estado = 'fallo', texto = '✗';
        if (valor >= 0.9) { estado = 'ok'; texto = '✓'; }
        else if (valor >= 0.5) { estado = 'parcial'; texto = '~'; }
        item.innerHTML = `<span>${c.nombre}</span><span style="color:#ffd700;font-weight:bold;margin:0 10px;">${puntosObtenidos}/${c.peso}</span><span class="detalle-estado ${estado}">${texto}</span>`;
        listaDetalles.appendChild(item);
    });
    const campoNombre = document.getElementById('campoNombre');
    if (campoNombre) campoNombre.style.display = 'block';
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
    for (let i = 0; i < 80; i++) {
        setTimeout(() => {
            const dir = direcciones[Math.floor(Math.random() * direcciones.length)];
            const chispa = document.createElement('div');
            chispa.className = `chispa ${dir}`;
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
