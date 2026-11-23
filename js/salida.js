// ============ PROTECCIÓN DE SALIDA (salida.js) ============
// Protege contra salidas accidentales: cerrar pestaña, recargar o pulsar "Volver".
// No altera ninguna lógica del juego. Se carga al final en arbol.html y belen.html.
(function () {
    'use strict';

    // Diccionario local bilingüe, independiente de idioma.js.
    const TXT = {
        es: {
            mensaje: '¿Salir del juego? Si sales ahora perderás el progreso de esta partida.'
        },
        en: {
            mensaje: 'Leave the game? If you leave now, you will lose the progress of this game.'
        }
    };

    function t(key) {
        const lang = (window.SistemaIdioma && window.SistemaIdioma.actual) ? window.SistemaIdioma.actual() : 'es';
        return (TXT[lang] && TXT[lang][key]) || TXT['es'][key];
    }

    // 1) Aviso al cerrar pestaña o recargar (diálogo nativo del navegador).
    window.addEventListener('beforeunload', function (e) {
        if (typeof juegoTerminado !== 'undefined' && juegoTerminado) return;
        e.preventDefault();
        e.returnValue = '';
    });

    // 2) Cuadro de confirmación personalizado al pulsar los botones "VOLVER".
    function confirmarSalida(alAceptar) {
        const mensaje = t('mensaje');
        if (typeof confirmarAccion === 'function') {
            confirmarAccion(mensaje, alAceptar);
        } else if (window.confirm(mensaje)) {
            alAceptar();
        }
    }

    function interceptarVolver() {
        const enlaces = document.querySelectorAll('a[href="index.html"]');
        enlaces.forEach(function (enlace) {
            if (enlace.dataset.salidaProtegida) return;
            enlace.dataset.salidaProtegida = 'true';
            enlace.addEventListener('click', function (e) {
                if (typeof juegoTerminado !== 'undefined' && juegoTerminado) return;
                e.preventDefault();
                e.stopPropagation();
                const destino = enlace.getAttribute('href');
                confirmarSalida(function () {
                    window.location.href = destino;
                });
            });
        });
    }

    document.addEventListener('DOMContentLoaded', interceptarVolver);
})();
