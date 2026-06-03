// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // Increase chunk size warning limit (optional)
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor/react bundles
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          
          // Split UI libraries
          'vendor-ui': ['lucide-react', 'framer-motion', 'react-hot-toast'],
          
          // Split Firebase
          'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage', 'firebase/messaging'],
          
          // Split mapping libraries
          'vendor-maps': ['leaflet', '@react-leaflet/core'],
          
          // Split AI/other services
          'vendor-ai': ['@google/generative-ai', 'socket.io-client'],
        }
      }
    }
  }
})