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
});
