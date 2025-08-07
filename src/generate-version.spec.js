import { describe, it, expect } from 'vitest';
import { readFileSync, unlinkSync } from 'fs';
import { join } from 'path';

describe('generate-version.js', () => {
  it('debería generar un archivo .env con la variable VITE_BUILD_VERSION', async () => {
    const { default: gen } = await import('../generate-version.js');
    const envPath = join(__dirname, '.env');
    const envContent = readFileSync(envPath, 'utf-8');
    expect(envContent).toMatch(/VITE_BUILD_VERSION=.*/);
    // Limpieza
    unlinkSync(envPath);
  });
});
