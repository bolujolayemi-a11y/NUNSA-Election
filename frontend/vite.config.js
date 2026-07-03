import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // Only used in local dev — proxies /api to local Express server
    proxy: {
      '/api': 'http://localhost:4000',
    },
  },
});
