// ============ MONITOR DE VICTORIA INSTANTÁNEA (arbol-monitor.js) ============
(function () {
    const INTERVALO_MS = 400;
    let intervaloMonitor = null;

    function revisarVictoria() {
        // 1. Si el juego ya terminó, apagamos el monitor
        if (typeof juegoTerminado !== 'undefined' && juegoTerminado) {
            detenerMonitor();
            return;
        }

        // 2. Usamos la misma lógica coherente definida en arbol-reglas.js
        const score = calcularScoreGeneral();
        const m = obtenerMapa();
        
        // Verificamos que las 8 piezas requeridas estén presentes en el mapa
        const todasPresentes = idsNecesarios.every(id => m[id]);

        // 3. Si el puntaje es 100 y las 8 están, ¡VICTORIA! 
        if (Math.round(score) >= 100 && todasPresentes) {
            detenerMonitor();
            if (typeof finalizarJuego === 'function') {
                finalizarJuego('victoria');
            }
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

    // Iniciar tan pronto como la página cargue
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', iniciarMonitor);
    } else {
        iniciarMonitor();
    }
})();
