// Cambiar entre escenas
document.getElementById('btn-sala').addEventListener('click', function() {
    document.getElementById('escena-sala').classList.add('activa');
    document.getElementById('escena-belen').classList.remove('activa');
});

document.getElementById('btn-belen').addEventListener('click', function() {
    document.getElementById('escena-belen').classList.add('activa');
    document.getElementById('escena-sala').classList.remove('activa');
});

// Sistema de arrastrar y soltar (drag and drop) para mouse y táctil
let adornoActivo = null;
let offsetX = 0;
let offsetY = 0;

// Iniciar arrastre
function iniciarArrastre(e, elemento) {
    e.preventDefault();
    adornoActivo = elemento.cloneNode(true);
    adornoActivo.classList.add('colocado');
    document.body.appendChild(adornoActivo);
    
    const rect = elemento.getBoundingClientRect();
    const clienteX = e.touches ? e.touches[0].clientX : e.clientX;
    const clienteY = e.touches ? e.touches[0].clientY : e.clientY;
    
    offsetX = clienteX - rect.left;
    offsetY = clienteY - rect.top;
    
    moverAdorno(clienteX, clienteY);
}

// Mover adorno
function moverAdorno(x, y) {
    if (adornoActivo) {
        adornoActivo.style.left = (x - offsetX) + 'px';
        adornoActivo.style.top = (y - offsetY) + 'px';
    }
}

// Soltar adorno
function soltarAdorno(e) {
    if (adornoActivo) {
        const clienteX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
        const clienteY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;
        
        // Verificar si se soltó dentro de una escena activa
        const escenaActiva = document.querySelector('.escena.activa');
        if (escenaActiva) {
            const rect = escenaActiva.getBoundingClientRect();
            if (clienteX >= rect.left && clienteX <= rect.right &&
                clienteY >= rect.top && clienteY <= rect.bottom) {
                
                // Posicionar dentro de la escena
                const posX = clienteX - rect.left - offsetX;
                const posY = clienteY - rect.top - offsetY;
                
                adornoActivo.style.left = posX + 'px';
                adornoActivo.style.top = posY + 'px';
                adornoActivo.style.position = 'absolute';
                
                // Mover el adorno al contenedor de la escena
                const zonaSoltar = escenaActiva.querySelector('.zona-soltar');
                zonaSoltar.appendChild(adornoActivo);
                adornoActivo = null;
                return;
            }
        }
        
        // Si no se soltó en la escena, eliminar
        adornoActivo.remove();
        adornoActivo = null;
    }
}

// Asignar eventos a todos los adornos del panel
function activarAdornos() {
    const adornos = document.querySelectorAll('.panel-adornos .adorno');
    adornos.forEach(adorno => {
        // Mouse
        adorno.addEventListener('mousedown', function(e) {
            iniciarArrastre(e, this);
        });
        
        // Táctil
        adorno.addEventListener('touchstart', function(e) {
            iniciarArrastre(e, this);
        }, { passive: false });
    });
}

// Eventos globales de movimiento
document.addEventListener('mousemove', function(e) {
    if (adornoActivo) {
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

// Inicializar
activarAdornos();
