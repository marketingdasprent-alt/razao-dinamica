import { createClient } from '@supabase/supabase-js'

// Envia a senha temporária por email via Brevo, se BREVO_API_KEY estiver
// configurada. Best-effort: nunca impede a criação da conta, que já está
// concluída nesse ponto — só muda a mensagem devolvida ao admin, para ele
// saber se ainda precisa de entregar a senha manualmente.
async function enviarEmailBoasVindas({ env, fetchImpl, nome, email, password, crmUrl }) {
  if (!env.BREVO_API_KEY) return false
  try {
    // Ícone servido pelo próprio CRM (crm/public/, nunca sofre o hashing de
    // build da Vercel) — URL estável, ao contrário dos assets do site
    // institucional, que trocam de nome a cada publicação.
    const iconUrl = new URL('/rd-icon-email.png', crmUrl).href
    const response = await fetchImpl('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'api-key': env.BREVO_API_KEY },
      body: JSON.stringify({
        sender: { name: 'Razão Dinâmica', email: 'geral@razaodinamica.pt' },
        to: [{ email, name: nome }],
        subject: 'O seu acesso ao CRM da Razão Dinâmica',
        htmlContent: `<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;color:#0B1B2B">
          <h2 style="color:#0B1B2B">Razão Dinâmica · CRM</h2>
          <p>Olá, ${nome}.</p>
          <p>A sua conta no CRM da Razão Dinâmica foi criada. Use os dados abaixo para aceder:</p>
          <table style="margin:16px 0"><tr><td style="padding:4px 8px;color:#666">Email</td><td style="padding:4px 8px"><strong>${email}</strong></td></tr>
          <tr><td style="padding:4px 8px;color:#666">Senha temporária</td><td style="padding:4px 8px"><strong>${password}</strong></td></tr></table>
          <p style="text-align:center;margin:24px 0"><a href="${crmUrl}" style="background:#CBA968;color:#0B1B2B;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600;display:inline-block">Aceder ao CRM</a></p>
          <p style="font-size:13px;color:#666">Por segurança, vai ser pedido para definir uma senha nova no primeiro acesso.</p>
          <p style="font-size:13px;color:#666">Se não esperava este email, ignore-o ou contacte a administração.</p>
          <table style="width:100%;margin-top:32px;border-collapse:collapse"><tr><td style="border-top:1px solid #e5e2d9;padding-top:20px;text-align:center">
            <img src="${iconUrl}" width="40" height="40" alt="Razão Dinâmica" style="display:block;margin:0 auto 10px;border:0">
            <p style="font-size:12px;color:#999;margin:0">Razão Dinâmica · Consultoria e Contabilidade</p>
            <p style="font-size:12px;color:#999;margin:4px 0 0"><a href="https://www.razaodinamica.pt" style="color:#4A8288;text-decoration:none">razaodinamica.pt</a> · geral@razaodinamica.pt</p>
          </td></tr></table>
        </div>`,
        textContent: `Olá, ${nome}.\n\nA sua conta no CRM da Razão Dinâmica foi criada.\nEmail: ${email}\nSenha temporária: ${password}\nAceda em: ${crmUrl}\n\nPor segurança, vai ser pedido para definir uma senha nova no primeiro acesso.\n\n--\nRazão Dinâmica · Consultoria e Contabilidade\nrazaodinamica.pt · geral@razaodinamica.pt`,
      }),
    })
    return response.ok
  } catch {
    return false
  }
}

