import { createClient } from '@supabase/supabase-js'

export function createHandler({ env = process.env, client = createClient } = {}) {
  return async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store')
    if (!['POST', 'PATCH'].includes(req.method)) {
      res.setHeader('Allow', 'POST, PATCH')
      return res.status(405).json({ error: 'Método não permitido.' })
    }
    const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, CRM_SITE_URL } = env
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !CRM_SITE_URL) {
      return res.status(503).json({ error: 'A gestão de contas ainda não foi configurada.' })
    }
    const token = /^Bearer (\S+)$/i.exec(req.headers.authorization || '')?.[1]
    if (!token) return res.status(401).json({ error: 'Inicie sessão novamente.' })
    try {
      const origin = new URL(CRM_SITE_URL).origin
      if (req.headers.origin && req.headers.origin !== origin) {
        return res.status(403).json({ error: 'Origem não permitida.' })
      }
      const admin = client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
      const { data: auth, error: authError } = await admin.auth.getUser(token)
      if (authError || !auth.user) return res.status(401).json({ error: 'Sessão inválida.' })
      const { data: perfil, error: perfilError } = await admin.from('perfis')
        .select('papel, ativo, exigir_troca_senha').eq('id', auth.user.id).single()
      if (perfilError || !perfil?.ativo || perfil.papel !== 'admin' || perfil.exigir_troca_senha !== false) {
        return res.status(403).json({ error: 'Acesso reservado ao administrador.' })
      }
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
      if (!body || typeof body.nome !== 'string' || !body.nome.trim() || body.nome.trim().length > 120 ||
        !['gestor', 'admin'].includes(body.papel)) {
        return res.status(400).json({ error: 'Indique um nome e um perfil válidos.' })
      }
      if (req.method === 'PATCH') {
        if (typeof body.id !== 'string' || !/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(body.id) || typeof body.ativo !== 'boolean') {
          return res.status(400).json({ error: 'Utilizador ou estado inválido.' })
        }
        // A operação usa a sessão do autor para voltar a validar privilégios
        // dentro da transação e impedir a remoção do último administrador.
        const caller = client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
          global: { headers: { Authorization: `Bearer ${token}` } },
          auth: { persistSession: false, autoRefreshToken: false },
        })
        const { data, error } = await caller.rpc('alterar_perfil', {
          p_id: body.id, p_nome: body.nome.trim(), p_papel: body.papel, p_ativo: body.ativo,
        })
        if (error) return res.status(409).json({ error: 'Não foi possível alterar. Mantenha pelo menos um administrador ativo e atualize a página.' })
        return res.status(200).json({ user: data })
      }
      if (typeof body.email !== 'string' || body.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
        return res.status(400).json({ error: 'Indique um email válido.' })
      }
      const email = body.email.trim().toLowerCase()
      const { data: existing, error: existingError } = await admin.from('perfis').select('id').eq('email', email).maybeSingle()
      if (existingError) return res.status(503).json({ error: 'Não foi possível verificar as contas existentes.' })
      if (existing) return res.status(409).json({ error: 'Esta conta já existe. Altere o perfil na lista.' })
      if (typeof body.password !== 'string' || body.password.length < 12 || Buffer.byteLength(body.password, 'utf8') > 72) {
        return res.status(400).json({ error: 'A senha temporária deve ter pelo menos 12 caracteres e no máximo 72 bytes.' })
      }
      const { data, error } = await admin.auth.admin.createUser({
        email, password: body.password, email_confirm: true,
        user_metadata: { nome: body.nome.trim() },
      })
      if (error || !data.user) return res.status(409).json({ error: 'Não foi possível criar a conta. Verifique se o email já existe e os requisitos da senha.' })
      const { error: insertError } = await admin.from('perfis').insert({
        id: data.user.id, nome: body.nome.trim(), email, papel: body.papel, ativo: true, exigir_troca_senha: true,
      })
      if (insertError) {
        // Falha fechada: uma conta Auth sem perfil não acede a dados do CRM.
        // Não apagar a conta: pode ter sido criada por outro pedido concorrente.
        return res.status(409).json({ error: 'A conta foi criada, mas o perfil não foi guardado. O acesso permanece bloqueado. Peça ao responsável técnico para verificar o perfil antes de repetir.' })
      }
      return res.status(201).json({ message: 'Conta criada. Entregue a senha temporária ao utilizador por um canal privado. Ele terá de a trocar no primeiro acesso.' })
    } catch {
      return res.status(400).json({ error: 'Não foi possível concluir o pedido. Verifique os dados e tente novamente.' })
    }
  }
}

export default createHandler()
