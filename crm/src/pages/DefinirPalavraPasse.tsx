import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

export default function DefinirPalavraPasse() {
  const { session, loading, refreshProfile, profile } = useAuth()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  async function submit(event: FormEvent) {
    event.preventDefault()
    if (busy) return
    if (password !== confirm) { setError('As palavras-passe não coincidem.'); return }
    setBusy(true); setError('')
    const { error } = await supabase.auth.updateUser({ password })
    setBusy(false)
    if (error) { setError('Não foi possível definir a palavra-passe. Use uma senha diferente da temporária e verifique os requisitos.'); return }
    await refreshProfile()
    setPassword(''); setConfirm('')
    navigate('/', { replace: true })
  }
  return <div className="min-h-screen bg-navy flex items-center justify-center p-4">
    <div className="bg-sand rounded-xl p-8 w-full max-w-sm space-y-4">
      <h1 className="font-display text-xl font-bold text-navy">Definir palavra-passe</h1>
      {loading ? <p>A verificar a sessão…</p> : !session ? <p className="text-sm">Inicie sessão com o email e a senha temporária fornecidos pelo administrador. <a href="/" className="underline">Voltar ao login</a></p> :
        <form onSubmit={submit} className="space-y-4">
          {profile?.exigir_troca_senha && <p className="text-sm">Para entrar no CRM, substitua a senha temporária por uma senha só sua.</p>}
          <label className="block text-sm">Nova palavra-passe<input type="password" autoComplete="new-password" required minLength={12} value={password} onChange={e => setPassword(e.target.value)} className="mt-1 w-full border rounded-lg p-2" /></label>
          <p className="text-xs text-navy/60">Use pelo menos 12 caracteres.</p>
          <label className="block text-sm">Confirmar palavra-passe<input type="password" autoComplete="new-password" required minLength={12} value={confirm} onChange={e => setConfirm(e.target.value)} className="mt-1 w-full border rounded-lg p-2" /></label>
          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
          <button disabled={busy} className="w-full bg-gold rounded-lg p-2 font-medium">{busy ? 'A guardar…' : 'Guardar e entrar'}</button>
        </form>}
    </div>
  </div>
}
