import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

const cfAsyncModuleScriptPlugin = () => ({
  name: 'cfasync-module-script',
  transformIndexHtml(html: string) {
    return html.replace(
      /<script\s+type="module"(?![^>]*data-cfasync)/g,
      '<script data-cfasync="false" type="module"',
    )
  },
})

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const devApiTarget = env.VITE_DEV_API_TARGET || process.env.VITE_DEV_API_TARGET || 'http://localhost:8080'

  return {
    plugins: [vue(), cfAsyncModuleScriptPlugin()],
    esbuild: mode === 'production' ? { drop: ['console', 'debugger'] } : {},
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-qrcode': ['qrcode'],
            'vendor-vue-i18n': ['vue-i18n'],
          },
        },
      },
    },
    server: {
      host: '0.0.0.0',
      port: 5173,
      strictPort: true,
      proxy: {
        '/api': {
          target: devApiTarget,
          changeOrigin: true,
        },
        '/uploads': {
          target: devApiTarget,
          changeOrigin: true,
        },
      },
    },
  }
})
