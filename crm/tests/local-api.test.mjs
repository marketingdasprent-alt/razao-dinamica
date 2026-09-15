import { test } from 'node:test'
import assert from 'node:assert/strict'
import { Readable } from 'node:stream'
import { localApi } from '../server/local-api.js'

async function request({ url = '/api/utilizadores', method = 'POST', body = '{}', contentType = 'application/json' } = {}) {
  const req = Readable.from([Buffer.from(body)])
  Object.assign(req, { url, method, headers: { 'content-type': contentType } })
  const res = { statusCode: 200, headers: {}, setHeader(k, v) { this.headers[k] = v }, end(value) { this.body = value } }
  let next = false
  await localApi({})(req, res, () => { next = true })
  return { ...res, next }
}
test('Adaptador local encaminha outros caminhos', async () => {
  assert.equal((await request({url:'/leads'})).next, true)
})
test('Adaptador local devolve JSON de configuração ausente', async () => {
  const res = await request()
  assert.equal(res.statusCode, 503)
  assert.match(res.headers['Content-Type'], /application\/json/)
  assert.match(JSON.parse(res.body).error, /configurada/)
})
test('Adaptador local bloqueia método, corpo inválido e pedidos grandes', async () => {
  assert.equal((await request({method:'GET'})).statusCode, 405)
  assert.equal((await request({body:'{'})).statusCode, 400)
  assert.equal((await request({contentType:'text/plain'})).statusCode, 415)
  assert.equal((await request({body:'x'.repeat(17000)})).statusCode, 413)
})
