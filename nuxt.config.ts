import { readdirSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const erasDir = fileURLToPath(new URL('./app/eras', import.meta.url))

// Every era folder (NN-slug) becomes a prerendered route; rooms nested inside
// an era (e.g. 01-bbs/pre-web) get their own route too.
const eraRoutes = readdirSync(erasDir, { withFileTypes: true })
  .filter((d) => d.isDirectory() && /^\d\d-/.test(d.name))
  .flatMap((d) => {
    const routes = [`/eras/${d.name}/`]
    for (const sub of readdirSync(`${erasDir}/${d.name}`, { withFileTypes: true })) {
      if (sub.isDirectory() && existsSync(`${erasDir}/${d.name}/${sub.name}/demo.html`)) {
        routes.push(`/eras/${d.name}/${sub.name}/`)
      }
    }
    return routes
  })

export default defineNuxtConfig({
  compatibilityDate: '2026-10-01',
  ssr: true,
  devtools: { enabled: false },
  telemetry: false,

  css: ['~/assets/shell.css', '~/assets/stage.css'],

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'color-scheme', content: 'light dark' },
        { name: 'theme-color', content: '#101014' },
      ],
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    },
  },

  router: { options: { strict: false } },

  nitro: {
    preset: 'static',
    prerender: {
      crawlLinks: true,
      failOnError: true,
      routes: ['/', '/about/', ...eraRoutes],
    },
  },

  // Era-to-era navigation uses real <a href> page loads so cross-document
  // View Transitions (@view-transition in shell.css) run between eras.
  experimental: {
    payloadExtraction: true,
  },

  vite: {
    build: { assetsInlineLimit: 0 },
  },
})
