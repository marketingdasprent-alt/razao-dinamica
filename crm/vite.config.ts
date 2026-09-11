import { defineConfig, loadEnv } from 'vite'
import { localApi } from './server/local-api.js'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig(({ mode }) => {
  const env = { ...loadEnv(mode, __dirname, ''), ...process.env }
  return {
  plugins: [react(), {
    name: 'crm-local-api',
    configureServer(server) {
      server.middlewares.use(localApi(env))
    },
  }],
  server: { port: 5175 },
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  }
})
