import tailwindcss from '@tailwindcss/postcss';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  root: resolve(__dirname, 'github-pages'),
  base: '/oval-home-calculator-cn/',
  publicDir: resolve(__dirname, 'public'),
  css: { postcss: { plugins: [tailwindcss()] } },
  resolve: { alias: { '@': resolve(__dirname, '.') } },
  plugins: [react()],
  build: {
    outDir: resolve(__dirname, 'pages-dist'),
    emptyOutDir: true,
  },
});
