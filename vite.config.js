import { copyFileSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  publicDir: false,
  plugins: [{
    name: 'copy-root-static-files',
    closeBundle() {
      copyFileSync(resolve(process.cwd(), 'robots.txt'), resolve(process.cwd(), 'dist/robots.txt'))
      copyFileSync(resolve(process.cwd(), 'sitemap.xml'), resolve(process.cwd(), 'dist/sitemap.xml'))
      mkdirSync(resolve(process.cwd(), 'dist/assets/images'), { recursive: true })
      copyFileSync(resolve(process.cwd(), 'assets/images/og-razao-dinamica.webp'), resolve(process.cwd(), 'dist/assets/images/og-razao-dinamica.webp'))
    }
  }],
  build: {
    rollupOptions: {
      input: {
        main: resolve(process.cwd(), 'index.html'),
        notFound: resolve(process.cwd(), '404.html'),
        cookies: resolve(process.cwd(), 'cookies.html'),
        privacidade: resolve(process.cwd(), 'privacidade.html'),
        informacaoLegal: resolve(process.cwd(), 'informacao-legal.html'),
        landingPage: resolve(process.cwd(), 'landing-page/index.html')
      }
    }
  }
})
