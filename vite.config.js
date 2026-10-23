import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (/[\\/]node_modules[\\/](three|@react-three)[\\/]/.test(id)) return 'three'
          if (/[\\/]node_modules[\\/](gsap|framer-motion|motion|motion-dom|motion-utils|lenis)[\\/]/.test(id)) return 'motion'
          return undefined
        },
      },
    },
  },
})
