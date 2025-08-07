import { describe, it, expect, vi } from 'vitest';
import { launchConfetti } from './confetti.js';

describe('confetti.js', () => {
  it('debería crear elementos confeti en el DOM', () => {
    document.body.innerHTML = '';
    launchConfetti();
    const confetti = document.querySelectorAll('.confetti-piece');
    expect(confetti.length).toBeGreaterThan(0);
  });
});
