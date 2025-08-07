import { describe, it, expect } from 'vitest';
// Aquí puedes importar y testear funciones puras de palabrix.js si las extraes

describe('palabrix.js', () => {
  it('debería importar sin errores', () => {
    expect(() => import('./palabrix.js')).not.toThrow();
  });
});
