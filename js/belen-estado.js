// ============ ESTADO Y TRADUCCIÓN (belen-estado.js) ============

// ============ VARIABLES DE TIEMPO Y ESTADO ============
let tiempoGlobalRestante = 8 * 60;
let tiempoFinalRestante = 45;
let intervaloGlobal = null;
let intervaloFinal = null;
let juegoTerminado = false;
let modoLibre = false;

// Helper seguro para obtener traducciones dinámicas en acciones del Belén
function tBelenAcciones(key) {
    if (window.SistemaIdioma && window.SistemaIdioma.traducciones) {
        const lang = window.SistemaIdioma.actual();
        return window.SistemaIdioma.traducciones[lang][key] || window.SistemaIdioma.traducciones['es'][key] || key;
    }
    const fallback = {
        msg_remove_confirm: '¿Seguro que quieres quitar {nombre} de la escena?',
        char_belen_maria: 'María', char_belen_jose: 'José', char_belen_jesus: 'el Niño Jesús',
        char_belen_estrella: 'la Estrella', char_belen_oveja: 'la Oveja', char_belen_burro: 'el Burro',
        char_belen_pesebre: 'el Pesebre', char_belen_cuna: 'la Cuna',
        honor_anonymous: 'Anónimo',
        honor_empty: 'Aún no hay registros. ¡Sé el primero!'
    };
    return fallback[key] || key;
}
