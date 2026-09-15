import { createHandler } from '../api/utilizadores.js'

// Adaptador para desenvolvimento: executa o mesmo handler usado pela Vercel.
// Este módulo é importado apenas pela configuração do Vite, nunca pelo frontend.
export function localApi(env) {
  const handler = createHandler({ env })
  return async (req, res, next) => {
    if (req.url?.split('?')[0] !== '/api/utilizadores') return next()
    const reply = (code, data) => {
      res.statusCode = code
      res.setHeader('Content-Type', 'application/json; charset=utf-8')
      res.setHeader('Cache-Control', 'no-store')
      res.end(JSON.stringify(data))
    }
    if (['POST', 'PATCH'].includes(req.method)) {
      if (!req.headers['content-type']?.toLowerCase().startsWith('application/json')) {
        return reply(415, { error: 'Envie os dados em formato JSON.' })
      }
      try {
        const chunks = []
        let size = 0
        for await (const chunk of req) {
          size += Buffer.byteLength(chunk)
          if (size > 16384) return reply(413, { error: 'Pedido demasiado grande.' })
          chunks.push(Buffer.from(chunk))
        }
        req.body = JSON.parse(Buffer.concat(chunks).toString('utf8'))
      } catch { return reply(400, { error: 'Dados inválidos.' }) }
    }
    res.status = code => { res.statusCode = code; return res }
    res.json = data => reply(res.statusCode, data)
    try { await handler(req, res) }
    catch { reply(500, { error: 'Não foi possível processar o pedido.' }) }
  }
}
