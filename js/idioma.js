// ============ SISTEMA DE IDIOMA UNIFICADO (idioma.js) ============
// Controla tanto la portada como los juegos (Árbol/Belén).
// Idioma POR DEFECTO: inglés. La preferencia se guarda en localStorage.

(function () {
    'use strict';

    // Diccionario de traducciones unificado (Portada + Juego del Árbol)
    const TRADUCCIONES = {
        es: {
            // --- PORTADA ---
            titulo: 'Navidad Mágica',
            altPortada: 'Navidad Mágica - elige decorar el árbol o armar el Belén',
            btnArbol: 'Decorar árbol',
            btnBelen: 'Armar Belén',
            portadaH: 'img/belen/portada-horizontal.jpg',
            portadaV: 'img/belen/portada-vertical.jpg',
            banderaSiguiente: '🇬🇧',
            ariaBandera: 'Cambiar idioma a inglés',
            
            // --- JUEGO DEL ÁRBOL ---
            page_title: 'Árbol Navideño',
            menu_return: 'VOLVER',
            menu_donate: 'DONAR',
            menu_best: 'MEJORES',
            menu_music: 'Música',
            menu_lang: 'Idioma',
            clock_remaining: '⏱ Restan',
            clock_final: '🔥 Final',
            progress_label: 'Progreso del Árbol',
            ctrl_horizontal: '↔ Horizontal',
            ctrl_vertical: '↕ Vertical',
            ctrl_size: '🔍 Tamaño',
            ctrl_rotate: '🔄 Girar',
            btn_flip: '🪞 Voltear',
            btn_duplicate: '📋 Duplicar',
            btn_layers: '📚 Capas',
            btn_remove: '✕ Quitar',
            modal_layers_title: 'Orden de Capas',
            btn_close: 'Cerrar',
            modal_result_title: 'Veredicto',
            modal_result_details: 'Detalle de relaciones:',
            modal_name_label: '✍️ Escribe tu nombre para la tabla de honor:',
            modal_name_placeholder: 'Tu nombre aquí',
            btn_save_name: 'Guardar y Ver Tabla',
            modal_honor_title: '🏆 Tabla de Honor Local',
            btn_restart: '🔄 REINICIAR ÁRBOL',
            btn_continue: '🎄 Seguir decorando tu Árbol',
            debug_title: '🔍 Lupa Matemática',
            debug_loading: 'Cargando datos...',
            debug_close: 'Cerrar',
            debug_btn: '🔍 Ver Solución',
            aria_music_on: 'Pausar música',
            aria_music_off: 'Activar música'
        },
        en: {
            // --- PORTADA ---
            titulo: 'Magic Christmas',
            altPortada: 'Magic Christmas - choose to decorate the tree or set up the nativity',
            btnArbol: 'Decorate tree',
            btnBelen: 'Set up nativity',
            portadaH: 'img/portada_en_horizontal.jpg',
            portadaV: 'img/portada_en_vertical.jpg',
            banderaSiguiente: '🇪🇸',
            ariaBandera: 'Switch language to Spanish',
            
            // --- JUEGO DEL ÁRBOL ---
            page_title: 'Christmas Tree',
            menu_return: 'RETURN',
            menu_donate: 'DONATE',
            menu_best: 'BEST',
            menu_music: 'Music',
            menu_lang: 'Language',
            clock_remaining: '⏱ Remaining',
            clock_final: '🔥 Final',
            progress_label: 'Tree Progress',
            ctrl_horizontal: '↔ Horizontal',
            ctrl_vertical: '↕ Vertical',
            ctrl_size: '🔍 Size',
            ctrl_rotate: '🔄 Rotate',
            btn_flip: '🪞 Flip',
            btn_duplicate: '📋 Duplicate',
            btn_layers: '📚 Layers',
            btn_remove: '✕ Remove',
            modal_layers_title: 'Layer Order',
            btn_close: 'Close',
            modal_result_title: 'Verdict',
            modal_result_details: 'Relationship details:',
            modal_name_label: '✍️ Write your name for the hall of fame:',
            modal_name_placeholder: 'Your name here',
            btn_save_name: 'Save and View Table',
            modal_honor_title: '🏆 Local Hall of Fame',
            btn_restart: '🔄 RESTART TREE',
            btn_continue: '🎄 Continue decorating your Tree',
            debug_title: '🔍 Math Magnifying Glass',
            debug_loading: 'Loading data...',
            debug_close: 'Close',
            debug_btn: '🔍 View Solution',
            aria_music_on: 'Pause music',
            aria_music_off: 'Play music'
        }
    };

    let idiomaActual = 'en'; // POR DEFECTO INGLÉS

    function leerIdiomaGuardado() {
        try {
            const guardado = localStorage.getItem('idiomaPreferido');
            return (guardado === 'en' || guardado === 'es') ? guardado : 'en';
        } catch (e) {
            return 'en';
        }
    }

    function guardarIdioma(valor) {
        try {
            localStorage.setItem('idiomaPreferido', valor);
        } catch (e) {}
    }

    // Aplicar el idioma a todos los elementos de la página (de forma segura)
    function aplicarIdioma(idioma) {
        const t = TRADUCCIONES[idioma];
        if (!t) return;
        idiomaActual = idioma;

        // 1. Título de la pestaña (funciona en todas las páginas)
        if (t.page_title) document.title = t.page_title;
        else if (t.titulo) document.title = t.titulo;

        // 2. Atributo lang del HTML
        document.documentElement.setAttribute('lang', idioma);

        // 3. Lógica específica de la PORTADA (solo se ejecuta si los elementos existen)
        const source = document.querySelector('.portada source');
        const img = document.querySelector('.portada img');
        if (source && t.portadaH) source.setAttribute('srcset', t.portadaH);
        if (img) {
            if (t.portadaV) img.setAttribute('src', t.portadaV);
            if (t.altPortada) img.setAttribute('alt', t.altPortada);
        }

        const btnArbol = document.querySelector('.btn-arbol');
        const btnBelen = document.querySelector('.btn-belen');
        if (btnArbol && t.btnArbol) btnArbol.setAttribute('aria-label', t.btnArbol);
        if (btnBelen && t.btnBelen) btnBelen.setAttribute('aria-label', t.btnBelen);

        // 4. Lógica específica del JUEGO (traduce todos los elementos con data-i18n)
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (t[key]) el.textContent = t[key];
        });

        // 5. Traducir placeholders (como el input del nombre)
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (t[key]) el.setAttribute('placeholder', t[key]);
        });

        // 6. Actualizar botón de bandera (ya sea en portada o en menú del juego)
        const btnIdiomaPortada = document.querySelector('.btn-idioma');
        const btnIdiomaMenu = document.getElementById('btnIdiomaMenu');
        const btnIdiomaActivo = btnIdiomaMenu || btnIdiomaPortada;
        
        if (btnIdiomaActivo && t.banderaSiguiente) {
            const icono = btnIdiomaActivo.querySelector('.bandera');
            if (icono) icono.textContent = t.banderaSiguiente;
            if (t.ariaBandera) {
                btnIdiomaActivo.setAttribute('aria-label', t.ariaBandera);
                btnIdiomaActivo.setAttribute('title', t.ariaBandera);
            }
        }

        // 7. Actualizar botón de música en el menú (conservar su estado visual)
        const btnMusicaMenu = document.getElementById('btnMusicaMenu');
        if (btnMusicaMenu && window.SistemaMusica) {
            const estaSonando = window.SistemaMusica.estaSonando ? window.SistemaMusica.estaSonando() : false;
            const ic = btnMusicaMenu.querySelector('.icono-musica');
            if (ic) ic.textContent = estaSonando ? '🔊' : '🔇';
            btnMusicaMenu.setAttribute('aria-label', estaSonando ? t.aria_music_on : t.aria_music_off);
            btnMusicaMenu.classList.toggle('activa', estaSonando);
        }

        // 8. Guardar preferencia
        guardarIdioma(idioma);
    }

    // Alternar idioma al tocar el botón
    function alternarIdioma() {
        const nuevo = (idiomaActual === 'es') ? 'en' : 'es';
        aplicarIdioma(nuevo);
    }

    // Exponer al window por si otros scripts lo necesitan
    window.SistemaIdioma = {
        alternar: alternarIdioma,
        aplicar: aplicarIdioma,
        actual: function () { return idiomaActual; },
        traducciones: TRADUCCIONES
    };

    // Inicializar cuando el DOM esté listo
    document.addEventListener('DOMContentLoaded', function () {
        // A. Listener para el botón de la PORTADA
        const btnIdiomaPortada = document.querySelector('.btn-idioma');
        if (btnIdiomaPortada) {
            btnIdiomaPortada.addEventListener('click', function (e) {
                e.preventDefault();
                alternarIdioma();
            });
        }

        // B. Listener para el botón de idioma DENTRO DEL MENÚ DEL JUEGO
        const btnIdiomaMenu = document.getElementById('btnIdiomaMenu');
        if (btnIdiomaMenu) {
            btnIdiomaMenu.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation(); // Evita que el menú se cierre al tocar la bandera
                alternarIdioma();
            });
        }

        // C. Listener para el botón de música DENTRO DEL MENÚ DEL JUEGO
        const btnMusicaMenu = document.getElementById('btnMusicaMenu');
        if (btnMusicaMenu && window.SistemaMusica) {
            btnMusicaMenu.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                window.SistemaMusica.alternar();
            });
        }

        // Restaurar idioma elegido anteriormente (o inglés por defecto)
        aplicarIdioma(leerIdiomaGuardado());
    });
})();
