import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import paths from 'vite-tsconfig-paths';

// https://vite.dev/config/
export default defineConfig({
  plugins: [paths(), react()],

  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
    alias: {
      '@': '/src',
    },
  },

  optimizeDeps: {
    include: ['react', 'react-dom', 'lucide-react'],
  },

  build: {
    outDir: 'build',
    emptyOutDir: true,
    sourcemap: true,
    chunkSizeWarningLimit: 1000,
    minify: 'esbuild',
  },

  define: {
    __APP_VERSION__: JSON.stringify('0.1.0'),
  },

  server: {
    port: 3000,
    open: true,
  },
});
