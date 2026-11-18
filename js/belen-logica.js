// ============ REGLA DE LADO: margen "un poquito" como fracción del ancho de la figura humana ============
const MARGEN_LADO = 0.25;

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

// ============ 4. ORIENTACIÓN (MIRAR HACIA EL CENTRO) ============
// naturalIzquierda = true  -> la pieza sin voltear mira a la IZQUIERDA (María, José, Oveja)
// naturalIzquierda = false -> la pieza sin voltear mira a la DERECHA  (Burro)
function orientacionCorrecta(figuraEl, pesebreEl, naturalIzquierda) {
    if (!figuraEl || !pesebreEl) return true;
    const estaVolteada = figuraEl.dataset.volteada === 'true';
    const estaALaIzquierda = centro(figuraEl).x < centro(pesebreEl).x;
    // Si está a la IZQUIERDA del pesebre debe mirar DERECHA (no izquierda); si está a la DERECHA debe mirar IZQUIERDA
    const debeMirarIzquierda = !estaALaIzquierda;
    let miraIzquierda;
    if (naturalIzquierda) {
        miraIzquierda = !estaVolteada;
    } else {
        miraIzquierda = estaVolteada;
    }
    return miraIzquierda === debeMirarIzquierda;
}

// ============ 5. BALANCE DE LADOS ============
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
        const margen = anchoPx(figuraDerecha) * MARGEN_LADO;
        return centro(animalEl).x >= centro(figuraDerecha).x + margen;
    } else {
        const margen = anchoPx(figuraIzquierda) * MARGEN_LADO;
        return centro(animalEl).x <= centro(figuraIzquierda).x - margen;
    }
}

