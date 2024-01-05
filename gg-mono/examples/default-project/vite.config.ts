import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'

export default defineConfig({
  plugins: [solid()],
  server: {
    open: true,
    host: '127.0.0.1'
  },
  build: {
    sourcemap: true,
  }
})
