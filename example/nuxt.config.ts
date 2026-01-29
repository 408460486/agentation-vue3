// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  nitro: {
    preset: 'cloudflare-module',
  },

  app: {
    baseURL: process.env.NUXT_APP_BASE_URL || '/',
    head: {
      title: 'Agentation Vue 3 Example',
      htmlAttrs: {
        lang: 'en',
      },
    },
  },

  devServer: {
    port: 3003,
    host: '0.0.0.0',
  },

  // Exclude index.ts from component auto-scan to avoid naming conflicts
  components: {
    dirs: [
      {
        path: '~/components',
        ignore: ['**/index.ts'],
      },
    ],
  },

  css: [
    // Only import dist CSS in production (when using npm package)
    // In development, styles come from source components via CSS Modules
    ...(process.env.NODE_ENV === 'production' ? ['agentation-vue3/dist/style.css'] : []),
    '~/assets/globals.scss',
  ],

  // Client-side only for DOM manipulation
  ssr: false,

  vite: {
    // Local development: use source code directly for HMR
    // 本地开发：直接使用源码以支持热更新
    resolve: {
      alias: process.env.NODE_ENV !== 'production'
        ? { 'agentation-vue3': '../src/index.ts' }
        : {},
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
        },
      },
    },
  },

  compatibilityDate: '2026-01-26',
})