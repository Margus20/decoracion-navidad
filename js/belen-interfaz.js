// ============ INTERFAZ Y CELEBRACIÓN (belen-interfaz.js) ============

// Helper seguro para obtener traducciones dinámicas del Belén
function tBelen(key) {
    if (window.SistemaIdioma && window.SistemaIdioma.traducciones) {
        const lang = window.SistemaIdioma.actual();
        return window.SistemaIdioma.traducciones[lang][key] || window.SistemaIdioma.traducciones['es'][key] || key;
    }
    // Fallback por defecto para que nunca se rompa si el idioma tarda en cargar
    const fallback = {
        progress_label_belen: 'Progreso del Belén',
        debug_real_score_belen: 'Puntaje Real',
        debug_how_to_100_title_belen: '📋 CÓMO LLEGAR AL 100',
        debug_how_to_100_msg_ok: 'Todo correcto. Piezas en su lugar y mirando al centro.',
        debug_how_to_100_msg_maria: 'María mira hacia afuera. Selecciónala y pulsa VOLTEAR.',
        debug_how_to_100_msg_jose: 'José mira hacia afuera. Selecciónalo y pulsa VOLTEAR.',
        debug_how_to_100_msg_oveja: 'La Oveja mira hacia afuera. Selecciónala y pulsa VOLTEAR.',
        debug_how_to_100_msg_burro: 'El Burro mira hacia afuera. Selecciónalo y pulsa VOLTEAR.',
        debug_how_to_100_msg_animals: 'Los dos animales están del mismo lado. Sepáralos a los extremos.',
        debug_diag_title_belen: '🔧 DIAGNÓSTICO',
        debug_diag_yes_belen: 'SÍ', debug_diag_no_belen: 'NO',
        debug_diag_score_belen: 'Puntaje >= 100', debug_diag_pieces_belen: 'Las 8 presentes',
        debug_diag_balance_belen: 'Balance animales',
        debug_diag_balance_ok: 'Uno a cada lado', debug_diag_balance_warn: 'Mismo lado',
        result_msg_perfect_belen: '¡Felicitaciones! Todas las relaciones están correctas y alcanzaste los 100 puntos. Has armado el Belén con maestría.',
        result_msg_time_belen: 'Se acabó el tiempo. ', result_msg_missing_belen: 'Te faltan ', result_msg_points_belen: ' puntos. ',
        result_msg_failed_belen: 'Hay ', result_msg_relations_fail_belen: ' relación(es) que no se cumplen. ',
        result_msg_partial_belen: 'Hay ', result_msg_relations_partial_belen: ' relación(es) casi correctas que puedes afinar. ',
        result_msg_review_belen: 'Revisa abajo las marcadas con ~ o ✗.',
        result_title_perfect_belen: '¡Belén Perfecto!', result_title_completed_belen: '¡Belén Completado!', result_title_built_belen: 'Belén Armado',
        conf_title: 'Confirmar', conf_cancel: 'Cancelar', conf_accept: 'Aceptar'
    };
    return fallback[key] || key;
}

// --- MODAL DE CONFIRMACIÓN PERSONALIZADO (paleta del juego) ---
(function inyectarEstilosConfirmacion() {
    if (document.getElementById('confStyles')) return;
    const s = document.createElement('style');
    s.id = 'confStyles';
    s.textContent = `
        .conf-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.75); z-index: 2000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(5px); -webkit-backdrop-filter: blur(5px); }
        .conf-panel { background: linear-gradient(135deg, #1a1a2e 0%, #2c1810 100%); border: 3px solid #ffd700; border-radius: 20px; padding: 24px; width: 90%; max-width: 380px; text-align: center; box-shadow: 0 0 40px rgba(255,215,0,0.5); }
        .conf-titulo { color: #ffd700; font-family: 'Bebas Neue', Arial, sans-serif; font-size: 1.6rem; letter-spacing: 1px; margin: 0 0 12px; text-shadow: 0 2px 4px rgba(0,0,0,0.6); }
        .conf-msg { color: #fff; font-size: 1.05rem; margin: 0 0 20px; line-height: 1.4; }
        .conf-botones { display: flex; gap: 12px; justify-content: center; }
        .conf-btn { flex: 1; padding: 12px; font-size: 1.05rem; font-weight: bold; font-family: 'Bebas Neue', Arial, sans-serif; letter-spacing: 1px; color: #fff; border: 3px solid #ffd700; border-radius: 12px; cursor: pointer; transition: transform 0.15s ease; box-shadow: 0 4px 0 rgba(0,0,0,0.3); }
        .conf-btn:active { transform: scale(0.94); }
        .conf-cancelar { background: linear-gradient(180deg, #c62828, #8e1a1a); }
        .conf-aceptar { background: linear-gradient(180deg, #2e7d32, #1b5e20); }
    `;
    document.head.appendChild(s);
})();

