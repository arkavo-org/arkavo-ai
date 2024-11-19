import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import fs from 'fs';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {

    https: {
      key: fs.readFileSync('/.secrets/key.pem'),
      cert: fs.readFileSync('/.secrets/cert.pem')
    },
    proxy: {
      '/api': {
        target: 'https://ollama.juliancoy.us',
        changeOrigin: true,
        autoRewrite: true,
      }
    }
  }
})
