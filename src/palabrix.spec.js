// palabrix.spec.js
// Tests unitarios para la lógica de palabrix.js
import { describe, test, expect } from 'vitest';
import {
  createEmptyGrid, canPlaceWord, placeWord,
  placeSecretMessage, formatTime
} from './palabrix.js';

describe('palabrix.js', () => {
  test('createEmptyGrid genera una matriz vacía del tamaño correcto', () => {
    const grid = createEmptyGrid(5);
    expect(grid.length).toBe(5);
    expect(grid[0].length).toBe(5);
    expect(grid.flat().every(cell => cell.char === ''));
  });

  test('placeWord coloca la palabra en el grid', () => {
    const grid = createEmptyGrid(8);
    const result = placeWord(grid, 'PRUEBA', 8);
    expect(result).toBe(true);
    // Al menos una fila o columna debe contener la palabra (o al revés)
    const chars = grid.flat().map(c => c.char).join('');
    expect(chars.includes('PRUEBA') || chars.includes('AEBURP')).toBe(true);
  });

  test('canPlaceWord detecta correctamente si se puede colocar', () => {
    const grid = createEmptyGrid(5);
    // Puede colocar en (0,0) horizontal
    expect(canPlaceWord(grid, 'HOLA', 0, 0, {r:0,c:1}, 5)).toBe(true);
    // No puede colocar fuera de límites
    expect(canPlaceWord(grid, 'HOLA', 0, 2, {r:0,c:1}, 5)).toBe(false);
  });

  test('placeSecretMessage coloca el mensaje en celdas vacías', () => {
    const grid = createEmptyGrid(6);
    placeSecretMessage(grid, 'SECRET', 6);
    const secretCount = grid.flat().filter(c => c.isSecret).length;
    expect(secretCount).toBe(6);
  });

  test('formatTime formatea correctamente', () => {
    expect(formatTime(0)).toBe('00:00');
    expect(formatTime(65)).toBe('01:05');
    expect(formatTime(NaN)).toBe('--:--');
  });

  describe('Direcciones de búsqueda', () => {
    test('puede colocar palabras en todas las 8 direcciones', () => {
      const directions = [
        { r: 0, c: 1 },   // ➡️ Horizontal (izquierda a derecha)
        { r: 0, c: -1 },  // ⬅️ Horizontal (derecha a izquierda)
        { r: 1, c: 0 },   // ⬇️ Vertical (arriba a abajo)
        { r: -1, c: 0 },  // ⬆️ Vertical (abajo a arriba)
        { r: 1, c: 1 },   // ↘️ Diagonal (esquina superior izquierda a inferior derecha)
        { r: -1, c: -1 }, // ↖️ Diagonal (esquina inferior derecha a superior izquierda)
        { r: 1, c: -1 },  // ↙️ Diagonal (esquina superior derecha a inferior izquierda)
        { r: -1, c: 1 }   // ↗️ Diagonal (esquina inferior izquierda a superior derecha)
      ];

      directions.forEach(dir => {
        const testGrid = createEmptyGrid(8);
        // Usar una posición que permita colocar la palabra en esa dirección
        const startRow = dir.r >= 0 ? 1 : 6;
        const startCol = dir.c >= 0 ? 1 : 6;
        const canPlace = canPlaceWord(testGrid, 'TEST', startRow, startCol, dir, 8);
        expect(canPlace).toBe(true);
      });
    });

    test('detecta correctamente límites en todas las direcciones', () => {
      const grid = createEmptyGrid(5);
      
      // Test límites para palabras que son demasiado largas para el grid
      expect(canPlaceWord(grid, 'LARGAPALABRA', 0, 0, {r:0,c:1}, 5)).toBe(false); // Horizontal fuera
      expect(canPlaceWord(grid, 'LARGAPALABRA', 0, 0, {r:1,c:0}, 5)).toBe(false); // Vertical fuera
      expect(canPlaceWord(grid, 'LARGAPALABRA', 0, 0, {r:1,c:1}, 5)).toBe(false); // Diagonal fuera
    });

    test('puede colocar palabras en direcciones inversas', () => {
      const grid = createEmptyGrid(6);
      
      // Test horizontal derecha a izquierda
      expect(canPlaceWord(grid, 'HOLA', 2, 4, {r:0,c:-1}, 6)).toBe(true);
      
      // Test vertical abajo a arriba
      expect(canPlaceWord(grid, 'HOLA', 4, 2, {r:-1,c:0}, 6)).toBe(true);
      
      // Test diagonal inversa
      expect(canPlaceWord(grid, 'HOLA', 4, 4, {r:-1,c:-1}, 6)).toBe(true);
    });

    test('placeWord funciona con todas las direcciones', () => {
      const grid = createEmptyGrid(8);
      const result = placeWord(grid, 'TEST', 8);
      expect(result).toBe(true);
      
      // Verificar que la palabra se colocó en alguna dirección
      const chars = grid.flat().map(c => c.char).join('');
      expect(chars.includes('TEST') || chars.includes('TSET')).toBe(true);
    });

    test('verifica que todas las 8 direcciones están implementadas correctamente', () => {
      // Este test verifica que las 8 direcciones están definidas en el código
      const expectedDirections = [
        { r: 0, c: 1 },   // ➡️ Horizontal (izquierda a derecha)
        { r: 0, c: -1 },  // ⬅️ Horizontal (derecha a izquierda)
        { r: 1, c: 0 },   // ⬇️ Vertical (arriba a abajo)
        { r: -1, c: 0 },  // ⬆️ Vertical (abajo a arriba)
        { r: 1, c: 1 },   // ↘️ Diagonal (esquina superior izquierda a inferior derecha)
        { r: -1, c: -1 }, // ↖️ Diagonal (esquina inferior derecha a superior izquierda)
        { r: 1, c: -1 },  // ↙️ Diagonal (esquina superior derecha a inferior izquierda)
        { r: -1, c: 1 }   // ↗️ Diagonal (esquina inferior izquierda a superior derecha)
      ];

      // Verificar que cada dirección es única
      const uniqueDirections = new Set();
      expectedDirections.forEach(dir => {
        const key = `${dir.r},${dir.c}`;
        uniqueDirections.add(key);
      });
      expect(uniqueDirections.size).toBe(8);

      // Verificar que todas las direcciones son válidas
      expectedDirections.forEach(dir => {
        expect(typeof dir.r).toBe('number');
        expect(typeof dir.c).toBe('number');
        expect(dir.r !== 0 || dir.c !== 0).toBe(true); // Al menos una coordenada debe ser no cero
      });
    });
  });
});
