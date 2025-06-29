import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  envDir: '../../',
  plugins: [react()],
  server: {
    host: true,
    port: 5180,
    strictPort: false,
    open: true,
  },
  build: {
    outDir: 'dist',
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
