// ============ REGLAS DE PUNTUACIÓN (belen-reglas.js) ============
const criterios = [
    { id: 'completitud', nombre: 'Las 8 piezas presentes', peso: 12, eval: (m) => idsNecesarios.filter(id => m[id]).length / idsNecesarios.length },
    { id: 'jesus_cuna', nombre: 'Niño Jesús en la Cuna', peso: 12, eval: (m) => {
        if (!m.jesus || !m.cuna) return 0;
        if (dentroDe(m.jesus, m.cuna)) return 1;
        if (cerca(m.jesus, m.cuna, 16)) return 0.8;
        if (cerca(m.jesus, m.cuna, 30)) return 0.5;
        return 0;
    }},
    { id: 'cuna_pesebre', nombre: 'Cuna dentro del Pesebre', peso: 12, eval: (m) => {
        if (!m.cuna || !m.pesebre) return 0;
        if (dentroDe(m.cuna, m.pesebre)) return 1;
        if (cerca(m.cuna, m.pesebre, 18)) return 0.8;
        if (cerca(m.cuna, m.pesebre, 32)) return 0.5;
        return 0;
    }},
    { id: 'estrella_arriba', nombre: 'Estrella arriba del Pesebre', peso: 10, eval: (m) => {
        if (!m.estrella || !m.pesebre) return 0;
        let pts = centroY(m.estrella) < centroY(m.pesebre) ? 1 : (centroY(m.estrella) < centroY(m.pesebre) + 60 ? 0.5 : 0);
        if (pts > 0) {
            for (const pieza of [m.maria, m.jose, m.jesus, m.cuna, m.burro, m.oveja]) {
                if (pieza && centroDentroDe(m.estrella, pieza)) { pts = 0; break; }
            }
        }
        return pts;
    }},
    { id: 'maria_pesebre', nombre: 'María cerca del Pesebre', peso: 10, eval: (m) => {
        if (!m.maria || !m.pesebre) return 0;
        let pts = cerca(m.maria, m.pesebre, 24) ? 1 : (cerca(m.maria, m.pesebre, 38) ? 0.6 : 0);
        if (pts > 0) {
            for (const pieza of [m.estrella, m.cuna, m.jesus, m.burro, m.oveja]) {
                if (pieza && centroDentroDe(m.maria, pieza)) { pts = 0; break; }
            }
            if (!orientacionCorrecta(m.maria, m.pesebre, true)) pts = 0.5;
        }
        return pts;
    }},
    { id: 'jose_pesebre', nombre: 'José cerca del Pesebre', peso: 10, eval: (m) => {
        if (!m.jose || !m.pesebre) return 0;
        let pts = cerca(m.jose, m.pesebre, 24) ? 1 : (cerca(m.jose, m.pesebre, 38) ? 0.6 : 0);
        if (pts > 0) {
            for (const pieza of [m.estrella, m.cuna, m.jesus, m.burro, m.oveja]) {
                if (pieza && centroDentroDe(m.jose, pieza)) { pts = 0; break; }
            }
            if (!orientacionCorrecta(m.jose, m.pesebre, true)) pts = 0.5;
        }
        return pts;
    }},
    { id: 'oveja_suelo', nombre: 'Oveja en el suelo', peso: 9, eval: (m) => {
        if (!m.oveja || !m.pesebre) return 0;
        const enSuelo = centroY(m.oveja) > centroY(m.pesebre);
        let pts = (enSuelo && distPct(m.oveja, m.pesebre) <= 34) ? 1 : (enSuelo ? 0.5 : 0);
        if (pts > 0) {
            for (const pieza of [m.maria, m.jose, m.cuna, m.jesus, m.estrella]) {
                if (pieza && centroDentroDe(m.oveja, pieza)) { pts = 0; break; }
            }
            if (pts === 1 && !ladoAnimalOk(m, m.oveja)) pts = 0.5;
            if (!orientacionCorrecta(m.oveja, m.pesebre, true)) pts = 0.5;
        }
        return pts;
    }},
    { id: 'burro_suelo', nombre: 'Burro en el suelo', peso: 9, eval: (m) => {
        if (!m.burro || !m.pesebre) return 0;
        const enSuelo = centroY(m.burro) > centroY(m.pesebre);
        let pts = (enSuelo && distPct(m.burro, m.pesebre) <= 34) ? 1 : (enSuelo ? 0.5 : 0);
        if (pts > 0) {
            for (const pieza of [m.maria, m.jose, m.cuna, m.jesus, m.estrella]) {
                if (pieza && centroDentroDe(m.burro, pieza)) { pts = 0; break; }
            }
            if (pts === 1 && !ladoAnimalOk(m, m.burro)) pts = 0.5;
            if (!orientacionCorrecta(m.burro, m.pesebre, false)) pts = 0.5;
        }
        return pts;
    }},
    { id: 'capas', nombre: 'Orden visual correcto', peso: 16, eval: (m) => {
        if (!m.jesus || !m.cuna || !m.pesebre) return 0;
        let pts = 0;
        if (dentroDe(m.jesus, m.cuna) || cerca(m.jesus, m.cuna, 12)) pts += 0.5;
        if (dentroDe(m.cuna, m.pesebre) || cerca(m.cuna, m.pesebre, 14)) pts += 0.5;
        return pts;
    }}
];

function calcularScoreGeneral() {
    const m = obtenerMapa();
    return criterios.reduce((total, c) => total + (c.peso * c.eval(m)), 0);
                                     }
