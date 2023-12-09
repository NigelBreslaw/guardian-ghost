import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mkcert from 'vite-plugin-mkcert'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), mkcert()],
  server: {
    port: 7777,
    open: true,
    host: '127.0.0.1'
  },
  build: {
    sourcemap: true,
  }
})
