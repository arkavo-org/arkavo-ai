import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    https: {
      key: readFileSync('/.secrets/localhost-key.pem'),
      cert: readFileSync('/.secrets/localhost.pem'),
    },
    proxy: {
      '/api': {
        target: 'https://ollama.juliancoy.us',
        changeOrigin: true,
        autoRewrite: true,
      },
    },
  },
});
