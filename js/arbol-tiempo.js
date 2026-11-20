// ============ TIEMPO Y ESTADO DEL JUEGO (arbol-tiempo.js) ============
let tiempoGlobalRestante = 16 * 60;
let tiempoFinalRestante = 90;
let intervaloGlobal = null;
let intervaloFinal = null;
let juegoTerminado = false;
let modoLibre = false;

function iniciarRelojGlobal() {
    actualizarDisplayReloj('relojGlobalNumero', tiempoGlobalRestante);
    intervaloGlobal = setInterval(() => {
        tiempoGlobalRestante--;
        actualizarDisplayReloj('relojGlobalNumero', tiempoGlobalRestante);
        if (tiempoGlobalRestante <= 0) finalizarJuego('tiempo');
    }, 1000);
}

function iniciarRelojFinal() {
    document.getElementById('relojFinal').style.display = 'flex';
    actualizarDisplayReloj('relojFinalNumero', tiempoFinalRestante);
    intervaloFinal = setInterval(() => {
        tiempoFinalRestante--;
        actualizarDisplayReloj('relojFinalNumero', tiempoFinalRestante);
        const rf = document.getElementById('relojFinal');
        if (tiempoFinalRestante <= 20) rf.classList.add('urgente');
        if (tiempoFinalRestante <= 0) finalizarJuego('tiempo');
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
    if (figuras.length === 8 && idsNecesarios.every(id => figuras.filter(f => f.dataset.personaje === id).length === 1)) {
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
    if (typeof mostrarResultadoFinal === 'function') mostrarResultadoFinal(calcularScoreGeneral(), motivo);
}

function activarModoLibre() {
    modoLibre = true;
    juegoTerminado = false;
    clearInterval(intervaloGlobal);
    clearInterval(intervaloFinal);
    document.body.classList.remove('juego-congelado');
    const zr = document.querySelector('.zona-relojes'); if (zr) zr.style.display = 'none';
    const pp = document.querySelector('.panel-progreso'); if (pp) pp.style.display = 'none';
    const bh = document.getElementById('btnHonor'); if (bh) bh.style.display = 'none';
    const mr = document.getElementById('modalResultado'); if (mr) mr.classList.remove('visible');
    const mh = document.getElementById('modalHonor'); if (mh) mh.classList.remove('visible');
    deseleccionar();
}

function chequearVictoria() {
    if (juegoTerminado || modoLibre) return;
    const figuras = document.querySelectorAll('.figura-activa');
    if (figuras.length === 8 && idsNecesarios.every(id => figuras.filter(f => f.dataset.personaje === id).length === 1)) {
        if (Math.round(calcularScoreGeneral()) >= 100) finalizarJuego('victoria');
    }
}