// ============ 6. CRITERIOS DE COHERENCIA (NIVEL ÚNICO: EXPERTO) ============
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
        let pts = 0;
        if (e < p) pts = 1;
        else if (e < p + 60) pts = 0.5;
        if (pts > 0) {
            const prohibidas = [m.maria, m.jose, m.jesus, m.cuna, m.burro, m.oveja];
            for (const pieza of prohibidas) {
                if (pieza && centroDentroDe(m.estrella, pieza)) { pts = 0; break; }
            }
        }
        return pts;
    }},
    { id: 'maria_pesebre', nombre: 'María cerca del Pesebre', peso: 10, eval: (m) => {
        if (!m.maria || !m.pesebre) return 0;
        let pts = 0;
        if (cerca(m.maria, m.pesebre, 24)) pts = 1;
        else if (cerca(m.maria, m.pesebre, 38)) pts = 0.6;
        if (pts > 0) {
            const prohibidas = [m.estrella, m.cuna, m.jesus, m.burro, m.oveja];
            for (const pieza of prohibidas) {
                if (pieza && centroDentroDe(m.maria, pieza)) { pts = 0; break; }
            }
        }
        if (pts > 0 && !orientacionCorrecta(m.maria, m.pesebre, true)) pts = 0.5;
        return pts;
    }},
    { id: 'jose_pesebre', nombre: 'José cerca del Pesebre', peso: 10, eval: (m) => {
        if (!m.jose || !m.pesebre) return 0;
        let pts = 0;
        if (cerca(m.jose, m.pesebre, 24)) pts = 1;
        else if (cerca(m.jose, m.pesebre, 38)) pts = 0.6;
        if (pts > 0) {
            const prohibidas = [m.estrella, m.cuna, m.jesus, m.burro, m.oveja];
            for (const pieza of prohibidas) {
                if (pieza && centroDentroDe(m.jose, pieza)) { pts = 0; break; }
            }
        }
        if (pts > 0 && !orientacionCorrecta(m.jose, m.pesebre, true)) pts = 0.5;
        return pts;
    }},
    { id: 'oveja_suelo', nombre: 'Oveja en el suelo', peso: 9, eval: (m) => {
        if (!m.oveja || !m.pesebre) return 0;
        const enSuelo = centroY(m.oveja) > centroY(m.pesebre);
        const cercaP = distPct(m.oveja, m.pesebre) <= 34;
        let pts = 0;
        if (enSuelo && cercaP) pts = 1;
        else if (enSuelo) pts = 0.5;
        if (pts > 0) {
            const prohibidas = [m.maria, m.jose, m.cuna, m.jesus, m.estrella];
            for (const pieza of prohibidas) {
                if (pieza && centroDentroDe(m.oveja, pieza)) { pts = 0; break; }
            }
        }
        if (pts === 1 && !ladoAnimalOk(m, m.oveja)) pts = 0.5;
        // OVEJA nace mirando IZQUIERDA
        if (pts > 0 && !orientacionCorrecta(m.oveja, m.pesebre, true)) pts = 0.5;
        return pts;
    }},
    { id: 'burro_suelo', nombre: 'Burro en el suelo', peso: 9, eval: (m) => {
        if (!m.burro || !m.pesebre) return 0;
        const enSuelo = centroY(m.burro) > centroY(m.pesebre);
        const cercaP = distPct(m.burro, m.pesebre) <= 34;
        let pts = 0;
        if (enSuelo && cercaP) pts = 1;
        else if (enSuelo) pts = 0.5;
        if (pts > 0) {
            const prohibidas = [m.maria, m.jose, m.cuna, m.jesus, m.estrella];
            for (const pieza of prohibidas) {
                if (pieza && centroDentroDe(m.burro, pieza)) { pts = 0; break; }
            }
        }
        if (pts === 1 && !ladoAnimalOk(m, m.burro)) pts = 0.5;
        // BURRO nace mirando DERECHA
        if (pts > 0 && !orientacionCorrecta(m.burro, m.pesebre, false)) pts = 0.5;
        return pts;
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

// ============ 7. SELECCIÓN ============
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

// ============ 8. BARRA, LUPA, COORDENADAS, INSTRUCCIONES Y DISPARO ============
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

        html += `<div style="margin-top:12px; padding:10px; background:rgba(0,255,120,0.08); border:1px solid #44ff88; border-radius:8px; font-size:0.85em; color:#fff;">
            <b style="color:#44ff88;">📍 COORDENADAS X / Y (guía, no plantilla fija)</b><br>`;
        idsNecesarios.forEach(id => {
            if (m[id]) {
                const s = leerEstado(m[id]);
                let orientacionIcon = '';
                if ((id === 'maria' || id === 'jose' || id === 'oveja') && m.pesebre) {
                    orientacionIcon = orientacionCorrecta(m[id], m.pesebre, true) ? ' ✅' : ' ❌';
                }
                if (id === 'burro' && m.pesebre) {
                    orientacionIcon = orientacionCorrecta(m[id], m.pesebre, false) ? ' ✅' : ' ❌';
                }
                html += `<div style="display:flex; justify-content:space-between; margin-top:3px;"><span style="text-transform:capitalize;">${id}</span><span style="font-family:monospace; color:#ffd700;">X ${s.x.toFixed(1)} &nbsp; Y ${s.y.toFixed(1)}${orientacionIcon}</span></div>`;
            }
        });
        html += `</div>`;

        // ===== SECCIÓN NARANJA: INSTRUCCIONES EXPLÍCITAS PARA VOLTEAR =====
        const instrucciones = [];
        if (m.maria && m.pesebre && !orientacionCorrecta(m.maria, m.pesebre, true)) {
            instrucciones.push('María está mirando hacia afuera. Selecciona María y pulsa el botón VOLTEAR para que mire al niño.');
        }
        if (m.jose && m.pesebre && !orientacionCorrecta(m.jose, m.pesebre, true)) {
            instrucciones.push('José está mirando hacia afuera. Selecciona José y pulsa el botón VOLTEAR para que mire al niño.');
        }
        if (m.oveja && m.pesebre && !orientacionCorrecta(m.oveja, m.pesebre, true)) {
            instrucciones.push('La Oveja está mirando hacia afuera. Selecciona la Oveja y pulsa el botón VOLTEAR para que mire al pesebre.');
        }
        if (m.burro && m.pesebre && !orientacionCorrecta(m.burro, m.pesebre, false)) {
            instrucciones.push('El Burro está mirando hacia afuera. Selecciona el Burro y pulsa el botón VOLTEAR para que mire al pesebre.');
        }
        if (m.oveja && m.burro && m.pesebre && (centro(m.oveja).x > centro(m.pesebre).x) === (centro(m.burro).x > centro(m.pesebre).x)) {
            instrucciones.push('Los dos animales están del mismo lado. Mueve uno a la derecha de María y otro a la izquierda de José.');
        }

        html += `<div style="margin-top:12px; padding:10px; background:rgba(255,140,0,0.12); border:1px solid #ff8c00; border-radius:8px; font-size:0.9em; color:#fff; line-height:1.5;">
            <b style="color:#ff8c00;">📋 CÓMO LLEGAR AL 100</b><br>`;
        if (instrucciones.length === 0) {
            html += `<div style="color:#44ff44; margin-top:6px;">✅ Todo correcto. Todas las piezas miran al centro y están en su lugar.</div>`;
        } else {
            instrucciones.forEach(texto => {
                html += `<div style="margin-top:6px; border-bottom:1px dashed #664422; padding-bottom:6px;">👉 ${texto}</div>`;
            });
        }
        html += `</div>`;

        const mariaADerecha = m.maria && m.pesebre && centro(m.maria).x > centro(m.pesebre).x;
        const ladoTexto = mariaADerecha ? 'María derecha, José izquierda' : 'José derecha, María izquierda';

        html += `<div style="margin-top:12px; padding:10px; background:rgba(255,215,0,0.1); border:1px solid #ffd700; border-radius:8px; font-size:0.85em; color:#fff; line-height:1.6;">
            <b style="color:#ffd700;">🔧 DIAGNÓSTICO DEL FESTEJO</b><br>
            Puntaje >= 100: ${Math.round(score) >= 100 ? '✅ SÍ' : '❌ NO'}<br>
            Las 8 presentes: ${todasPresentes ? '✅ SÍ' : '❌ NO'}<br>
            Total piezas: ${totalFiguras} ${totalFiguras === 8 ? '✅' : '⚠️'}<br>
            Función festejo: ${disparoCargado ? '✅ SÍ' : '❌ NO'}<br>
            Juego terminado: ${juegoTerminadoActivo ? '⚠️ SÍ' : '✅ NO'}<br>
            Posición figuras: ${ladoTexto}<br>
            Balance de animales: ${(m.oveja && m.burro && m.pesebre && (centro(m.oveja).x > centro(m.pesebre).x) !== (centro(m.burro).x > centro(m.pesebre).x)) ? '✅ Uno a cada lado' : '⚠️ Ambos del mismo lado'}<br>
            Modo: 🎯 Único (Experto, superposición + orientación + lado + balance)<br>
            Margen de lado: ${MARGEN_LADO}
        </div>`;
        content.innerHTML = html;
    }

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

    if (puntajeRedondeado >= 100) {
        setTimeout(() => { modal.classList.add('visible'); }, 10000);
    } else {
        modal.classList.add('visible');
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
    const simbolos = ['✨', '🌟', '❄️', '⭐', '🎉', '🎊'];
    const direcciones = ['cae', 'sube', 'derecha', 'izquierda', 'di
