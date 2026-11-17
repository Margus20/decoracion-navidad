// ============ MONITOR DE VICTORIA (belen-monitor.js) ============
// Vigila el puntaje y dispara la celebración al instante al llegar a 100 
// con las 8 piezas únicas, sin depender de eventos de movimiento o arrastre.
(function () {
    const INTERVALO_MS = 400; // Revisa cada 400 milisegundos
    let intervaloMonitor = null;

    function revisarVictoria() {
        // Si el juego ya terminó (por victoria o por tiempo), detener el vigilante
        if (typeof juegoTerminado !== 'undefined' && juegoTerminado) {
            detenerMonitor();
            return;
        }

        const figuras = document.querySelectorAll('.figura-activa');
        
        // Deben haber exactamente 8 piezas en el escenario
        if (figuras.length !== 8) return;

        // Y deben ser todas únicas (una de cada tipo necesario)
        const todasUnicas = idsNecesarios.every(id => 
            figuras.filter(f => f.dataset.personaje === id).length === 1
        );
        
        if (!todasUnicas) return;

        // Verificar si el puntaje alcanzó o superó 100
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

    // Iniciar el monitor tan pronto como el HTML esté cargado
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', iniciarMonitor);
    } else {
        iniciarMonitor();
    }
})();
