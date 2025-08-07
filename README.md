# 🎯 Palabrix - Sopa de Letras Diaria

[![Tests](https://github.com/anieto2k/palabrix/actions/workflows/test.yml/badge.svg)](https://github.com/anieto2k/palabrix/actions/workflows/test.yml)
[![E2E Tests](https://github.com/anieto2k/palabrix/actions/workflows/e2e.yml/badge.svg)](https://github.com/anieto2k/palabrix/actions/workflows/e2e.yml)

**Palabrix** es una aplicación web moderna de sopa de letras diaria desarrollada en JavaScript vanilla. Cada día presenta un nuevo puzzle temático con palabras ocultas en diferentes direcciones (horizontal, vertical y diagonal).

## ✨ Características

- 🎮 **Puzzle Diario**: Nuevo puzzle cada día a las 9:00 AM
- 🎯 **Múltiples Tamaños**: Grids de 16x16, 20x20 y 24x24
- 📱 **Diseño Responsivo**: Optimizado para móviles y escritorio
- 🎨 **Interfaz Moderna**: Diseño elegante con Tailwind CSS
- 💾 **Progreso Persistente**: Guarda tu progreso automáticamente
- ⏱️ **Sistema de Tiempo**: Cronómetro integrado con mejores tiempos
- 🎊 **Efectos Visuales**: Confeti animado al completar el puzzle
- 🔍 **Mensaje Secreto**: Descubre el mensaje oculto al final
- 📊 **Estadísticas**: Seguimiento de partidas jugadas y completadas
- 🐦 **Compartir**: Comparte tus resultados en redes sociales
- 🧪 **Tests Completos**: Cobertura de tests unitarios y E2E

## 🚀 Instalación y Uso

### Prerrequisitos

- Node.js (versión 16 o superior)
- npm o yarn

### Instalación

1. **Clona el repositorio**
   ```bash
   git clone https://github.com/anieto2k/palabrix.git
   cd palabrix
   ```

2. **Instala las dependencias**
   ```bash
   npm install
   ```

3. **Ejecuta en modo desarrollo**
   ```bash
   npm run dev
   ```

4. **Abre tu navegador**
   - Ve a `http://localhost:5173`
   - ¡Disfruta del juego!

### Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Inicia el servidor de desarrollo
npm run preview      # Vista previa de la build de producción

# Build
npm run build        # Construye para producción

# Testing
npm run test         # Ejecuta tests unitarios con Vitest
npm run e2e          # Ejecuta tests end-to-end con Playwright
```

## 🎮 Cómo Jugar

1. **Selecciona el tamaño** del grid (16x16, 20x20 o 24x24)
2. **Haz clic en "Comenzar"** para iniciar el timer
3. **Busca las palabras** en la lista:
   - Haz clic en la primera letra de la palabra
   - Haz clic en la última letra de la palabra
   - Las palabras se marcarán automáticamente
4. **Completa todas las palabras** para revelar el mensaje secreto
5. **Comparte tus resultados** en redes sociales

### Direcciones de Búsqueda

- ➡️ **Horizontal** (izquierda a derecha)
- ⬇️ **Vertical** (arriba a abajo)
- ↘️ **Diagonal** (esquina superior izquierda a inferior derecha)
- ↙️ **Diagonal** (esquina superior derecha a inferior izquierda)

## 🏗️ Arquitectura del Proyecto

```
palabrix/
├── src/                    # Código fuente
│   ├── index.html         # Página principal
│   ├── main.js           # Punto de entrada
│   ├── palabrix.js       # Lógica principal del juego
│   ├── puzzle.js         # Datos de puzzles
│   ├── confetti.js       # Efectos de confeti
│   ├── palabrix.css      # Estilos principales
│   └── *.spec.js         # Tests unitarios
├── tests/
│   └── e2e/              # Tests end-to-end
├── dist/                 # Build de producción
├── public/               # Assets estáticos
└── docs/                 # Documentación
```

### Tecnologías Utilizadas

- **Frontend**: JavaScript Vanilla (ES6+)
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Testing**: Vitest (unit) + Playwright (E2E)
- **Deployment**: GitHub Pages

## 🧩 Sistema de Puzzles

El juego incluye **50+ puzzles temáticos** con palabras en español:

- 🎨 **Colores**: ROJO, AZUL, VERDE, AMARILLO...
- 🍎 **Frutas**: MANZANA, PLATANO, FRESA, NARANJA...
- 🐾 **Animales**: VACA, CERDO, CABALLO, OVEJA...
- 🏃 **Deportes**: FUTBOL, BALONCESTO, TENIS, NATACION...
- 🌍 **Geografía**: MADRID, PARIS, LONDRES, ROMA...
- 🎵 **Música**: GUITARRA, PIANO, VIOLIN, TROMPETA...
- 🏠 **Casa**: SILLA, MESA, CAMA, ARMARIO...
- 🚗 **Transporte**: COCHE, AVION, BARCO, TREN...

Cada puzzle incluye un **mensaje secreto** que se revela al completar todas las palabras.

## 🔧 Funciones de Desarrollo

### Modo Debug

El juego incluye funciones de debug para desarrollo:

```javascript
// Activar modo debug
window.debug.enable();

// Desactivar modo debug
window.debug.disable();

// Forzar fecha específica (formato: dd/mm/yyyy)
window.debug.setDate('15/12/2024');

// Limpiar fecha forzada
window.debug.clearDate();
```

### Tests

```bash
# Tests unitarios
npm run test

# Tests E2E (requiere servidor corriendo)
npm run e2e

# Cobertura de tests
npm run test -- --coverage
```

## 📊 Estadísticas y Progreso

El juego guarda automáticamente:

- ✅ **Progreso diario**: Palabras encontradas
- ⏱️ **Mejores tiempos**: Por puzzle y tamaño de grid
- 📈 **Estadísticas generales**: Partidas jugadas y completadas
- 🎯 **Estado del juego**: Posición actual y tiempo transcurrido

## 🎨 Personalización

### Temas de Colores

El juego utiliza un sistema de colores dinámico para las palabras encontradas:

```css
.found-permanent-1 { background-color: #60a5fa; } /* Azul */
.found-permanent-2 { background-color: #f87171; } /* Rojo */
.found-permanent-3 { background-color: #fbbf24; } /* Amarillo */
.found-permanent-4 { background-color: #a78bfa; } /* Púrpura */
.found-permanent-5 { background-color: #34d399; } /* Verde */
.found-permanent-6 { background-color: #fb7185; } /* Rosa */
.found-permanent-7 { background-color: #22d3ee; } /* Cian */
.found-permanent-8 { background-color: #f472b6; } /* Magenta */
```

### Responsive Design

- 📱 **Móvil**: Grid adaptativo con scroll horizontal
- 💻 **Tablet**: Layout optimizado para pantallas medianas
- 🖥️ **Desktop**: Layout completo con panel lateral

## 🚀 Deployment

### GitHub Pages

El proyecto está configurado para deployment automático en GitHub Pages:

1. **Build de producción**
   ```bash
   npm run build
   ```

2. **Deploy automático**
   - Push a `main` branch
   - GitHub Actions construye y despliega automáticamente
   - Disponible en: https://palabrix.anieto2k.com

### Configuración de Vite

```javascript
// vite.config.js
export default defineConfig({
  root: 'src',
  base: '',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html')
      }
    }
  }
});
```

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Por favor:

1. **Fork** el proyecto
2. **Crea** una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. **Push** a la rama (`git push origin feature/AmazingFeature`)
5. **Abre** un Pull Request

### Guías de Contribución

- 📝 **Código**: Sigue las convenciones de JavaScript ES6+
- 🧪 **Tests**: Añade tests para nuevas funcionalidades
- 📚 **Documentación**: Actualiza la documentación según sea necesario
- 🎨 **Diseño**: Mantén la consistencia visual

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🙏 Agradecimientos

- **Tailwind CSS** por el framework de estilos
- **Vite** por el bundler moderno
- **Vitest** y **Playwright** por las herramientas de testing
- **Comunidad** por el feedback y sugerencias

## 📞 Contacto

- 🌐 **Website**: [palabrix.anieto2k.com](https://palabrix.anieto2k.com)
- 🐦 **Twitter**: [@anieto2k](https://twitter.com/anieto2k)
- 📧 **Email**: [contacto@anieto2k.com](mailto:contacto@anieto2k.com)

---

<div align="center">

**¡Disfruta jugando a Palabrix! 🎯**

*Desarrollado con ❤️ por [aNieto2k](https://github.com/anieto2k)*

</div>
