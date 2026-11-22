// ============ SISTEMA DE IDIOMA UNIFICADO (idioma.js) ============
// Controla portada y juegos. Idioma POR DEFECTO: inglés.
// VERSIÓN FINAL: Incluye traducciones de reglas y personajes.

(function () {
    'use strict';

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
            
            // --- JUEGO DEL ÁRBOL (Estático) ---
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
            aria_music_off: 'Activar música',

            // --- JUEGO DEL ÁRBOL (Dinámico / JS) ---
            conf_title: 'Confirmar',
            conf_cancel: 'Cancelar',
            conf_accept: 'Aceptar',
            debug_real_score: 'Puntaje Real',
            debug_how_to_100_title: '📋 CÓMO LLEGAR AL 100',
            debug_how_to_100_msg: 'Coloca las 8 piezas en sus posiciones correctas. Usa la lupa para ver las coordenadas.',
            debug_diag_title: '🔧 DIAGNÓSTICO',
            debug_diag_yes: 'SÍ',
            debug_diag_no: 'NO',
            debug_diag_score: 'Puntaje >= 100',
            debug_diag_pieces: 'Las 8 presentes',
            result_msg_perfect: '¡Felicitaciones! Todas las relaciones están correctas y alcanzaste los 100 puntos. Has armado el Árbol con maestría.',
            result_msg_time: 'Se acabó el tiempo. ',
            result_msg_missing: 'Te faltan ',
            result_msg_points: ' puntos. ',
            result_msg_failed: 'Hay ',
            result_msg_relations_fail: ' relación(es) que no se cumplen. ',
            result_msg_partial: 'Hay ',
            result_msg_relations_partial: ' relación(es) casi correctas que puedes afinar. ',
            result_msg_review: 'Revisa abajo las marcadas con ~ o ✗.',
            result_title_perfect: '¡Árbol Perfecto!',
            result_title_completed: '¡Árbol Completado!',
            result_title_built: 'Árbol Armado',
            msg_remove_confirm: '¿Seguro que quieres quitar {nombre} de la escena?',

            // --- NOMBRES DE REGLAS (Basados en el ID de arbol-reglas.js) ---
            rule_completitud: 'Las 8 piezas presentes',
            rule_estrella_arriba: 'Estrella en la punta del Árbol',
            rule_cascanuez_pie: 'Cascanueces a los pies del Árbol',
            rule_bambalina_arbol: 'Bambalina sobre el Árbol',
            rule_bombilla_arbol: 'Bombilla sobre el Árbol',
            rule_lazo_arbol: 'Lazo sobre el Árbol',
            rule_osito_arbol: 'Osito sobre el Árbol',
            rule_baston_arbol: 'Bastón sobre el Árbol',
            rule_no_superposicion_adornos: 'Adornos no amontonados (sin superposición)',
            rule_orden_visual: 'Orden visual correcto (Estrella arriba, Cascanueces abajo)',

            // --- NOMBRES DE PERSONAJES (Basados en el ID de arbol-datos.js) ---
            char_arbol: 'el Árbol',
            char_bambalina: 'la Bambalina',
            char_baston: 'el Bastón',
            char_bombilla: 'la Bombilla',
            char_cascanuez: 'el Cascanueces',
            char_estrella: 'la Estrella',
            char_lazo: 'el Lazo',
            char_osito: 'el Osito'
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
            
            // --- JUEGO DEL ÁRBOL (Estático) ---
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
            aria_music_off: 'Play music',

            // --- JUEGO DEL ÁRBOL (Dinámico / JS) ---
            conf_title: 'Confirm',
            conf_cancel: 'Cancel',
            conf_accept: 'Accept',
            debug_real_score: 'Real Score',
            debug_how_to_100_title: '📋 HOW TO REACH 100',
            debug_how_to_100_msg: 'Place all 8 pieces in their correct positions. Use the magnifying glass to see coordinates.',
            debug_diag_title: '🔧 DIAGNOSTICS',
            debug_diag_yes: 'YES',
            debug_diag_no: 'NO',
            debug_diag_score: 'Score >= 100',
            debug_diag_pieces: 'All 8 present',
            result_msg_perfect: 'Congratulations! All relationships are correct and you reached 100 points. You have mastered the Tree.',
            result_msg_time: 'Time is up. ',
            result_msg_missing: 'You are missing ',
            result_msg_points: ' points. ',
            result_msg_failed: 'There are ',
            result_msg_relations_fail: ' relationship(s) that are not met. ',
            result_msg_partial: 'There are ',
            result_msg_relations_partial: ' relationship(s) almost correct that you can fine-tune. ',
            result_msg_review: 'Check below the ones marked with ~ or ✗.',
            result_title_perfect: 'Perfect Tree!',
            result_title_completed: 'Tree Completed!',
            result_title_built: 'Tree Built',
            msg_remove_confirm: 'Are you sure you want to remove {nombre} from the scene?',

            // --- NOMBRES DE REGLAS ---
            rule_completitud: 'All 8 pieces present',
            rule_estrella_arriba: 'Star at the top of the Tree',
            rule_cascanuez_pie: 'Nutcracker at the feet of the Tree',
            rule_bambalina_arbol: 'Valance on the Tree',
            rule_bombilla_arbol: 'Bulb on the Tree',
            rule_lazo_arbol: 'Bow on the Tree',
            rule_osito_arbol: 'Teddy Bear on the Tree',
            rule_baston_arbol: 'Candy Cane on the Tree',
            rule_no_superposicion_adornos: 'Ornaments not stacked (no overlap)',
            rule_orden_visual: 'Correct visual order (Star up, Nutcracker down)',

            // --- NOMBRES DE PERSONAJES ---
            char_arbol: 'the Tree',
            char_bambalina: 'the Valance',
            char_baston: 'the Candy Cane',
            char_bombilla: 'the Bulb',
            char_cascanuez: 'the Nutcracker',
            char_estrella: 'the Star',
            char_lazo: 'the Bow',
            char_osito: 'the Teddy Bear'
        }
    };

    let idiomaActual = 'en';

    function leerIdiomaGuardado() {
        try {
            const guardado = localStorage.getItem('idiomaPreferido');
            return (guardado === 'en' || guardado === 'es') ? guardado : 'en';
        } catch (e) { return 'en'; }
    }

    function guardarIdioma(valor) {
        try { localStorage.setItem('idiomaPreferido', valor); } catch (e) {}
    }

    function aplicarIdioma(idioma) {
        const t = TRADUCCIONES[idioma];
        if (!t) return;
        idiomaActual = idioma;

        if (t.page_title) document.title = t.page_title;
        else if (t.titulo) document.title = t.titulo;

        document.documentElement.setAttribute('lang', idioma);

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

        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (t[key]) el.textContent = t[key];
        });

        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (t[key]) el.setAttribute('placeholder', t[key]);
        });

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

        const btnMusicaMenu = document.getElementById('btnMusicaMenu');
        if (btnMusicaMenu && window.SistemaMusica) {
            const estaSonando = window.SistemaMusica.estaSonando ? window.SistemaMusica.estaSonando() : false;
            const ic = btnMusicaMenu.querySelector('.icono-musica');
            if (ic) ic.textContent = estaSonando ? '🔊' : '🔇';
            btnMusicaMenu.setAttribute('aria-label', estaSonando ? t.aria_music_on : t.aria_music_off);
            btnMusicaMenu.classList.toggle('activa', estaSonando);
        }

        guardarIdioma(idioma);
    }

    function alternarIdioma() {
        const nuevo = (idiomaActual === 'es') ? 'en' : 'es';
        aplicarIdioma(nuevo);
    }

    window.SistemaIdioma = {
        alternar: alternarIdioma,
        aplicar: aplicarIdioma,
        actual: function () { return idiomaActual; },
        traducciones: TRADUCCIONES
    };

    document.addEventListener('DOMContentLoaded', function () {
        const btnIdiomaPortada = document.querySelector('.btn-idioma');
        if (btnIdiomaPortada) {
            btnIdiomaPortada.addEventListener('click', function (e) { e.preventDefault(); alternarIdioma(); });
        }

        const btnIdiomaMenu = document.getElementById('btnIdiomaMenu');
        if (btnIdiomaMenu) {
            btnIdiomaMenu.addEventListener('click', function (e) {
                e.preventDefault(); e.stopPropagation(); alternarIdioma();
            });
        }

        const btnMusicaMenu = document.getElementById('btnMusicaMenu');
        if (btnMusicaMenu && window.SistemaMusica) {
            btnMusicaMenu.addEventListener('click', function (e) {
                e.preventDefault(); e.stopPropagation(); window.SistemaMusica.alternar();
            });
        }

        aplicarIdioma(leerIdiomaGuardado());
    });
})();
