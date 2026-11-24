// ============ SELECTOR DE DONACIONES (donar.js) ============
// Agrega Binance Pay junto a Ko-fi sin modificar la lógica existente.
// Muestra el QR personal de Binance Pay + botón de copiar UID como respaldo.
(function () {
    'use strict';

    const BINANCE_UID = '495768714';
    const BINANCE_QR = 'img/binance_pay_qr.png';
    const KOFI_URL = 'https://ko-fi.com/mar_gus';

    const TXT = {
        es: {
            titulo: 'APOYA EL PROYECTO',
            sub: 'Elige cómo quieres donar. ¡Gracias por tu apoyo!',
            kofi_titulo: 'Ko-fi',
            kofi_desc: 'Con tarjeta o PayPal. Abre la página de Ko-fi.',
            kofi_btn: 'Donar en Ko-fi',
            binance_titulo: 'Binance Pay',
            binance_desc: 'Escanea este QR con la app de Binance y escribe el monto.',
            copiar: 'Copiar ID',
            copiado: '¡Copiado!',
            ayuda: 'En la app: Pay → Escanear → apunta al QR. O pega este ID:',
            uid_label: 'ID de Binance Pay',
            cerrar: 'Cerrar'
        },
        en: {
            titulo: 'SUPPORT THE PROJECT',
            sub: 'Choose how you want to donate. Thank you for your support!',
            kofi_titulo: 'Ko-fi',
            kofi_desc: 'By card or PayPal. Opens the Ko-fi page.',
            kofi_btn: 'Donate on Ko-fi',
            binance_titulo: 'Binance Pay',
            binance_desc: 'Scan this QR with the Binance app and enter the amount.',
            copiar: 'Copy ID',
            copiado: 'Copied!',
            ayuda: 'In the app: Pay → Scan → point at the QR. Or paste this ID:',
            uid_label: 'Binance Pay ID',
            cerrar: 'Close'
        }
    };

    function t(key) {
        const lang = (window.SistemaIdioma && window.SistemaIdioma.actual) ? window.SistemaIdioma.actual() : 'es';
        return (TXT[lang] && TXT[lang][key]) || TXT['es'][key];
    }

    function mostrarModalDonar() {
        if (document.getElementById('overlayDonar')) return;

        const overlay = document.createElement('div');
        overlay.id = 'overlayDonar';
        overlay.style.cssText = 'position:fixed; inset:0; background:rgba(0,0,0,0.8); display:flex; align-items:center; justify-content:center; z-index:100000; padding:16px;';

        const panel = document.createElement('div');
        panel.style.cssText = 'background:linear-gradient(160deg,#23233b 0%,#16162a 100%); border:2px solid #ffd700; border-radius:18px; padding:24px 20px; max-width:440px; width:100%; text-align:center; box-shadow:0 10px 30px rgba(0,0,0,0.85); max-height:92vh; overflow-y:auto;';

        panel.innerHTML =
            '<h3 style="font-family:\'Bebas Neue\',sans-serif; color:#ffd700; font-size:2rem; letter-spacing:1.5px; text-transform:uppercase; margin:0 0 6px;">' + t('titulo') + '</h3>' +
            '<p style="color:#cfcfe0; font-family:sans-serif; font-size:0.95rem; margin:0 0 20px;">' + t('sub') + '</p>' +

            // Tarjeta Ko-fi
            '<div style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,215,0,0.35); border-radius:14px; padding:16px; margin-bottom:14px; text-align:left;">' +
                '<div style="font-family:\'Bebas Neue\',sans-serif; color:#ffd700; font-size:1.4rem; letter-spacing:1px;">☕ ' + t('kofi_titulo') + '</div>' +
                '<p style="color:#e8e8f0; font-family:sans-serif; font-size:0.9rem; margin:6px 0 12px;">' + t('kofi_desc') + '</p>' +
                '<a href="' + KOFI_URL + '" target="_blank" rel="noopener" style="display:inline-block; font-family:\'Bebas Neue\',sans-serif; font-size:1.15rem; letter-spacing:1px; padding:9px 22px; border-radius:10px; background:#2e7d32; color:#fff; text-decoration:none; border:2px solid #ffd700;">' + t('kofi_btn') + '</a>' +
            '</div>' +

            // Tarjeta Binance Pay con QR
            '<div style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,215,0,0.35); border-radius:14px; padding:16px; text-align:center;">' +
                '<div style="font-family:\'Bebas Neue\',sans-serif; color:#ffd700; font-size:1.4rem; letter-spacing:1px; text-align:left;">💰 ' + t('binance_titulo') + '</div>' +
                '<p style="color:#e8e8f0; font-family:sans-serif; font-size:0.88rem; margin:6px 0 12px; text-align:left;">' + t('binance_desc') + '</p>' +
                '<div style="background:#ffffff; padding:12px; border-radius:12px; display:inline-block; margin:0 auto 12px;">' +
                    '<img src="' + BINANCE_QR + '" alt="Binance Pay QR" style="display:block; width:200px; max-width:60vw; height:auto; image-rendering:auto;">' +
                '</div>' +
                '<p style="color:#9a9ab0; font-family:sans-serif; font-size:0.78rem; margin:0 0 10px; text-align:left;">' + t('ayuda') + '</p>' +
                '<div style="display:flex; gap:8px; align-items:center; justify-content:flex-start; flex-wrap:wrap;">' +
                    '<code style="font-family:monospace; font-size:1.1rem; color:#fff; background:#000; padding:7px 12px; border-radius:8px; letter-spacing:2px;">' + BINANCE_UID + '</code>' +
                    '<button id="btnCopiarUid" style="font-family:\'Bebas Neue\',sans-serif; font-size:1.05rem; letter-spacing:1px; padding:7px 14px; border-radius:8px; background:#f0b90b; color:#000; border:none; cursor:pointer;">' + t('copiar') + '</button>' +
                '</div>' +
            '</div>' +

            // Cerrar
            '<button id="btnCerrarDonar" style="margin-top:18px; font-family:\'Bebas Neue\',sans-serif; font-size:1.1rem; letter-spacing:1px; padding:8px 24px; border-radius:10px; background:#d32f2f; color:#fff; border:2px solid #ffd700; cursor:pointer;">' + t('cerrar') + '</button>';

        overlay.appendChild(panel);
        document.body.appendChild(overlay);

        function cerrar() {
            const o = document.getElementById('overlayDonar');
            if (o) o.remove();
        }

        document.getElementById('btnCerrarDonar').addEventListener('click', function (e) {
            e.preventDefault(); e.stopPropagation(); cerrar();
        });

        document.getElementById('btnCopiarUid').addEventListener('click', function (e) {
            e.preventDefault(); e.stopPropagation();
            const btn = this;
            function done() { btn.textContent = t('copiado'); setTimeout(function () { btn.textContent = t('copiar'); }, 1800); }
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(BINANCE_UID).then(done).catch(function () { fallbackCopy(done); });
            } else {
                fallbackCopy(done);
            }
        });

        function fallbackCopy(done) {
            const ta = document.createElement('textarea');
            ta.value = BINANCE_UID;
            ta.style.position = 'fixed'; ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            try { document.execCommand('copy'); } catch (e) {}
            document.body.removeChild(ta);
            done();
        }

        overlay.addEventListener('click', function (e) { if (e.target === overlay) cerrar(); });
    }

    function envolverBotonesDonar() {
        const botones = document.querySelectorAll('a.btn-donate, .menu-item[href*="ko-fi"]');
        botones.forEach(function (b) {
            if (b.dataset.donarModal) return;
            b.dataset.donarModal = 'true';
            b.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                mostrarModalDonar();
            });
        });
    }

    document.addEventListener('DOMContentLoaded', envolverBotonesDonar);
})();
