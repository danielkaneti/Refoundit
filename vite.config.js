import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@data': path.resolve(__dirname, './src/data'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@styles': path.resolve(__dirname, './src/styles'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@shared': path.resolve(__dirname, './shared'),
    },
  },
  // pdfjs-dist uses top-level await
  build: {
    target: 'es2022',
  },
  optimizeDeps: {
    esbuildOptions: { target: 'es2022' },
  },
  server: {
    port: 5173,
    // Cloudflare Functions run under `npm run dev:api` (wrangler, port 8788)
    proxy: {
      '/api': 'http://127.0.0.1:8788',
    },
    watch: {
      usePolling: true,
    },
  },
});
