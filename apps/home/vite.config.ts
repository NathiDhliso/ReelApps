import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  envDir: '../../',
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
