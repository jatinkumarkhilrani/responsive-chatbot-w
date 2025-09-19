import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import { resolve } from 'path'

// GitHub Pages standalone build configuration - without Spark dependencies
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@github/spark/hooks': resolve(__dirname, 'src/hooks/useKV.ts')
    }
  },
  base: '/responsive-chatbot-w/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    copyPublicDir: true,
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-tabs', '@radix-ui/react-select'],
          'icons-vendor': ['@phosphor-icons/react']
        }
      }
    }
  },
  publicDir: 'public',
  css: {
    devSourcemap: false
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@phosphor-icons/react',
      '@radix-ui/react-dialog',
      '@radix-ui/react-tabs',
      '@radix-ui/react-select'
    ]
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    'global': 'globalThis'
  }
});