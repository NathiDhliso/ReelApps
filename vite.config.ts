import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig({
  
  plugins: [react()],
  resolve: {
    alias: {
      '@reelapps/auth': fileURLToPath(new URL('./packages/auth/src', import.meta.url)),
      '@reelapps/config': fileURLToPath(new URL('./packages/config/src', import.meta.url)),
      '@reelapps/types': fileURLToPath(new URL('./packages/types/src', import.meta.url)),
      '@reelapps/ui': fileURLToPath(new URL('./packages/ui/src', import.meta.url)),
    },
  },
  server: {
    host: true,
    port: 5176,
    strictPort: true,
    open: true,
  },
  build: {
    outDir: 'dist',
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
}); 