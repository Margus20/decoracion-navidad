// ============ MONITOR DE VICTORIA INSTANTÁNEA ============
(function () {
    const INTERVALO_MS = 400;
    let intervaloMonitor = null;

    function revisarVictoria() {
        if (typeof juegoTerminado !== 'undefined' && juegoTerminado) {
            detenerMonitor();
            return;
        }

        const figuras = document.querySelectorAll('.figura-activa');
        if (figuras.length !== 8) return;

        const todasUnicas = idsNecesarios.every(id => 
            figuras.filter(f => f.dataset.personaje === id).length === 1
        );
        
        if (!todasUnicas) return;

        const score = calcularScoreGeneral();
        
        // Disparar si el puntaje redondeado es 100 (o 99.5+ por seguridad de decimales)
        if (score >= 99.5) {
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
