// ============ REGLAS DE PUNTUACIÓN (arbol-reglas.js) ============

const criterios = [
    { id: 'completitud', nombre: 'Las 8 piezas presentes', peso: 10, eval: (m) => idsNecesarios.filter(id => m[id]).length / idsNecesarios.length },
    
    { id: 'estrella_arriba', nombre: 'Estrella en la punta del Árbol', peso: 12, eval: (m) => {
        if (!m.estrella || !m.arbol) return 0;
        return centroY(m.estrella) < centroY(m.arbol) ? 1 : 0;
    }},
    
    { id: 'cascanuez_pie', nombre: 'Cascanueces a los pies del Árbol', peso: 12, eval: (m) => {
        if (!m.cascanuez || !m.arbol) return 0;
        return centroY(m.cascanuez) > centroY(m.arbol) ? 1 : 0;
    }},
    
    { id: 'bambalina_arbol', nombre: 'Bambalina sobre el Árbol', peso: 8, eval: (m) => {
        if (!m.bambalina || !m.arbol) return 0;
        return dentroDe(m.bambalina, m.arbol) ? 1 : (cerca(m.bambalina, m.arbol, 30) ? 0.5 : 0);
    }},
    
    { id: 'bombilla_arbol', nombre: 'Bombilla sobre el Árbol', peso: 8, eval: (m) => {
        if (!m.bombilla || !m.arbol) return 0;
        return dentroDe(m.bombilla, m.arbol) ? 1 : (cerca(m.bombilla, m.arbol, 30) ? 0.5 : 0);
    }},
    
    { id: 'lazo_arbol', nombre: 'Lazo sobre el Árbol', peso: 8, eval: (m) => {
        if (!m.lazo || !m.arbol) return 0;
        return dentroDe(m.lazo, m.arbol) ? 1 : (cerca(m.lazo, m.arbol, 30) ? 0.5 : 0);
    }},
    
    { id: 'osito_arbol', nombre: 'Osito sobre el Árbol', peso: 8, eval: (m) => {
        if (!m.osito || !m.arbol) return 0;
        return dentroDe(m.osito, m.arbol) ? 1 : (cerca(m.osito, m.arbol, 30) ? 0.5 : 0);
    }},
    
    { id: 'baston_arbol', nombre: 'Bastón sobre el Árbol', peso: 8, eval: (m) => {
        if (!m.baston || !m.arbol) return 0;
        return dentroDe(m.baston, m.arbol) ? 1 : (cerca(m.baston, m.arbol, 30) ? 0.5 : 0);
    }},

    // REGLA: No superposición entre adornos
    { id: 'no_superposicion_adornos', nombre: 'Adornos no amontonados (sin superposición)', peso: 14, eval: (m) => {
        const adornos = ['bambalina', 'bombilla', 'lazo', 'osito', 'baston'];
        const presentes = adornos.filter(id => m[id]);
        if (presentes.length <= 1) return 1;
        for (let i = 0; i < presentes.length; i++) {
            for (let j = i + 1; j < presentes.length; j++) {
                const a = m[presentes[i]];
                const b = m[presentes[j]];
                if (centroDentroDe(a, b) || centroDentroDe(b, a)) {
                    return 0;
                }
            }
        }
        return 1;
    }},
    
    { id: 'orden_visual', nombre: 'Orden visual correcto (Estrella arriba, Cascanueces abajo)', peso: 12, eval: (m) => {
        if (!m.estrella || !m.cascanuez || !m.arbol) return 0;
        // CORREGIDO: devuelve porcentaje (0, 0.5 o 1), no puntos absolutos.
        let pts = 0;
        if (centroY(m.estrella) < centroY(m.arbol)) pts += 0.5;
        if (centroY(m.cascanuez) > centroY(m.arbol)) pts += 0.5;
        return pts;
    }}
];

function calcularScoreGeneral() {
    const m = obtenerMapa();
    return criterios.reduce((total, c) => total + (c.peso * c.eval(m)), 0);
}
