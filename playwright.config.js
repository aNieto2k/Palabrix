// playwright.config.js
// Configuración básica para Playwright en este proyecto
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  webServer: {
    command: 'npm run preview',
    port: 3001,
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
  },
  use: {
    headless: true,
    baseURL: 'http://localhost:3001',
  },
});
