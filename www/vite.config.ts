import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import fs from 'fs';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {

    https: {
      key: fs.readFileSync('/.secrets/localhost-key.pem'),
      cert: fs.readFileSync('/.secrets/localhost.pem')
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