function cerrarConfirmacion() {
    const o = document.getElementById('confOverlay');
    if (o) o.remove();
}

function confirmarAccion(mensaje, onAceptar) {
    cerrarConfirmacion();
    const ov = document.createElement('div');
    ov.className = 'conf-overlay';
    ov.id = 'confOverlay';
    // CAMBIO SEGURO: Usa traducciones para los botones del modal
    ov.innerHTML = `<div class="conf-panel"><h3 class="conf-titulo">${tBelen('conf_title')}</h3><p class="conf-msg">${mensaje}</p><div class="conf-botones"><button class="conf-btn conf-cancelar">${tBelen('conf_cancel')}</button><button class="conf-btn conf-aceptar">${tBelen('conf_accept')}</button></div></div>`;
    document.body.appendChild(ov);
    ov.querySelector('.conf-aceptar').addEventListener('click', function () {
        cerrarConfirmacion();
        if (typeof onAceptar === 'function') onAceptar();
    });
    ov.querySelector('.conf-cancelar').addEventListener('click', cerrarConfirmacion);
    ov.addEventListener('click', function (e) { if (e.target === ov) cerrarConfirmacion(); });
}

// ============ CÓDIGO ORIGINAL CONSOLIDADO ============

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
    const totalFiguras = document.querySelectorAll('.figura-activa').length;
    const juegoTerminadoActivo = (typeof juegoTerminado !== 'undefined' && juegoTerminado);
    const disparoCargado = (typeof finalizarJuego === 'function');

    // AJUSTE SEGURO: la barra se busca fresco por su ID en cada actualización,
    // en lugar de depender de una variable global que puede no apuntar al elemento.
    const barraEl = document.getElementById('barraGeneral');
    if (barraEl) {
        barraEl.style.width = score + '%';
        barraEl.className = 'barra-relleno ' + (score < 25 ? 'nivel-bajo' : score < 75 ? 'nivel-medio' : 'nivel-alto');
    }
    const etiquetaGeneral = document.querySelector('.panel-progreso .label-progreso');
    if (etiquetaGeneral) etiquetaGeneral.textContent = `${tBelen('progress_label_belen')}: ${score.toFixed(2)}/100`;

    const panel = document.getElementById('debugPanel');
    const content = document.getElementById('debugContent');
    if (panel && content && panel.style.display === 'block') {
        let html = `<div style="text-align:center; font-size:1.5em; margin-bottom:15px; color:${score>=100?'#44ff44':'#ff4444'}; font-weight:bold;">${tBelen('debug_real_score_belen')}: ${score.toFixed(2)}</div>`;
        
        criterios.forEach(c => {
            const val = c.eval(m);
            const pts = (val * c.peso).toFixed(1);
            let icon = '❌', color = '#ff4444';
            if (val >= 0.9) { icon = '✅'; color = '#44ff44'; }
            else if (val >= 0.5) { icon = '⚠️'; color = '#ffcc00'; }
            // CAMBIO SEGURO: Usa el ID de la regla para buscar la traducción
            html += `<div style="display:flex; justify-content:space-between; margin-bottom:8px; border-bottom:1px solid #444; padding-bottom:4px;">
                <span style="color:#fff;">${tBelen('rule_belen_' + c.id)}</span>
                <span style="color:${color}; font-weight:bold;">${icon} ${pts}/${c.peso}</span>
            </div>`;
        });

        html += `<div style="margin-top:12px; padding:10px; background:rgba(0,255,120,0.08); border:1px solid #44ff88; border-radius:8px; font-size:0.85em; color:#fff;">
            <b style="color:#44ff88;">📍 COORDENADAS X / Y</b><br>`;
        idsNecesarios.forEach(id => {
            if (m[id]) {
                const s = leerEstado(m[id]);
                let icon = '';
                if ((id === 'maria' || id === 'jose' || id === 'oveja') && m.pesebre) icon = orientacionCorrecta(m[id], m.pesebre, true) ? ' ✅' : ' ❌';
                if (id === 'burro' && m.pesebre) icon = orientacionCorrecta(m[id], m.pesebre, false) ? ' ✅' : ' ❌';
                html += `<div style="display:flex; justify-content:space-between; margin-top:3px;"><span style="text-transform:capitalize;">${id}</span><span style="font-family:monospace; color:#ffd700;">X ${s.x.toFixed(1)} &nbsp; Y ${s.y.toFixed(1)}${icon}</span></div>`;
            }
        });
        html += `</div>`;

        const instrucciones = [];
        // CAMBIOS SEGUROS: Instrucciones traducidas
        if (m.maria && m.pesebre && !orientacionCorrecta(m.maria, m.pesebre, true)) instrucciones.push(tBelen('debug_how_to_100_msg_maria'));
        if (m.jose && m.pesebre && !orientacionCorrecta(m.jose, m.pesebre, true)) instrucciones.push(tBelen('debug_how_to_100_msg_jose'));
        if (m.oveja && m.pesebre && !orientacionCorrecta(m.oveja, m.pesebre, true)) instrucciones.push(tBelen('debug_how_to_100_msg_oveja'));
        if (m.burro && m.pesebre && !orientacionCorrecta(m.burro, m.pesebre, false)) instrucciones.push(tBelen('debug_how_to_100_msg_burro'));
        if (m.oveja && m.burro && m.pesebre && (centro(m.oveja).x > centro(m.pesebre).x) === (centro(m.burro).x > centro(m.pesebre).x)) {
            instrucciones.push(tBelen('debug_how_to_100_msg_animals'));
        }

        html += `<div style="margin-top:12px; padding:10px; background:rgba(255,140,0,0.12); border:1px solid #ff8c00; border-radius:8px; font-size:0.9em; color:#fff; line-height:1.5;">
            <b style="color:#ff8c00;">${tBelen('debug_how_to_100_title_belen')}</b><br>`;
        if (instrucciones.length === 0) {
            html += `<div style="color:#44ff44; margin-top:6px;">✅ ${tBelen('debug_how_to_100_msg_ok')}</div>`;
        } else {
            instrucciones.forEach(texto => { html += `<div style="margin-top:6px; border-bottom:1px dashed #664422; padding-bottom:6px;">👉 ${texto}</div>`; });
        }
        html += `</div>`;

        const balanceOk = (m.oveja && m.burro && m.pesebre && (centro(m.oveja).x > centro(m.pesebre).x) !== (centro(m.burro).x > centro(m.pesebre).x));
        
        html += `<div style="margin-top:12px; padding:10px; background:rgba(255,215,0,0.1); border:1px solid #ffd700; border-radius:8px; font-size:0.85em; color:#fff; line-height:1.6;">
            <b style="color:#ffd700;">${tBelen('debug_diag_title_belen')}</b><br>
            ${tBelen('debug_diag_score_belen')}: ${Math.round(score) >= 100 ? `✅ ${tBelen('debug_diag_yes_belen')}` : `❌ ${tBelen('debug_diag_no_belen')}`}<br>
            ${tBelen('debug_diag_pieces_belen')}: ${todasPresentes ? `✅ ${tBelen('debug_diag_yes_belen')}` : `❌ ${tBelen('debug_diag_no_belen')}`}<br>
            ${tBelen('debug_diag_balance_belen')}: ${balanceOk ? `✅ ${tBelen('debug_diag_balance_ok')}` : `⚠️ ${tBelen('debug_diag_balance_warn')}`}
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
    
    // CAMBIOS SEGUROS: Mensajes de resultado traducidos
    let mensajeTexto = '';
    if (puntajeRedondeado >= 100) {
        mensajeTexto = tBelen('result_msg_perfect_belen');
    } else {
        const prefijo = motivo === 'tiempo' ? tBelen('result_msg_time_belen') : '';
        const fallidasTxt = fallidas > 0 ? `${tBelen('result_msg_failed_belen')}${fallidas}${tBelen('result_msg_relations_fail_belen')}` : '';
        const parcialesTxt = parciales > 0 ? `${tBelen('result_msg_partial_belen')}${parciales}${tBelen('result_msg_relations_partial_belen')}` : '';
        mensajeTexto = `${prefijo}${tBelen('result_msg_missing_belen')}${faltan}${tBelen('result_msg_points_belen')}${fallidasTxt}${parcialesTxt}${tBelen('result_msg_review_belen')}`;
    }

    let tituloTexto = tBelen('result_title_built_belen');
    if (puntajeRedondeado >= 100) tituloTexto = tBelen('result_title_perfect_belen');
    else if (puntajeRedondeado >= 80) tituloTexto = tBelen('result_title_completed_belen');

    document.getElementById('resultadoTitulo').textContent = tituloTexto;
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
        // CAMBIO SEGURO: Usa el ID de la regla para buscar la traducción
        item.innerHTML = `<span>${tBelen('rule_belen_' + c.id)}</span><span style="color:#ffd700;font-weight:bold;margin:0 10px;">${puntosObtenidos}/${c.peso}</span><span class="detalle-estado ${estado}">${texto}</span>`;
        listaDetalles.appendChild(item);
    });

    const campoNombre = document.getElementById('campoNombre');
    if (campoNombre) campoNombre.style.display = 'block';

    if (puntajeRedondeado >= 100) {
        activarCelebracion();
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
