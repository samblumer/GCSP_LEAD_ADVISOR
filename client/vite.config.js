import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Proxy /api/* to the Express server during development.
// On Replit, replace target with your server's Replit URL if running separately.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
