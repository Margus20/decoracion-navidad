// ============ SISTEMA DE MÚSICA NAVIDEÑA (musica.js) ============
// Versión limpia y estable para archivos .mp3 reales.
// Bucle infinito de 4 canciones. Solo arranca con toque explícito del usuario.
// Si un archivo no carga, el ícono muestra ⚠️ para avisar del problema.

(function () {
    'use strict';

    const playlist = [
        'audio/jingle_bells.mp3',
        'audio/o_christmas_tree.mp3',
        'audio/we_wish_you.mp3',
        'audio/twelve_days.mp3'
    ];

    let indice = 0;
    let audio = null;
    let sonando = false;

    function crearAudio() {
        if (audio) return;
        audio = new Audio();
        audio.preload = 'auto';
        audio.volume = 0.6;

        // Al terminar una canción, pasar a la siguiente (bucle infinito)
        audio.addEventListener('ended', function () {
            indice = (indice + 1) % playlist.length;
            audio.src = playlist[indice];
            const p = audio.play();
            if (p && p.catch) p.catch(function () { fijarEstado(false); });
        });

        // Si un archivo no carga, avisar con el triángulo
        audio.addEventListener('error', function () {
            fijarEstado(false);
            document.querySelectorAll('.btn-musica, .btn-musica-menu').forEach(function (b) {
                const ic = b.querySelector('.icono-musica');
                if (ic) ic.textContent = '⚠️';
            });
            console.error('No se pudo cargar la canción:', audio.src);
        });
    }

    function fijarEstado(v) {
        sonando = v;
        // Actualizar TODOS los botones de música (portada + menú hamburguesa)
        document.querySelectorAll('.btn-musica, .btn-musica-menu').forEach(function (b) {
            const ic = b.querySelector('.icono-musica');
            if (ic && ic.textContent !== '⚠️') ic.textContent = v ? '🔊' : '🔇';
            b.classList.toggle('activa', v);
            b.setAttribute('aria-label', v ? 'Pause music' : 'Play music');
            b.setAttribute('title', v ? 'Pause music' : 'Play music');
        });
    }

    function reproducir() {
        crearAudio();
        audio.src = playlist[indice];
        const p = audio.play();
        if (p && p.then) {
            p.then(function () { fijarEstado(true); })
             .catch(function () { fijarEstado(false); });
        } else {
            fijarEstado(true);
        }
    }

    function pausar() {
        if (audio) audio.pause();
        fijarEstado(false);
    }

    function alternar() {
        if (sonando) pausar(); else reproducir();
    }

    // Exponer al window para que idioma.js y el menú puedan consultarlo
    window.SistemaMusica = {
        alternar: alternar,
        reproducir: reproducir,
        pausar: pausar,
        estaSonando: function () { return sonando; }
    };

    // Inicializar cuando el DOM esté listo
    document.addEventListener('DOMContentLoaded', function () {
        // Botón de la portada
        const btnPortada = document.querySelector('.btn-musica');
        if (btnPortada) {
            btnPortada.addEventListener('click', function (e) { e.preventDefault(); alternar(); });
            btnPortada.addEventListener('touchstart', function (e) { e.preventDefault(); alternar(); }, { passive: false });
        }

        // Botón dentro del menú hamburguesa del juego
        const btnMenu = document.getElementById('btnMusicaMenu');
        if (btnMenu) {
            btnMenu.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation(); // Evita que el menú se cierre al tocar
                alternar();
            });
            btnMenu.addEventListener('touchstart', function (e) {
                e.preventDefault();
                e.stopPropagation();
                alternar();
            }, { passive: false });
        }
    });
})();
