// ============ RELOJES Y FIN DE PARTIDA (belen-tiempo.js) ============

function iniciarRelojGlobal() {
    actualizarDisplayReloj('relojGlobalNumero', tiempoGlobalRestante);
    intervaloGlobal = setInterval(() => {
        tiempoGlobalRestante--;
        actualizarDisplayReloj('relojGlobalNumero', tiempoGlobalRestante);
        if (tiempoGlobalRestante <= 0) {
            finalizarJuego('tiempo');
        }
    }, 1000);
}

function iniciarRelojFinal() {
    document.getElementById('relojFinal').style.display = 'flex';
    actualizarDisplayReloj('relojFinalNumero', tiempoFinalRestante);
    intervaloFinal = setInterval(() => {
        tiempoFinalRestante--;
        actualizarDisplayReloj('relojFinalNumero', tiempoFinalRestante);
        const relojFinalEl = document.getElementById('relojFinal');
        if (tiempoFinalRestante <= 20) {
            relojFinalEl.classList.add('urgente');
        }
        if (tiempoFinalRestante <= 0) {
            finalizarJuego('tiempo');
        }
    }, 1000);
}

function actualizarDisplayReloj(idElemento, segundos) {
    const m = Math.floor(segundos / 60).toString().padStart(2, '0');
    const s = (segundos % 60).toString().padStart(2, '0');
    document.getElementById(idElemento).textContent = m + ':' + s;
}

function verificarInicioRelojFinal() {
    if (juegoTerminado || modoLibre || intervaloFinal) return;
    const figuras = document.querySelectorAll('.figura-activa');
    const hayOchoPiezas = figuras.length === 8;
    const todasUnicas = idsNecesarios.every(id => figuras.filter(f => f.dataset.personaje === id).length === 1);
    if (hayOchoPiezas && todasUnicas) {
        iniciarRelojFinal();
    }
}

function finalizarJuego(motivo) {
    if (juegoTerminado) return;
    juegoTerminado = true;
    clearInterval(intervaloGlobal);
    clearInterval(intervaloFinal);
    document.body.classList.add('juego-congelado');
    document.getElementById('relojGlobal').classList.add('agotado');
    const rf = document.getElementById('relojFinal');
    if (rf) rf.classList.add('agotado');
    deseleccionar();
    actualizarProgresoGeneral();
    if (typeof liberarEstadoPanelHistory === 'function') liberarEstadoPanelHistory();
    if (typeof mostrarResultadoFinal === 'function') {
        mostrarResultadoFinal(calcularScoreGeneral(), motivo);
    }
}

function activarModoLibre() {
    modoLibre = true;
    juegoTerminado = false;
    clearInterval(intervaloGlobal);
    clearInterval(intervaloFinal);
    document.body.classList.remove('juego-congelado');
    document.body.classList.remove('mostrar-reinicio');
    const zonaRelojes = document.querySelector('.zona-relojes'); if (zonaRelojes) zonaRelojes.style.display = 'flex';
    const btnDonate = document.querySelector('.btn-donate'); if (btnDonate) btnDonate.style.display = 'inline-flex';
    const rg = document.getElementById('relojGlobal'); if (rg) rg.style.display = 'none';
    const rf2 = document.getElementById('relojFinal'); if (rf2) rf2.style.display = 'none';
    const pp = document.querySelector('.panel-progreso'); if (pp) pp.style.display = 'none';
    const bh = document.getElementById('btnHonor'); if (bh) bh.style.display = 'none';
    const mr = document.getElementById('modalResultado'); if (mr) mr.classList.remove('visible');
    const mh = document.getElementById('modalHonor'); if (mh) mh.classList.remove('visible');
    deseleccionar();
    if (typeof liberarEstadoPanelHistory === 'function') liberarEstadoPanelHistory();
}

function chequearVictoria() {
    if (juegoTerminado || modoLibre) return;
    const figuras = document.querySelectorAll('.figura-activa');
    if (figuras.length !== 8) return;
    const todasUnicas = idsNecesarios.every(id => figuras.filter(f => f.dataset.personaje === id).length === 1);
    if (!todasUnicas) return;
    if (Math.round(calcularScoreGeneral()) >= 100) {
        finalizarJuego('victoria');
    }
}
