import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
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