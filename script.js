// Efecto de nieve cayendo
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

// Sistema de arrastrar y soltar para mouse y táctil
let adornoActivo = null;
let offsetX = 0;
let offsetY = 0;

function iniciarArrastre(e, elemento) {
    e.preventDefault();
    adornoActivo = elemento.cloneNode(true);
    adornoActivo.classList.add('colocado');
    adornoActivo.style.position = 'absolute';
    adornoActivo.style.zIndex = '1000';
    document.body.appendChild(adornoActivo);
    
    const rect = elemento.getBoundingClientRect();
    const clienteX = e.touches ? e.touches[0].clientX : e.clientX;
    const clienteY = e.touches ? e.touches[0].clientY : e.clientY;
    
    offsetX = clienteX - rect.left;
    offsetY = clienteY - rect.top;
    
    moverAdorno(clienteX, clienteY);
}

function moverAdorno(x, y) {
    if (adornoActivo) {
        adornoActivo.style.left = (x - offsetX) + 'px';
        adornoActivo.style.top = (y - offsetY) + 'px';
    }
}

function soltarAdorno(e) {
    if (adornoActivo) {
        const clienteX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
        const clienteY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;
        
        // Verificar si se soltó dentro de la escena (sala o terreno del belén)
        const escenaActiva = document.querySelector('.sala, .terreno-belen');
        if (escenaActiva) {
            const rect = escenaActiva.getBoundingClientRect();
            if (clienteX >= rect.left && clienteX <= rect.right &&
                clienteY >= rect.top && clienteY <= rect.bottom) {
                
                const posX = clienteX - rect.left - offsetX;
                const posY = clienteY - rect.top - offsetY;
                
                adornoActivo.style.left = posX + 'px';
                adornoActivo.style.top = posY + 'px';
                
                // Mover al contenedor de la escena para que se quede fijo ahí
                const zonaSoltar = escenaActiva.querySelector('.zona-soltar') || escenaActiva;
                zonaSoltar.appendChild(adornoActivo);
                adornoActivo = null;
                return;
            }
        }
        
        // Si se suelta fuera de la escena, se elimina el clon
        adornoActivo.remove();
        adornoActivo = null;
    }
}

function activarAdornos() {
    const adornos = document.querySelectorAll('.adorno');
    adornos.forEach(adorno => {
        adorno.addEventListener('mousedown', function(e) {
            iniciarArrastre(e, this);
        });
        adorno.addEventListener('touchstart', function(e) {
            iniciarArrastre(e, this);
        }, { passive: false });
    });
}

document.addEventListener('mousemove', function(e) {
    if (adornoActivo) {
        e.preventDefault();
        moverAdorno(e.clientX, e.clientY);
    }
});

document.addEventListener('touchmove', function(e) {
    if (adornoActivo) {
        e.preventDefault();
        moverAdorno(e.touches[0].clientX, e.touches[0].clientY);
    }
}, { passive: false });

document.addEventListener('mouseup', soltarAdorno);
document.addEventListener('touchend', soltarAdorno);

// Inicializar todo cuando la página cargue
document.addEventListener('DOMContentLoaded', function() {
    crearNieve();
    activarAdornos();
});
