import { describe, it, expect } from 'vitest';

// main.js solo importa CSS y JS, testear que no lanza errores al importar

describe('main.js', () => {
  it('debería importar sin errores', () => {
    expect(() => import('./main.js')).not.toThrow();
  });
});
