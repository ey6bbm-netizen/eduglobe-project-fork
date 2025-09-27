import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // This helps in local development if you run the Vercel backend locally
    proxy: {
      '/api': 'http://localhost:3000' 
    }
  }
})
