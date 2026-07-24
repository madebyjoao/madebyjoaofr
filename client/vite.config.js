import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      // @primeicons/vue@8.0.0-alpha.1 declares "./core" as dist/esm/core.mjs
      // but ships the file at dist/esm/core/index.mjs
      '@primeicons/vue/core': fileURLToPath(
        new URL('./node_modules/@primeicons/vue/dist/esm/core/index.mjs', import.meta.url),
      ),
    },
  },
  server: {
    proxy: {
      "/api": "http://localhost:3000",
      "/uploads": "http://localhost:3000",
    },
  },
  optimizeDeps: {
    exclude: ['@primeicons/vue'],
  },
})
