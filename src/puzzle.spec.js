import { describe, it, expect } from 'vitest';
import { puzzles } from './puzzle.js';

describe('puzzle.js', () => {
  it('debería exportar un array de puzzles', () => {
    expect(Array.isArray(puzzles)).toBe(true);
    expect(puzzles.length).toBeGreaterThan(0);
  });
  it('cada puzzle debe tener theme, words y secret', () => {
    for (const p of puzzles) {
      expect(typeof p.theme).toBe('string');
      expect(Array.isArray(p.words)).toBe(true);
      expect(typeof p.secret).toBe('string');
    }
  });
});
