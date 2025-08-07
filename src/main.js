import './palabrix.css';
import './palabrix.js';

// Mostrar la fecha y hora de compilación en el footer
const buildVersion = import.meta.env.VITE_BUILD_VERSION || '';
if (buildVersion && document.getElementById('build-version')) {
  document.getElementById('build-version').textContent = buildVersion;
}

