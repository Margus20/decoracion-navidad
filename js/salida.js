// ============ PROTECCIÓN DE SALIDA (salida.js) ============
// Protege contra salidas accidentales: cerrar pestaña, recargar o pulsar "Volver".
// No altera ninguna lógica del juego. Se carga al final en arbol.html y belen.html.
// Incluye un modal personalizado con la paleta de colores y tipografía del juego.
(function () {
    'use strict';

    // Diccionario local bilingüe, independiente de idioma.js.
    const TXT = {
        es: {
            titulo: 'CONFIRMAR SALIDA',
            mensaje: '¿Deseas salir del juego? Perderás el progreso de esta partida.',
            cancelar: 'CANCELAR',
            aceptar: 'SALIR'
        },
        en: {
            titulo: 'LEAVE GAME?',
            mensaje: 'Do you want to leave the game? You will lose the progress of this game.',
            cancelar: 'CANCEL',
            aceptar: 'LEAVE'
        }
    };

    function t(key) {
        const lang = (window.SistemaIdioma && window.SistemaIdioma.actual) ? window.SistemaIdioma.actual() : 'es';
        return (TXT[lang] && TXT[lang][key]) || TXT['es'][key];
    }

    // 1) Aviso al cerrar pestaña o recargar (diálogo nativo del navegador, no personalizable por seguridad).
    window.addEventListener('beforeunload', function (e) {
        if (typeof juegoTerminado !== 'undefined' && juegoTerminado) return;
        e.preventDefault();
        e.returnValue = '';
    });

    // 2) Cuadro de confirmación personalizado (estilo del juego + bilingüe) al pulsar "VOLVER".
    function mostrarModalSalida(alAceptar) {
        // Evitar duplicados si ya está abierto
        if (document.getElementById('overlaySalidaPersonalizado')) return;

        const overlay = document.createElement('div');
        overlay.id = 'overlaySalidaPersonalizado';
        overlay.style.cssText = 'position:fixed; inset:0; background:rgba(0,0,0,0.75); display:flex; align-items:center; justify-content:center; z-index:100000; padding:20px;';

        const panel = document.createElement('div');
        panel.style.cssText = 'background:linear-gradient(160deg, #23233b 0%, #16162a 100%); border:2px solid #ffd700; border-radius:16px; padding:28px 24px; max-width:420px; width:100%; text-align:center; box-shadow:0 10px 30px rgba(0,0,0,0.8);';

        panel.innerHTML = 
            '<h3 style="font-family:\'Bebas Neue\',sans-serif; color:#ffd700; font-size:2.2rem; letter-spacing:1.5px; text-transform:uppercase; margin:0 0 12px;">' + t('titulo') + '</h3>' +
            '<p style="color:#ffffff; font-family:sans-serif; font-size:1.1rem; line-height:1.5; margin:0 0 24px;">' + t('mensaje') + '</p>' +
            '<div style="display:flex; gap:14px; justify-content:center; flex-wrap:wrap;">' +
                '<button id="btnSalidaNo" style="font-family:\'Bebas Neue\',sans-serif; font-size:1.3rem; letter-spacing:1px; padding:10px 28px; border-radius:10px; border:2px solid #ffd700; background:#d32f2f; color:#fff; cursor:pointer; transition:transform 0.1s;">' + t('cancelar') + '</button>' +
                '<button id="btnSalidaSi" style="font-family:\'Bebas Neue\',sans-serif; font-size:1.3rem; letter-spacing:1px; padding:10px 28px; border-radius:10px; border:2px solid #ffd700; background:#2e7d32; color:#fff; cursor:pointer; transition:transform 0.1s;">' + t('aceptar') + '</button>' +
            '</div>';

        overlay.appendChild(panel);
        document.body.appendChild(overlay);

        // Efecto visual simple al tocar los botones
        const btnNo = document.getElementById('btnSalidaNo');
        const btnSi = document.getElementById('btnSalidaSi');
        [btnNo, btnSi].forEach(btn => {
            btn.addEventListener('mousedown', () => btn.style.transform = 'scale(0.95)');
            btn.addEventListener('mouseup', () => btn.style.transform = 'scale(1)');
            btn.addEventListener('touchstart', () => btn.style.transform = 'scale(0.95)');
            btn.addEventListener('touchend', () => btn.style.transform = 'scale(1)');
        });

        function cerrarModal() {
            const o = document.getElementById('overlaySalidaPersonalizado');
            if (o) o.remove();
        }

        btnNo.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            cerrarModal();
        });

        btnSi.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            cerrarModal();
            alAceptar();
        });

        // Tocar el fondo oscuro también cancela la salida
        overlay.addEventListener('click', function (e) {
            if (e.target === overlay) cerrarModal();
        });
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
                mostrarModalSalida(function () {
                    window.location.href = destino;
                });
            });
        });
    }

    document.addEventListener('DOMContentLoaded', interceptarVolver);
})();