export function createHandler({ env = process.env, client = createClient, fetchImpl = fetch } = {}) {
  return async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store')
    if (!['GET', 'POST', 'PATCH', 'DELETE'].includes(req.method)) {
      res.setHeader('Allow', 'GET, POST, PATCH, DELETE')
      return res.status(405).json({ error: 'Método não permitido.' })
    }
    const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, CRM_SITE_URL, VERCEL_URL } = env
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !CRM_SITE_URL) {
      return res.status(503).json({ error: 'A gestão de contas ainda não foi configurada.' })
    }
    const token = /^Bearer (\S+)$/i.exec(req.headers.authorization || '')?.[1]
    if (!token) return res.status(401).json({ error: 'Inicie sessão novamente.' })
    try {
      // Aceita o domínio configurado (produção/domínio próprio) e também o
      // URL automático que a Vercel atribui a este deployment específico —
      // assim cada preview funciona sem precisar reconfigurar CRM_SITE_URL
      // a cada novo link gerado.
      const allowedOrigins = new Set([new URL(CRM_SITE_URL).origin])
      if (VERCEL_URL) allowedOrigins.add('https://' + VERCEL_URL)
      if (req.headers.origin && !allowedOrigins.has(req.headers.origin)) {
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

      if (req.method === 'GET') {
        // Data do último login já é rastreada pelo próprio Supabase Auth —
        // só expomos o que já existe, nada de novo para manter.
        const { data, error } = await admin.auth.admin.listUsers()
        if (error) return res.status(503).json({ error: 'Não foi possível obter os últimos acessos.' })
        const ultimosAcessos = Object.fromEntries(data.users.map(u => [u.id, u.last_sign_in_at]))
        return res.status(200).json({ ultimosAcessos })
      }

      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
      if (!body) return res.status(400).json({ error: 'Pedido inválido.' })
      const uuidRegex = /^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i

      if (req.method === 'DELETE') {
        if (typeof body.id !== 'string' || !uuidRegex.test(body.id)) {
          return res.status(400).json({ error: 'Utilizador inválido.' })
        }
        // excluir_perfil() já recusa o último administrador ativo e
        // qualquer utilizador que ainda tenha leads em nome dele.
        const caller = client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
          global: { headers: { Authorization: `Bearer ${token}` } },
          auth: { persistSession: false, autoRefreshToken: false },
        })
        const { error: rpcError } = await caller.rpc('excluir_perfil', { p_id: body.id })
        if (rpcError) return res.status(409).json({ error: rpcError.message || 'Não foi possível excluir. Atualize a página e tente novamente.' })
        const { error: authError } = await admin.auth.admin.deleteUser(body.id)
        if (authError) {
          // O perfil já foi removido, então a conta perdeu acesso ao CRM
          // mesmo que a conta de autenticação em si ainda exista (falha
          // fechada) — mas precisa de limpeza manual para não ficar órfã.
          return res.status(409).json({ error: 'O perfil foi removido, mas a conta de acesso não pôde ser apagada. O acesso já está bloqueado; avise o responsável técnico para limpar a conta.' })
        }
        return res.status(200).json({ message: 'Utilizador excluído.' })
      }

      if (req.method === 'PATCH' && typeof body.newPassword === 'string') {
        // Reposição de senha pelo admin: não exige a senha atual da conta
        // (o admin não a conhece) nem confirma a identidade por email —
        // por isso a conta fica marcada para trocar a senha no próximo
        // acesso, igual a uma conta recém-criada.
        if (typeof body.id !== 'string' || !uuidRegex.test(body.id)) {
          return res.status(400).json({ error: 'Utilizador inválido.' })
        }
        if (body.newPassword.length < 12 || Buffer.byteLength(body.newPassword, 'utf8') > 72) {
          return res.status(400).json({ error: 'A senha temporária deve ter pelo menos 12 caracteres e no máximo 72 bytes.' })
        }
        const { error: pwError } = await admin.auth.admin.updateUserById(body.id, { password: body.newPassword })
        if (pwError) return res.status(409).json({ error: 'Não foi possível repor a senha. Atualize a página e tente novamente.' })
        const { error: flagError } = await admin.from('perfis').update({ exigir_troca_senha: true }).eq('id', body.id)
        if (flagError) {
          // A troca de senha já libertou exigir_troca_senha (gatilho em
          // supabase-migration-senha-temporaria.sql). Se não conseguirmos
          // voltar a marcá-la, a senha temporária escolhida pelo admin
          // ficaria permanente e utilizável sem aviso — falha fechada:
          // desativa a conta até haver reconciliação manual.
          const { error: lockError } = await admin.from('perfis').update({ ativo: false }).eq('id', body.id)
          const detalhe = lockError
            ? 'Avise já o responsável técnico: a conta pode estar acessível com a nova senha sem exigir troca.'
            : 'A conta foi desativada até à reconciliação manual.'
          return res.status(409).json({ error: `A senha foi alterada, mas não foi possível marcar a troca obrigatória. ${detalhe}` })
        }
        return res.status(200).json({ message: 'Senha temporária definida. Entregue-a ao utilizador por um canal privado — ele terá de a trocar no próximo acesso.' })
      }

      if (typeof body.nome !== 'string' || !body.nome.trim() || body.nome.trim().length > 120 ||
        !['gestor', 'admin'].includes(body.papel)) {
        return res.status(400).json({ error: 'Indique um nome e um perfil válidos.' })
      }
      if (req.method === 'PATCH') {
        if (typeof body.id !== 'string' || !uuidRegex.test(body.id) || typeof body.ativo !== 'boolean' || typeof body.podeEditarLeads !== 'boolean') {
          return res.status(400).json({ error: 'Utilizador ou estado inválido.' })
        }
        // A operação usa a sessão do autor para voltar a validar privilégios
        // dentro da transação e impedir a remoção do último administrador.
        const caller = client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
          global: { headers: { Authorization: `Bearer ${token}` } },
          auth: { persistSession: false, autoRefreshToken: false },
        })
        const { data, error } = await caller.rpc('alterar_perfil', {
          p_id: body.id, p_nome: body.nome.trim(), p_papel: body.papel, p_ativo: body.ativo, p_pode_editar: body.podeEditarLeads,
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
      const emailEnviado = await enviarEmailBoasVindas({
        env, fetchImpl, nome: body.nome.trim(), email, password: body.password, crmUrl: CRM_SITE_URL,
      })
      return res.status(201).json({
        message: emailEnviado
          ? 'Conta criada. Um email com a senha temporária foi enviado ao utilizador — ele terá de a trocar no primeiro acesso.'
          : 'Conta criada. Entregue a senha temporária ao utilizador por um canal privado. Ele terá de a trocar no primeiro acesso.',
      })
    } catch {
      return res.status(400).json({ error: 'Não foi possível concluir o pedido. Verifique os dados e tente novamente.' })
    }
  }
}

export default createHandler()
