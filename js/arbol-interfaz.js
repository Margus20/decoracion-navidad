// ============ INTERFAZ Y CELEBRACIÓN (arbol-interfaz.js) ============

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

function actualizarProgresoGeneral() {
    const score = calcularScoreGeneral();
    const m = obtenerMapa();
    const todasPresentes = idsNecesarios.every(id => m[id]);
    const juegoTerminadoActivo = (typeof juegoTerminado !== 'undefined' && juegoTerminado);
    const disparoCargado = (typeof finalizarJuego === 'function');

    barraGeneral.style.width = score + '%';
    const etiquetaGeneral = document.querySelector('.panel-progreso .label-progreso');
    if (etiquetaGeneral) etiquetaGeneral.textContent = `Progreso del Árbol: ${score.toFixed(2)}/100`;
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
            <b style="color:#44ff88;">📍 COORDENADAS X / Y</b><br>`;
        idsNecesarios.forEach(id => {
            if (m[id]) {
                const s = leerEstado(m[id]);
                html += `<div style="display:flex; justify-content:space-between; margin-top:3px;"><span style="text-transform:capitalize;">${id}</span><span style="font-family:monospace; color:#ffd700;">X ${s.x.toFixed(1)} &nbsp; Y ${s.y.toFixed(1)}</span></div>`;
            }
        });
        html += `</div>`;

        html += `<div style="margin-top:12px; padding:10px; background:rgba(255,140,0,0.12); border:1px solid #ff8c00; border-radius:8px; font-size:0.9em; color:#fff; line-height:1.5;">
            <b style="color:#ff8c00;">📋 CÓMO LLEGAR AL 100</b><br>
            <div style="color:#44ff44; margin-top:6px;">✅ Coloca las 8 piezas en sus posiciones correctas. Usa la lupa para ver las coordenadas.</div>
        </div>`;

        html += `<div style="margin-top:12px; padding:10px; background:rgba(255,215,0,0.1); border:1px solid #ffd700; border-radius:8px; font-size:0.85em; color:#fff; line-height:1.6;">
            <b style="color:#ffd700;">🔧 DIAGNÓSTICO</b><br>
            Puntaje >= 100: ${Math.round(score) >= 100 ? '✅ SÍ' : '❌ NO'}<br>
            Las 8 presentes: ${todasPresentes ? '✅ SÍ' : '❌ NO'}
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
    let mensajeTexto = puntajeRedondeado >= 100 ? '¡Felicitaciones! Todas las relaciones están correctas y alcanzaste los 100 puntos. Has armado el Árbol con maestría.' :
        `${prefijoTiempo}Te faltan ${faltan} puntos. ` + (fallidas > 0 ? `Hay ${fallidas} relación(es) que no se cumplen. ` : '') +
        (parciales > 0 ? `Hay ${parciales} relación(es) casi correctas que puedes afinar. ` : '') + 'Revisa abajo las marcadas con ~ o ✗.';

    document.getElementById('resultadoTitulo').textContent = puntajeRedondeado >= 100 ? '¡Árbol Perfecto!' : (puntajeRedondeado >= 80 ? '¡Árbol Completado!' : 'Árbol Armado');
    document.getElementById('resultadoMensaje').textContent = mensajeTexto;

    const listaDetalles = document.getElementById('listaDetalles');
    listaDetalles.innerHTML = '';
    criterios.forEach(c => {
        const valor = c.eval(m);
        const puntosObtenidos = Math.round(c.peso * valor);
        let estado = 'fallo', texto = '✗';
        if (valor >= 0.9) { estado = 'ok'; texto = '✓'; }
        else if (valor >= 0.5) { estado = 'parcial'; texto = '~'; }
        const item = document.createElement('div');
        item.className = 'detalle-item';
        item.innerHTML = `<span>${c.nombre}</span><span style="color:#ffd700;font-weight:bold;margin:0 10px;">${puntosObtenidos}/${c.peso}</span><span class="detalle-estado ${estado}">${texto}</span>`;
        listaDetalles.appendChild(item);
    });

    const campoNombre = document.getElementById('campoNombre');
    if (campoNombre) campoNombre.style.display = 'block';

    if (puntajeRedondeado >= 100) {
        activarCelebracion();
        setTimeout(() => { modal.classList.add('visible'); }, 10000); // 10 segundos de gloria
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
// Nota: El listener del botón "btnSeguirDecorando" ya está centralizado en arbol-controles.js para evitar duplicados.
