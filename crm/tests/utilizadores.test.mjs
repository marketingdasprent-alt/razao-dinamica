import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createHandler } from '../api/utilizadores.js'

const env = { SUPABASE_URL: 'http://supabase.test', SUPABASE_SERVICE_ROLE_KEY: 'server-only-test-key', CRM_SITE_URL: 'https://crm.test' }
const body = { nome: 'Gestor Teste', email: 'gestor@test.invalid', papel: 'gestor', password: 'Temporary-Test-123!' }
function setup(options = {}) {
  const calls = []
  const client = (_url, _key, config) => ({
    auth: {
      getUser: async token => ({ data: { user: options.invalidToken ? null : { id: 'admin-id' } }, error: options.invalidToken ? {} : null }),
      admin: {
        createUser: async (...args) => {
          calls.push(['create', ...args]); return { data: { user: { id: 'new-id' } }, error: options.createError ? {} : null }
        },
        updateUserById: async (...args) => {
          calls.push(['updateUserById', ...args]); return { error: options.updatePwError ? {} : null }
        },
        deleteUser: async (...args) => {
          calls.push(['deleteUser', ...args]); return { error: options.deleteUserError ? {} : null }
        },
      },
    },
    from: table => ({
      select: () => ({ eq: () => ({
        single: async () => ({ data: options.profile ?? { ativo: true, papel: 'admin', exigir_troca_senha: false }, error: null }),
        maybeSingle: async () => ({ data: options.existing ? { id: 'existing-id' } : null, error: null }),
      }) }),
      insert: async data => { calls.push(['insert', data]); return { error: options.insertError ? {} : null } },
      update: data => ({ eq: async (...args) => {
        calls.push(['update', table, data, ...args])
        if ('exigir_troca_senha' in data) return { error: options.updateFlagError ? {} : null }
        if ('ativo' in data) return { error: options.lockError ? {} : null }
        return { error: null }
      } }),
    }),
    rpc: async (name, params) => {
      calls.push(['rpc', config.global?.headers.Authorization, name, params])
      if (name === 'excluir_perfil') return { data: null, error: options.deleteRpcError ? { message: options.deleteRpcMessage } : null }
      return { data: {}, error: options.rpcError ? {} : null }
    },
  })
  const handler = createHandler({ env: options.noConfig ? {} : env, client })
  async function run(overrides = {}) {
    const response = { statusCode: 200, headers: {}, setHeader(k, v) { this.headers[k] = v }, status(code) { this.statusCode = code; return this }, json(data) { this.data = data; return this } }
    await handler({ method: 'POST', headers: { authorization: 'Bearer test-token', origin: 'https://crm.test' }, body, ...overrides }, response)
    return response
  }
  return { run, calls }
}
test('Método e configuração inválidos não criam contas', async () => {
  const a = setup(); assert.equal((await a.run({ method: 'GET' })).statusCode, 405); assert.equal(a.calls.length, 0)
  const b = setup({ noConfig: true }); assert.equal((await b.run()).statusCode, 503)
})
test('Token ausente, inválido, gestor e admin desativado são recusados', async () => {
  for (const options of [{ invalidToken: true }, { profile: { ativo: true, papel: 'gestor' } }, { profile: { ativo: false, papel: 'admin' } }]) {
    const app = setup(options); assert.ok([401, 403].includes((await app.run()).statusCode)); assert.equal(app.calls.length, 0)
  }
  assert.equal((await setup().run({ headers: {} })).statusCode, 401)
})
test('Origem externa e entradas inválidas são recusadas', async () => {
  const app = setup()
  assert.equal((await app.run({ headers: { authorization: 'Bearer token', origin: 'https://other.test' } })).statusCode, 403)
  for (const invalid of [{ ...body, papel: 'owner' }, { ...body, email: 'invalido' }, { ...body, nome: '' }, { ...body, password: 'curta' }, { ...body, password: 'a'.repeat(73) }, '{invalid']) {
    assert.equal((await app.run({ body: invalid })).statusCode, 400)
  }
  assert.equal(app.calls.length, 0)
})
test('Criação direta exige troca da senha e não envia convite', async () => {
  const app = setup(); const response = await app.run()
  assert.equal(response.statusCode, 201)
  assert.equal(response.headers['Cache-Control'], 'no-store')
  assert.equal(app.calls[0][1].email_confirm, true)
  assert.equal(app.calls[0][1].password, body.password)
  assert.equal(app.calls[1][1].exigir_troca_senha, true)
  assert.ok(!JSON.stringify(response.data).includes(body.password))
  assert.equal(app.calls[1][1].papel, 'gestor')
  assert.ok(!JSON.stringify(response.data).includes(env.SUPABASE_SERVICE_ROLE_KEY))
})
test('Conta duplicada, falha no Auth e falha parcial não aparentam sucesso', async () => {
  for (const options of [{ existing: true }, { createError: true }, { insertError: true }]) {
    const app = setup(options); assert.equal((await app.run()).statusCode, 409)
    if (options.existing) assert.equal(app.calls.length, 0)
  }
})
test('Alteração de perfil usa JWT do autor, repassa a permissão de edição e propaga recusa da transação', async () => {
  const request = { method: 'PATCH', body: { ...body, id: '00000000-0000-4000-8000-000000000001', ativo: false, podeEditarLeads: true } }
  const app = setup(); assert.equal((await app.run(request)).statusCode, 200)
  assert.equal(app.calls[0][1], 'Bearer test-token')
  assert.equal(app.calls[0][2], 'alterar_perfil')
  assert.equal(app.calls[0][3].p_pode_editar, true)
  assert.equal((await setup({ rpcError: true }).run(request)).statusCode, 409)
})
test('Alteração de perfil sem indicar a permissão de edição é recusada', async () => {
  const app = setup()
  const request = { method: 'PATCH', body: { ...body, id: '00000000-0000-4000-8000-000000000001', ativo: false } }
  assert.equal((await app.run(request)).statusCode, 400)
  assert.equal(app.calls.length, 0)
})
test('Reposição de senha não exige nome/perfil, marca troca obrigatória e não devolve a senha', async () => {
  const alvo = '00000000-0000-4000-8000-000000000002'
  const request = { method: 'PATCH', body: { id: alvo, newPassword: 'Nova-Temp-Password-123!' } }
  const app = setup(); const response = await app.run(request)
  assert.equal(response.statusCode, 200)
  assert.equal(app.calls[0][0], 'updateUserById')
  assert.equal(app.calls[0][1], alvo)
  assert.equal(app.calls[0][2].password, request.body.newPassword)
  assert.equal(app.calls[1][0], 'update')
  assert.equal(app.calls[1][2].exigir_troca_senha, true)
  assert.ok(!JSON.stringify(response.data).includes(request.body.newPassword))
})
test('Reposição de senha recusa senha curta/longa e propaga falhas', async () => {
  const alvo = '00000000-0000-4000-8000-000000000002'
  const app = setup()
  for (const newPassword of ['curta', 'a'.repeat(73)]) {
    assert.equal((await app.run({ method: 'PATCH', body: { id: alvo, newPassword } })).statusCode, 400)
  }
  assert.equal((await app.run({ method: 'PATCH', body: { id: 'nao-e-uuid', newPassword: 'Nova-Temp-Password-123!' } })).statusCode, 400)
  assert.equal(app.calls.length, 0)
  const request = { method: 'PATCH', body: { id: alvo, newPassword: 'Nova-Temp-Password-123!' } }
  assert.equal((await setup({ updatePwError: true }).run(request)).statusCode, 409)
  assert.equal((await setup({ updateFlagError: true }).run(request)).statusCode, 409)
})
test('Falha ao marcar a troca obrigatória desativa a conta por segurança (falha fechada)', async () => {
  const alvo = '00000000-0000-4000-8000-000000000002'
  const request = { method: 'PATCH', body: { id: alvo, newPassword: 'Nova-Temp-Password-123!' } }
  const app = setup({ updateFlagError: true })
  const response = await app.run(request)
  assert.equal(response.statusCode, 409)
  assert.equal(app.calls[1][2].exigir_troca_senha, true)
  assert.equal(app.calls[2][2].ativo, false)
  assert.match(response.data.error, /desativada/)
})
test('Se nem a desativação de segurança for possível, o aviso é mais urgente', async () => {
  const alvo = '00000000-0000-4000-8000-000000000002'
  const request = { method: 'PATCH', body: { id: alvo, newPassword: 'Nova-Temp-Password-123!' } }
  const app = setup({ updateFlagError: true, lockError: true })
  const response = await app.run(request)
  assert.equal(response.statusCode, 409)
  assert.match(response.data.error, /responsável técnico/)
})
test('Exclusão usa o JWT do autor e apaga a conta de acesso depois do perfil', async () => {
  const alvo = '00000000-0000-4000-8000-000000000002'
  const app = setup()
  const response = await app.run({ method: 'DELETE', body: { id: alvo } })
  assert.equal(response.statusCode, 200)
  assert.equal(app.calls[0][1], 'Bearer test-token')
  assert.equal(app.calls[0][2], 'excluir_perfil')
  assert.deepEqual(app.calls[0][3], { p_id: alvo })
  assert.equal(app.calls[1][0], 'deleteUser')
  assert.equal(app.calls[1][1], alvo)
})
test('Exclusão recusa id inválido sem chamar o banco', async () => {
  const app = setup()
  assert.equal((await app.run({ method: 'DELETE', body: { id: 'nao-e-uuid' } })).statusCode, 400)
  assert.equal(app.calls.length, 0)
})
test('Exclusão propaga a recusa do RPC (último admin ou leads por reatribuir)', async () => {
  const alvo = '00000000-0000-4000-8000-000000000002'
  const app = setup({ deleteRpcError: true, deleteRpcMessage: 'Este utilizador tem 2 lead(s) atribuído(s). Reatribua-os antes de excluir.' })
  const response = await app.run({ method: 'DELETE', body: { id: alvo } })
  assert.equal(response.statusCode, 409)
  assert.match(response.data.error, /Reatribua-os/)
  assert.equal(app.calls.length, 1)
})
test('Exclusão avisa se o perfil saiu mas a conta de acesso não pôde ser apagada', async () => {
  const alvo = '00000000-0000-4000-8000-000000000002'
  const app = setup({ deleteUserError: true })
  const response = await app.run({ method: 'DELETE', body: { id: alvo } })
  assert.equal(response.statusCode, 409)
  assert.match(response.data.error, /responsável técnico/)
})
