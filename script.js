// Función para crear el efecto de nieve cayendo
function crearNieve() {
    const copos = ['❄', '❅', '❆', '*'];
    for (let i = 0; i < 30; i++) {
        const nieve = document.createElement('div');
        nieve.classList.add('nieve');
        nieve.textContent = copos[Math.floor(Math.random() * copos.length)];
        nieve.style.left = Math.random() * 100 + 'vw';
        nieve.style.animationDuration = (Math.random() * 5 + 5) + 's';
        nieve.style.animationDelay = Math.random() * 10 + 's';
        nieve.style.fontSize = (Math.random() * 1.5 + 0.8) + 'em';
        document.body.appendChild(nieve);
    }
}

// Función para verificar si es 25 de diciembre
function esNavidad() {
    const hoy = new Date();
    return hoy.getDate() === 25 && hoy.getMonth() === 11;
}

// Función para cambiar de vista (la usaremos más adelante)
function mostrarVista(vista) {
    document.querySelector('.menu-principal').style.display = 'none';
    document.querySelector('header p').textContent = 'Vista: ' + vista;
}

// Cuando la página termina de cargar
document.addEventListener('DOMContentLoaded', function() {
    crearNieve();

    // Botón del arbolito
    document.getElementById('boton-arbolito').addEventListener('click', function() {
        mostrarVista('Arbolito y Sala');
    });

    // Botón del belén
    document.getElementById('boton-belen').addEventListener('click', function() {
        mostrarVista('Belén');
    });

    // Mensaje especial si es 25 de diciembre
    if (esNavidad()) {
        const mensaje = document.createElement('p');
        mensaje.textContent = '🎁 ¡Es 25 de diciembre! Ya puedes abrir tus regalos 🎁';
        mensaje.style.textAlign = 'center';
        mensaje.style.color = '#ffd700';
        mensaje.style.fontSize = '1.5em';
        mensaje.style.marginTop = '20px';
        document.querySelector('main').appendChild(mensaje);
    }
});
