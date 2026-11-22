// ============ SISTEMA DE MÚSICA NAVIDEÑA (musica.js) ============
// Audios REALES de Wikimedia Commons (villancicos de dominio público),
// porque los archivos locales eran video disfrazado de mp3 y Chrome los rechazaba.
// Tolerante a fallos: si una canción no carga, salta a la siguiente.
// Bucle infinito de 4 canciones. Solo arranca con toque explícito del usuario.

(function () {
    'use strict';

    const playlist = [
        'https://commons.wikimedia.org/wiki/Special:FilePath/Jingle_Bells_Or_The_One_Horse_Open_Sleigh_Complete.ogg',
        'https://commons.wikimedia.org/wiki/Special:FilePath/Silent_Nights_-_Concert_Band_-_United_States_Air_Force_Band_of_the_Rockies.mp3',
        'https://commons.wikimedia.org/wiki/Special:FilePath/It_Came_Upon_the_Midnight_Clear_-_Diplomats_-_United_States_Air_Force_Band.mp3',
        'https://commons.wikimedia.org/wiki/Special:FilePath/Joy_to_the_World_-_Diplomats_-_United_States_Air_Force_Band.mp3'
    ];

    let indice = 0;
    let audio = null;
    let sonando = false;
    let intentosSeguidos = 0;

    function crearAudio() {
        if (audio) return;
        audio = new Audio();
        audio.preload = 'auto';
        audio.volume = 0.6;

        audio.addEventListener('ended', function () {
            intentosSeguidos = 0;
            indice = (indice + 1) % playlist.length;
            audio.src = playlist[indice];
            const p = audio.play();
            if (p && p.catch) p.catch(function () { fijarEstado(false); });
        });

        audio.addEventListener('error', function () {
            intentosSeguidos++;
            if (intentosSeguidos < playlist.length) {
                indice = (indice + 1) % playlist.length;
                audio.src = playlist[indice];
                const p = audio.play();
                if (p && p.catch) p.catch(function () { fijarEstado(false); });
            } else {
                fijarEstado(false);
                document.querySelectorAll('.btn-musica, .btn-musica-menu').forEach(function (b) {
                    const ic = b.querySelector('.icono-musica');
                    if (ic) ic.textContent = '⚠️';
                });
                console.error('Ninguna canción pudo cargarse.');
            }
        });
    }

    function fijarEstado(v) {
        sonando = v;
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
        intentosSeguidos = 0;
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

    window.SistemaMusica = {
        alternar: alternar,
        reproducir: reproducir,
        pausar: pausar,
        estaSonando: function () { return sonando; }
    };

    document.addEventListener('DOMContentLoaded', function () {
        const btnPortada = document.querySelector('.btn-musica');
        if (btnPortada) {
            btnPortada.addEventListener('click', function (e) { e.preventDefault(); alternar(); });
            btnPortada.addEventListener('touchstart', function (e) { e.preventDefault(); alternar(); }, { passive: false });
        }
        const btnMenu = document.getElementById('btnMusicaMenu');
        if (btnMenu) {
            btnMenu.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); alternar(); });
            btnMenu.addEventListener('touchstart', function (e) { e.preventDefault(); e.stopPropagation(); alternar(); }, { passive: false });
        }
    });
})();
