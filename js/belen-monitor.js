// ============ MONITOR DE VICTORIA (belen-monitor.js) ============
// Este archivo se encarga ÚNICAMENTE de vigilar el puntaje y disparar la
// celebración en el instante exacto en que el jugador llega a 100 con las
// ocho piezas únicas, sin depender del momento en que colocó o movió la última.
(function () {
    const INTERVALO_MS = 400; // revisa cada 400 milisegundos
    let intervaloMonitor = null;

    function revisarVictoria() {
        // Si el juego ya terminó (por victoria o por tiempo), detener el vigilante
        if (typeof juegoTerminado !== 'undefined' && juegoTerminado) {
            detenerMonitor();
            return;
        }
        const figuras = document.querySelectorAll('.figura-activa');
        if (figuras.length !== 8) return;
        const todasUnicas = idsNecesarios.every(function (id) {
            let cuenta = 0;
            for (let i = 0; i < figuras.length; i++) {
                if (figuras[i].dataset.personaje === id) cuenta++;
            }
            return cuenta === 1;
        });
        if (!todasUnicas) return;
        const score = calcularScoreGeneral();
        if (Math.round(score) >= 100) {
            detenerMonitor();
            finalizarJuego('victoria');
        }
    }

    function detenerMonitor() {
        if (intervaloMonitor) {
            clearInterval(intervaloMonitor);
            intervaloMonitor = null;
        }
    }

    function iniciarMonitor() {
        detenerMonitor();
        intervaloMonitor = setInterval(revisarVictoria, INTERVALO_MS);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', iniciarMonitor);
    } else {
        iniciarMonitor();
    }
})();
