import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/bambu-user-api': {
        target: 'https://api.bambulab.com/v1/user-service',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/bambu-user-api/, ''),
      },
      '/bambu-iot-api': {
        target: 'https://api.bambulab.com/v1/iot-service',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/bambu-iot-api/, ''),
      }
    }
  }
})
