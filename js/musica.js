// ============ SISTEMA DE MÚSICA NAVIDEÑA (musica.js) ============
// Bucle infinito de 4 canciones en formato MP4.
// Solo arranca con un toque explícito del usuario.

(function () {
    'use strict';

    const playlist = [
        'audio/jingle_bells.mp4',
        'audio/o_christmas_tree.mp4',
        'audio/we_wish_you.mp4',
        'audio/twelve_days.mp4'
    ];

    let indice = 0;
    let audio = null;
    let sonando = false;

    function crearAudio() {
        if (audio) return;
        audio = new Audio();
        audio.preload = 'auto';
        audio.volume = 0.6;

        audio.addEventListener('ended', function () {
            indice = (indice + 1) % playlist.length;
            audio.src = playlist[indice];
            const p = audio.play();
            if (p && p.catch) p.catch(function () { fijarEstado(false); });
        });

        audio.addEventListener('error', function () {
            fijarEstado(false);
            const btn = document.querySelector('.btn-musica');
            if (btn) {
                const ic = btn.querySelector('.icono-musica');
                if (ic) ic.textContent = '⚠️';
            }
            console.error('No se pudo cargar la canción:', audio.src);
        });
    }

    function fijarEstado(v) {
        sonando = v;
        document.querySelectorAll('.btn-musica').forEach(function (b) {
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

    window.SistemaMusica = { alternar: alternar, reproducir: reproducir, pausar: pausar };

    document.addEventListener('DOMContentLoaded', function () {
        document.querySelectorAll('.btn-musica').forEach(function (b) {
            b.addEventListener('click', function (e) { e.preventDefault(); alternar(); });
            b.addEventListener('touchstart', function (e) { e.preventDefault(); alternar(); }, { passive: false });
        });
    });
})();
