import { resolve } from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  publicDir: false,
  build: {
    rollupOptions: {
      input: {
        main: resolve(process.cwd(), 'index.html'),
        cookies: resolve(process.cwd(), 'cookies.html'),
        privacidade: resolve(process.cwd(), 'privacidade.html'),
        informacaoLegal: resolve(process.cwd(), 'informacao-legal.html')
      }
    }
  }
})
