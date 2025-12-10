import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4242',
        changeOrigin: true,
        secure: false,
      },
      '/auth': {
        target: 'http://localhost:4242',
        changeOrigin: true,
        secure: false,
      },
      '/create-payment-intent': {
        target: 'http://localhost:4242',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    // Migliora la gestione dei chunk per ridurre il TBT
    rollupOptions: {
      output: {
        manualChunks: {
          // Separa React dal codice dell'app
          vendor: ['react', 'react-dom'],
          // Se usi framer-motion o altre librerie pesanti, aggiungile qui sotto:
          // animations: ['framer-motion'],
        },
      },
    },
    // Minimizzazione standard
    minify: 'esbuild',
  },
});