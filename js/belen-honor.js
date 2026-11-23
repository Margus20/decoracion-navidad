// ============ TABLA DE HONOR (belen-honor.js) ============

function guardarEnTablaHonor(nombre, puntaje) {
    let tabla = JSON.parse(localStorage.getItem('belenTablaHonor')) || [];
    const fecha = new Date().toLocaleDateString('es-VE');
    tabla.push({ nombre: nombre || tBelenAcciones('honor_anonymous'), puntaje: Math.round(puntaje), fecha });
    tabla.sort((a, b) => b.puntaje - a.puntaje);
    tabla = tabla.slice(0, 10);
    localStorage.setItem('belenTablaHonor', JSON.stringify(tabla));
}

function mostrarTablaHonor() {
    const tabla = JSON.parse(localStorage.getItem('belenTablaHonor')) || [];
    const lista = document.getElementById('listaHonor');
    lista.innerHTML = '';
    if (tabla.length === 0) {
        lista.innerHTML = '<div class="item-honor vacio">' + tBelenAcciones('honor_empty') + '</div>';
    } else {
        tabla.forEach((item, index) => {
            const div = document.createElement('div');
            div.className = 'item-honor';
            div.innerHTML = '<span class="puesto">#' + (index + 1) + '</span><span class="nombre">' + item.nombre + '</span><span class="puntaje">' + item.puntaje + ' pts</span>';
            lista.appendChild(div);
        });
    }
    document.getElementById('modalHonor').classList.add('visible');
}
