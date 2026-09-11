// Servidor de dados fictícios para revisão visual. Não contacta o Supabase.
import http from 'node:http'
const adminId = '00000000-0000-4000-8000-000000000001'
const gestorId = '00000000-0000-4000-8000-000000000002'
const profiles = [
  { id: adminId, nome: 'Administração', email: 'admin@example.test', papel: 'admin', ativo: true },
  { id: gestorId, nome: 'Joana Silva', email: 'gestor@example.test', papel: 'gestor', ativo: true },
  { id: '00000000-0000-4000-8000-000000000003', nome: 'Miguel Costa', email: 'miguel@example.test', papel: 'gestor', ativo: false },
]
const leads = ['Ana Martins', 'Pedro Santos', 'Carla Oliveira'].map((nome, i) => ({
  id: `00000000-0000-4000-8000-00000000001${i}`, nome, apelido: null, email: `lead${i}@example.test`, empresa: ['Atelier Norte', 'Santos & Filhos', 'Oliveira Design'][i], ddi: '+351', telefone: '910000000', servico: 'Contabilidade', mensagem: 'Gostaria de receber informações sobre os vossos serviços.', consentimento: true, origem: 'home', estado: i === 1 ? 'Contactado' : 'Novo', atribuido_a: i === 1 ? gestorId : null, atribuido_em: null, criado_em: new Date().toISOString(), atualizado_em: new Date().toISOString(),
}))
const notes = []
const messages = []
http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5187')
  res.setHeader('Access-Control-Allow-Headers', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS')
  res.setHeader('Content-Type', 'application/json')
  if (req.method === 'OPTIONS') { res.end(); return }
  let raw = ''; for await (const chunk of req) raw += chunk
  const body = raw ? JSON.parse(raw) : {}
  const url = new URL(req.url, 'http://localhost')
  const userId = req.headers.authorization?.includes('gestor') ? gestorId : adminId
  const send = data => res.end(JSON.stringify(data))
  if (url.pathname === '/auth/v1/token') {
    const p = profiles.find(p => p.email === body.email) ?? profiles[0]
    return send({ access_token: p.papel === 'gestor' ? 'preview-gestor' : 'preview-admin', refresh_token: 'preview', token_type: 'bearer', expires_in: 3600, expires_at: Math.floor(Date.now()/1000)+3600, user: { ...p, aud: 'authenticated', role: 'authenticated', user_metadata: {} } })
  }
  if (url.pathname === '/auth/v1/logout') return send({})
  if (url.pathname === '/rest/v1/perfis') {
    const id = url.searchParams.get('id')?.slice(3)
    return send(id ? profiles.find(p => p.id === id) : profiles)
  }
  if (url.pathname === '/rest/v1/leads') {
    const id = url.searchParams.get('id')?.slice(3)
    let data = leads.filter(l => userId === adminId || l.atribuido_a === userId || !l.atribuido_a)
    if (id) data = data.filter(l => l.id === id)
    return send(id ? data[0] ?? null : data)
  }
  if (url.pathname.startsWith('/rest/v1/rpc/')) {
    const lead = leads.find(l => l.id === body.p_id)
    if (url.pathname.endsWith('mudar_estado_lead')) {
      lead.estado = body.p_estado
      if (!lead.atribuido_a && userId !== adminId) lead.atribuido_a = userId
    } else { lead.atribuido_a = body.p_responsavel; if (!body.p_responsavel) lead.estado = 'Novo' }
    lead.atualizado_em = new Date().toISOString()
    return send(lead)
  }
  if (url.pathname === '/rest/v1/notas') return send(notes)
  if (url.pathname === '/rest/v1/whatsapp_mensagens') return send(messages)
  return send([])
}).listen(54329, '127.0.0.1', () => console.log('Dados fictícios em http://127.0.0.1:54329'))
