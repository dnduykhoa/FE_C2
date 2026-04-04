import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/auth': 'http://localhost:3000',
      '/users': 'http://localhost:3000',
      '/roles': 'http://localhost:3000',
      '/products': 'http://localhost:3000',
      '/categories': 'http://localhost:3000',
      '/carts': 'http://localhost:3000',
      '/orders': 'http://localhost:3000',
      '/reservations': 'http://localhost:3000',
      '/inventories': 'http://localhost:3000',
      '/payments': 'http://localhost:3000',
      '/reviews': 'http://localhost:3000',
      '/messages': 'http://localhost:3000',
      '/support-chat': 'http://localhost:3000',
      '/uploads': 'http://localhost:3000'
    }
  }
})
