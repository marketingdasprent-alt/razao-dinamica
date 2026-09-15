import { useState, type FormEvent } from 'react'
import { supabase } from '@/lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) throw signInError
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ocorreu um erro.'
      setError(
        message.includes('Invalid login credentials')
          ? 'Email ou palavra-passe incorretos.'
          : message.includes('User already registered')
            ? 'Já existe uma conta com este email. Inicie sessão.'
            : message,
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy px-4">
      <div className="w-full max-w-sm bg-sand rounded-xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="font-display font-extrabold text-xl text-navy">Razão Dinâmica</div>
          <div className="font-mono text-[10px] tracking-widest uppercase text-teal mt-1">CRM de leads</div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-navy/70 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-navy/15 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gold"
              autoComplete="email"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-navy/70 mb-1">Palavra-passe</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-navy/15 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gold"
              autoComplete="current-password"
            />
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-gold text-navy font-semibold text-sm py-2.5 hover:brightness-95 transition disabled:opacity-60"
          >
            {loading ? 'A processar…' : 'Entrar'}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-navy/60">O acesso é criado pelo administrador da sua equipa.</p>
      </div>
    </div>
  )
}
