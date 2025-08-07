# 🎯 Palabrix - Sopa de Letras Diaria

[![Tests](https://github.com/anieto2k/palabrix/actions/workflows/test.yml/badge.svg)](https://github.com/anieto2k/palabrix/actions/workflows/test.yml)
[![E2E Tests](https://github.com/anieto2k/palabrix/actions/workflows/e2e.yml/badge.svg)](https://github.com/anieto2k/palabrix/actions/workflows/e2e.yml)

> 🎮 **Sopa de letras diaria en JavaScript vanilla** - Nuevo puzzle temático cada día con palabras ocultas en **8 direcciones**. Diseño responsive, progreso persistente y efectos visuales espectaculares.

**Palabrix** es una aplicación web moderna de sopa de letras diaria desarrollada en JavaScript vanilla. Cada día presenta un nuevo puzzle temático con palabras ocultas en **todas las direcciones posibles** (horizontal, vertical y diagonal en ambas direcciones).

🌐 **Demo en vivo**: [palabrix.anieto2k.com](https://palabrix.anieto2k.com)

## ✨ Características Principales

- 🎮 **Puzzle Diario**: Nuevo puzzle cada día a las 9:00 AM
- 🎯 **Múltiples Tamaños**: Grids de 16x16, 20x20 y 24x24
- 🧭 **8 Direcciones de Búsqueda**: Horizontal, vertical y diagonal en ambas direcciones
- 📱 **Diseño Responsivo**: Optimizado para móviles y escritorio
- 🎨 **Interfaz Moderna**: Diseño elegante con Tailwind CSS
- 💾 **Progreso Persistente**: Guarda tu progreso automáticamente
- ⏱️ **Sistema de Tiempo**: Cronómetro integrado con mejores tiempos
- 🎊 **Efectos Visuales Espectaculares**: 
  - ✨ Efectos de palabras completadas (partículas, sparkles, texto flotante)
  - 🏆 Efecto "Triple Corona" al completar los 3 tamaños
  - 🎆 Efecto épico de completación de panel
- 🔍 **Mensaje Secreto**: Descubre el mensaje oculto al final
- 📊 **Estadísticas Avanzadas**: 
  - Estadísticas separadas por tamaño de grid
  - Mejores tiempos por día y tamaño
  - Tiempo acumulado preciso
  - Compartir estadísticas individuales y generales
- 🐦 **Compartir**: Comparte tus resultados en redes sociales
- 🧪 **Tests Completos**: 30 tests (18 unitarios + 12 E2E) con cobertura completa

## 🚀 Instalación y Uso

### Prerrequisitos

- Node.js (versión 16 o superior)
- npm o yarn

### Instalación Rápida

```bash
# Clona el repositorio
git clone https://github.com/anieto2k/palabrix.git
cd palabrix

# Instala las dependencias
npm install

# Ejecuta en modo desarrollo
npm run dev
```

Abre tu navegador en `http://localhost:5173` y ¡disfruta del juego!

### Scripts Disponibles

```bash
npm run dev          # Inicia el servidor de desarrollo
npm run build        # Construye para producción
npm run preview      # Vista previa de la build de producción
npm run test         # Ejecuta tests unitarios con Vitest (30 tests)
npm run e2e          # Ejecuta tests end-to-end con Playwright (12 tests)
```

## 🎮 Cómo Jugar

1. **Selecciona el tamaño** del grid (16x16, 20x20 o 24x24)
2. **Haz clic en "Comenzar"** para iniciar el timer
3. **Busca las palabras** en la lista:
   - Haz clic en la primera letra de la palabra
   - Haz clic en la última letra de la palabra
   - Las palabras se marcarán automáticamente con efectos visuales
4. **Completa todas las palabras** para revelar el mensaje secreto
5. **Comparte tus resultados** en redes sociales

### 🧭 Direcciones de Búsqueda (8 Direcciones)

**Palabrix** soporta **todas las direcciones posibles** de búsqueda:

#### **Direcciones Horizontales:**
- ➡️ **Horizontal** (izquierda a derecha)
- ⬅️ **Horizontal** (derecha a izquierda)

#### **Direcciones Verticales:**
- ⬇️ **Vertical** (arriba a abajo)
- ⬆️ **Vertical** (abajo a arriba)

#### **Direcciones Diagonales:**
- ↘️ **Diagonal** (esquina superior izquierda a inferior derecha)
- ↖️ **Diagonal** (esquina inferior derecha a superior izquierda)
- ↙️ **Diagonal** (esquina superior derecha a inferior izquierda)
- ↗️ **Diagonal** (esquina inferior izquierda a superior derecha)

**¡Cada palabra puede estar oculta en cualquiera de estas 8 direcciones!**

## 🎊 Efectos Visuales

### ✨ Efectos de Palabras Completadas
Cuando encuentras una palabra correcta, se activan múltiples efectos:
- **Partículas explosivas**: 15 partículas coloridas por celda
- **Texto flotante**: "¡PALABRA!" que aparece y flota
- **Pulso en celdas**: Las celdas pulsan con sombra dorada
- **Sparkles mágicos**: 8 sparkles brillantes por celda

### 🏆 Efecto "Triple Corona"
Al completar los 3 tamaños en un día, se activa un efecto especial:
- **Overlay espectacular**: Gradiente animado con colores vibrantes
- **Texto épico**: "¡TRIPLE CORONA!" con efectos de pulso y brillo
- **Trofeo gigante**: 🏆 que rebota con animación
- **Estrellas rotatorias**: 12 estrellas que rotan por toda la pantalla
- **Fuegos artificiales**: 20 explosiones de colores
- **Partículas de celebración**: 50 partículas que explotan
- **Ondas de choque**: 3 ondas que se expanden
- **Sonido triunfal**: Melodía de celebración

### 🎆 Efecto de Completación de Panel
Al completar un puzzle, se activa un efecto épico:
- **Overlay con gradiente**: Fondo púrpura-azul animado
- **Texto principal**: "¡PUZZLE COMPLETADO!" con pulso y brillo
- **Trofeo rebotante**: 🏆 gigante que rebota
- **Subtítulo flotante**: "¡Excelente trabajo!"
- **Estrellas rotatorias**: 12 estrellas que rotan
- **Sparkles mágicos**: 30 partículas brillantes
- **Fuegos artificiales**: 20 explosiones de colores
- **Partículas de celebración**: 50 partículas que explotan
- **Ondas de choque**: 3 ondas que se expanden
- **Sonido de celebración**: Melodía triunfal

## 🏗️ Arquitectura del Proyecto

```
palabrix/
├── src/                    # Código fuente
│   ├── index.html         # Página principal
│   ├── main.js           # Punto de entrada
│   ├── palabrix.js       # Lógica principal del juego
│   ├── puzzle.js         # Datos de puzzles (50+ temas)
│   ├── confetti.js       # Efectos de confeti (legacy)
│   ├── word-completion-effect.js    # Efectos de palabras completadas
│   ├── triple-completion-effect.js  # Efecto triple corona
│   ├── panel-completion-effect.js   # Efecto de completación de panel
│   ├── palabrix.css      # Estilos principales
│   └── *.spec.js         # Tests unitarios
├── tests/
│   └── e2e/              # Tests end-to-end
├── dist/                 # Build de producción
└── public/               # Assets estáticos
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

## 🧪 Testing y Calidad

### Cobertura de Tests

**Palabrix** cuenta con una suite completa de tests:

#### **Tests Unitarios (18 tests):**
- ✅ **Funcionalidad básica**: Grid, colocación de palabras, tiempo
- ✅ **8 direcciones de búsqueda**: Todas las direcciones implementadas
- ✅ **Límites y validaciones**: Casos edge y errores
- ✅ **Efectos visuales**: Todos los efectos funcionan correctamente
- ✅ **Estadísticas**: Cálculos precisos y persistencia

#### **Tests E2E (12 tests):**
- ✅ **Flujo completo del juego**: Desde inicio hasta completación
- ✅ **8 direcciones interactivas**: Búsqueda en todas las direcciones
- ✅ **Interfaz de usuario**: Responsive design y navegación
- ✅ **Estadísticas y compartir**: Funcionalidades completas
- ✅ **Efectos visuales**: Verificación de todos los efectos

### Ejecutar Tests

```bash
# Tests unitarios (rápidos)
npm run test

# Tests E2E (requiere servidor corriendo)
npm run e2e

# Cobertura de tests
npm run test -- --coverage
```

## 🔧 Funciones de Desarrollo

### Modo Debug

```javascript
// Activar modo debug
window.debug.enable();

// Forzar fecha específica (formato: dd/mm/yyyy)
window.debug.setDate('15/12/2024');

// Limpiar fecha forzada
window.debug.clearDate();

// Ejecutar efecto de triple corona
window.debug.launchTripleEffect();

// Ejecutar efecto de palabra completada
window.debug.launchWordEffect();

// Ejecutar efecto de completación de panel
window.debug.launchPanelEffect();
```

## 📊 Estadísticas y Progreso

El juego guarda automáticamente:

- ✅ **Progreso diario**: Palabras encontradas
- ⏱️ **Mejores tiempos**: Por puzzle y tamaño de grid
- 📈 **Estadísticas generales**: Partidas jugadas y completadas
- 🎯 **Estado del juego**: Posición actual y tiempo transcurrido
- 📊 **Estadísticas por tamaño**: 
  - Partidas completadas por tamaño (16x16, 20x20, 24x24)
  - Mejor tiempo por día y tamaño
  - Tiempo acumulado preciso por tamaño
- 🏆 **Logros especiales**: Triple corona al completar los 3 tamaños

### Estadísticas Detalladas

Las estadísticas se muestran separadas por tamaño de grid:
- **Tamaño (16x16)**: Partidas completadas, mejor tiempo, tiempo acumulado
- **Tamaño (20x20)**: Partidas completadas, mejor tiempo, tiempo acumulado  
- **Tamaño (24x24)**: Partidas completadas, mejor tiempo, tiempo acumulado

Cada sección incluye botones para compartir en X y copiar enlace.

## 🎨 Personalización

### Temas de Colores

El juego utiliza un sistema de colores dinámico para las palabras encontradas:

```css
.found-permanent-1 { background-color: #60a5fa; } /* Azul */
.found-permanent-2 { background-color: #f87171; } /* Rojo */
.found-permanent-3 { background-color: #fbbf24; } /* Amarillo */
.found-permanent-4 { background-color: #a78bfa; } /* Púrpura */
.found-permanent-5 { background-color: #34d399; } /* Verde */
```

### Responsive Design

- 📱 **Móvil**: Grid adaptativo con scroll horizontal, modal fullscreen
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

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Por favor:

1. **Fork** el proyecto
2. **Crea** una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. **Push** a la rama (`git push origin feature/AmazingFeature`)
5. **Abre** un Pull Request

### Guías de Contribución

- 📝 **Código**: Sigue las convenciones de JavaScript ES6+
- 🧪 **Tests**: Añade tests para nuevas funcionalidades (unit + E2E)
- 📚 **Documentación**: Actualiza la documentación según sea necesario
- 🎨 **Diseño**: Mantén la consistencia visual
- ✨ **Efectos**: Asegúrate de que los efectos sean compatibles con móviles
- 🧭 **Direcciones**: Verifica que las 8 direcciones funcionen correctamente

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
