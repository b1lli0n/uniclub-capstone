import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://localhost:5000',
        changeOrigin: true,
        secure: false, // allow self-signed certificate
      },
      '/uploads': {
        target: 'https://localhost:5000',
        changeOrigin: true,
        secure: false, // allow self-signed certificate
      },
    },
  },
})
