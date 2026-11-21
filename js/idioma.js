// ============ SISTEMA DE IDIOMA (idioma.js) ============
// Alterna entre español e inglés. Idioma POR DEFECTO: inglés.
// Cambia textos, imágenes de portada y etiquetas accesibles.
// La preferencia se guarda en localStorage.

(function () {
    'use strict';

    // Diccionario de traducciones (cero hardcode: todo se controla aquí)
    const TRADUCCIONES = {
        es: {
            titulo: 'Navidad Mágica',
            altPortada: 'Navidad Mágica - elige decorar el árbol o armar el Belén',
            btnArbol: 'Decorar árbol',
            btnBelen: 'Armar Belén',
            portadaH: 'img/belen/portada-horizontal.jpg',
            portadaV: 'img/belen/portada-vertical.jpg',
            banderaSiguiente: '🇬🇧', // lo que verás para cambiar a inglés
            ariaBandera: 'Cambiar idioma a inglés'
        },
        en: {
            titulo: 'Magic Christmas',
            altPortada: 'Magic Christmas - choose to decorate the tree or set up the nativity',
            btnArbol: 'Decorate tree',
            btnBelen: 'Set up nativity',
            portadaH: 'img/portada_en_horizontal.jpg',
            portadaV: 'img/portada_en_vertical.jpg',
            banderaSiguiente: '🇪🇸', // lo que verás para cambiar a español
            ariaBandera: 'Switch language to Spanish'
        }
    };

    let idiomaActual = 'en'; // <-- POR DEFECTO INGLÉS

    function leerIdiomaGuardado() {
        try {
            const guardado = localStorage.getItem('idiomaPreferido');
            return (guardado === 'en' || guardado === 'es') ? guardado : 'en'; // <-- respaldo inglés
        } catch (e) {
            return 'en'; // <-- respaldo inglés
        }
    }

    function guardarIdioma(valor) {
        try {
            localStorage.setItem('idiomaPreferido', valor);
        } catch (e) {
            // si falla, no pasa nada
        }
    }

    // Aplicar el idioma a todos los elementos de la página
    function aplicarIdioma(idioma) {
        const t = TRADUCCIONES[idioma];
        if (!t) return;
        idiomaActual = idioma;

        // 1. Título de la pestaña
        document.title = t.titulo;

        // 2. Atributo lang del HTML (importante para lectores de pantalla)
        document.documentElement.setAttribute('lang', idioma);

        // 3. Imágenes de portada (horizontal y vertical)
        const source = document.querySelector('.portada source');
        const img = document.querySelector('.portada img');
        if (source) source.setAttribute('srcset', t.portadaH);
        if (img) {
            img.setAttribute('src', t.portadaV);
            img.setAttribute('alt', t.altPortada);
        }

        // 4. Etiquetas accesibles de los botones invisibles
        const btnArbol = document.querySelector('.btn-arbol');
        const btnBelen = document.querySelector('.btn-belen');
        if (btnArbol) btnArbol.setAttribute('aria-label', t.btnArbol);
        if (btnBelen) btnBelen.setAttribute('aria-label', t.btnBelen);

        // 5. Botón de bandera (texto e info accesible)
        const btnIdioma = document.querySelector('.btn-idioma');
        if (btnIdioma) {
            const icono = btnIdioma.querySelector('.bandera');
            if (icono) icono.textContent = t.banderaSiguiente;
            btnIdioma.setAttribute('aria-label', t.ariaBandera);
            btnIdioma.setAttribute('title', t.ariaBandera);
        }

        // 6. Guardar preferencia
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
        const btnIdioma = document.querySelector('.btn-idioma');
        if (btnIdioma) {
            btnIdioma.addEventListener('click', function (e) {
                e.preventDefault();
                alternarIdioma();
            });
        }
        // Restaurar idioma elegido anteriormente (o inglés por defecto)
        aplicarIdioma(leerIdiomaGuardado());
    });
})();
