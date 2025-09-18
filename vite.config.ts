import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import { resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const projectRoot = process.env.PROJECT_ROOT || __dirname

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const isProduction = mode === 'production'
  const isGitHubPages = process.env.GITHUB_PAGES === 'true'
  
  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': resolve(projectRoot, 'src')
      }
    },
    base: isGitHubPages ? '/sahaay-ai-messaging/' : '/',
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
      copyPublicDir: true,
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
    preview: {
      port: 4173,
      host: true
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
    }
  }
});
