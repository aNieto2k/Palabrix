import { describe, it, expect } from 'vitest';
import { puzzles } from './puzzle.js';
import { launchConfetti } from './confetti.js';

describe('Integración: Palabrix', () => {
  it('puzzles y confetti funcionan juntos', () => {
    expect(Array.isArray(puzzles)).toBe(true);
    document.body.innerHTML = '';
    launchConfetti();
    expect(document.querySelectorAll('.confetti-piece').length).toBeGreaterThan(0);
  });
});
