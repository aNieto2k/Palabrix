import './palabrix.css';
import './palabrix.js';

// Mostrar la fecha y hora de compilación en el footer
const buildVersion = import.meta.env.VITE_BUILD_VERSION || '';
if (buildVersion && document.getElementById('build-version')) {
  document.getElementById('build-version').textContent = buildVersion;
}

// Registro de Service Worker y manejo de instalación PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

// Botón de instalación (mostrar si el navegador lo permite)
(() => {
  if (window.__PALABRIX_PWA_INIT__) return;
  window.__PALABRIX_PWA_INIT__ = true;

  let deferredPromptEvent = null;

  const hideInstallButtons = () => {
    const btnDesktop = document.getElementById('install-pwa-btn');
    const btnMobile = document.getElementById('install-pwa-btn-mobile');
    if (btnDesktop) btnDesktop.classList.add('hidden');
    if (btnMobile) btnMobile.classList.add('hidden');
  };

  const showInstallButtons = () => {
    const btnDesktop = document.getElementById('install-pwa-btn');
    const btnMobile = document.getElementById('install-pwa-btn-mobile');
    if (btnDesktop) btnDesktop.classList.remove('hidden');
    if (btnMobile) btnMobile.classList.remove('hidden');
  };

  const isStandalone = () =>
    window.matchMedia && window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;

  window.addEventListener('DOMContentLoaded', () => {
    // Ocultar si ya está instalada/standalone
    if (isStandalone()) {
      hideInstallButtons();
      return;
    }

    const btnDesktop = document.getElementById('install-pwa-btn');
    const btnMobile = document.getElementById('install-pwa-btn-mobile');

    // Soporte iOS (no hay beforeinstallprompt): mostrar guía
    const isIos = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
    if (isIos) {
      // Mostrar botones para guiar al usuario en iOS
      showInstallButtons();
      const showIosHelp = () => {
        // Mensaje breve con instrucciones nativas de iOS
        alert('Para instalar Palabrix en iOS: 1) Pulsa el botón Compartir en Safari 2) Selecciona "Añadir a pantalla de inicio".');
      };
      if (btnDesktop) btnDesktop.addEventListener('click', showIosHelp);
      if (btnMobile) btnMobile.addEventListener('click', showIosHelp);
      return; // No seguir con flujo de beforeinstallprompt
    }

    const clickInstall = async () => {
      if (!deferredPromptEvent) return;
      deferredPromptEvent.prompt();
      try {
        await deferredPromptEvent.userChoice;
      } catch (_) {}
      deferredPromptEvent = null;
      hideInstallButtons();
    };

    if (btnDesktop) btnDesktop.addEventListener('click', clickInstall);
    if (btnMobile) btnMobile.addEventListener('click', clickInstall);
  });

  window.addEventListener('beforeinstallprompt', (e) => {
    // Evita que el navegador muestre su mini-infobar
    e.preventDefault();
    deferredPromptEvent = e;
    // Muestra los botones personalizados
    showInstallButtons();
  });

  window.addEventListener('appinstalled', () => {
    deferredPromptEvent = null;
    hideInstallButtons();
  });
})();

