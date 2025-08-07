import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'src', // Cambia el root a src para que npm run dev sirva src/index.html
  base: '', // rutas relativas para dist
  build: {
    outDir: '../dist', // Salida fuera de src
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html')
      },
      output: {
        entryFileNames: 'main.[hash].min.js',
        assetFileNames: 'main.[hash][extname]'
      }
    }
  }
});
