// Este script de Node.js genera la variable de entorno VITE_BUILD_VERSION con la fecha y hora actual
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const now = new Date();
const fecha = now.toLocaleDateString('es-ES');
const hora = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
const version = `${fecha} ${hora}`;

const envPath = join(__dirname, 'src/.env');
writeFileSync(envPath, `VITE_BUILD_VERSION=${version}\n`);
console.log('VITE_BUILD_VERSION generado:', version);
