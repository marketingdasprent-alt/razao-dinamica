import { useEffect, useState, type FormEvent } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import type { Perfil } from '@/lib/types'

const field = 'w-full rounded-lg border border-navy/15 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-gold outline-none'

export default function Utilizadores() {
  const { session, refreshProfile } = useAuth()
  const [users, setUsers] = useState<Perfil[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [edit, setEdit] = useState<Perfil | null>(null)
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [papel, setPapel] = useState<'admin' | 'gestor'>('gestor')
  const [password, setPassword] = useState('')
  const [ativo, setAtivo] = useState(true)

  async function load() {
    setLoading(true)
    const { data, error } = await supabase.from('perfis').select('*').order('nome')
    if (error) setError('Não foi possível carregar os utilizadores.')
    else setUsers(data as Perfil[])
    setLoading(false)
  }
  useEffect(() => { void load() }, [])

  function select(user: Perfil | null) {
    setEdit(user); setNome(user?.nome ?? ''); setEmail(user?.email ?? '')
    setPapel(user?.papel ?? 'gestor'); setAtivo(user?.ativo ?? true)
    setError(''); setMessage(''); setPassword('')
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (busy) return
    setBusy(true); setError(''); setMessage('')
    try {
      const { data: current } = await supabase.auth.getSession()
      if (!current.session) throw new Error('Inicie sessão novamente.')
      const response = await fetch('/api/utilizadores', {
        method: edit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${current.session.access_token}` },
        body: JSON.stringify({ id: edit?.id, nome, email, papel, ativo, password: edit ? undefined : password }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Não foi possível guardar.')
      const ownProfile = edit?.id === session?.user.id
      select(null)
      setMessage(edit ? 'Utilizador atualizado.' : result.message)
      await load()
      if (ownProfile) await refreshProfile()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível contactar o servidor.')
    } finally { setBusy(false) }
  }

  return <div className="space-y-5">
    <div><h1 className="font-display text-2xl font-bold text-navy">Utilizadores</h1>
      <p className="mt-1 text-sm text-navy/60">Crie as contas da equipa e controle o acesso ao CRM.</p></div>
    {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {message && <p role="status" className="rounded-lg bg-teal/10 p-3 text-sm text-teal">{message}</p>}
    <div className="grid lg:grid-cols-[1fr_320px] gap-5 items-start">
      <section className="bg-white rounded-xl border border-navy/10 overflow-hidden" aria-label="Equipa">
        {loading ? <p className="p-5 text-sm">A carregar…</p> : users.map(user =>
          <div key={user.id} className="p-4 border-b border-navy/5 flex items-center gap-3">
            <div className="min-w-0 flex-1"><p className="font-medium text-navy break-words">{user.nome}</p>
              <p className="text-xs text-navy/50 break-all">{user.email}</p>
              <p className="mt-1 text-xs text-teal">{user.papel === 'admin' ? 'Administrador' : 'Gestor'} · {user.ativo ? 'Ativo' : 'Desativado'}</p></div>
            <button disabled={busy} onClick={() => select(user)} className="text-sm text-teal underline">Editar</button>
          </div>)}
      </section>
      <form onSubmit={submit} className="bg-white rounded-xl border border-navy/10 p-5 space-y-4">
        <h2 className="font-display font-semibold text-navy">{edit ? 'Editar utilizador' : 'Criar utilizador'}</h2>
        <label className="block text-xs text-navy/70">Nome<input required maxLength={120} value={nome} onChange={e => setNome(e.target.value)} className={`${field} mt-1`} /></label>
        <label className="block text-xs text-navy/70">Email<input required type="email" disabled={!!edit} value={email} onChange={e => setEmail(e.target.value)} className={`${field} mt-1 disabled:bg-sand`} /></label>
        <label className="block text-xs text-navy/70">Perfil<select value={papel} onChange={e => setPapel(e.target.value as 'admin' | 'gestor')} className={`${field} mt-1`}>
          <option value="gestor">Gestor</option><option value="admin">Administrador</option></select></label>
        {!edit && <label className="block text-xs text-navy/70">Senha temporária<input type="password" autoComplete="new-password" required minLength={12} maxLength={72} value={password} onChange={e => setPassword(e.target.value)} className={`${field} mt-1`} /><span className="block mt-1">Pelo menos 12 caracteres.</span></label>}
        {edit && <label className="flex gap-2 text-sm"><input type="checkbox" checked={ativo} onChange={e => setAtivo(e.target.checked)} />Acesso ativo</label>}
        <p className="text-xs text-navy/50">{edit ? 'Desativar bloqueia o acesso. Os leads continuam atribuídos até o administrador os redistribuir.' : 'Entregue a senha temporária por um canal privado. A troca será obrigatória no primeiro acesso. Não será enviado email.'}</p>
        <button disabled={busy} className="w-full rounded-lg bg-navy text-sand py-2.5 text-sm disabled:opacity-50">{busy ? 'A guardar…' : edit ? 'Guardar alterações' : 'Criar conta'}</button>
        {edit && <button type="button" disabled={busy} onClick={() => select(null)} className="w-full text-sm text-navy/60">Cancelar</button>}
      </form>
    </div>
  </div>
}
