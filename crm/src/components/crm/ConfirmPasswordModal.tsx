import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

interface Props {
  title: string
  description: string
  confirmLabel?: string
  onConfirm: () => Promise<void>
  onClose: () => void
}

export default function ConfirmPasswordModal({ title, description, confirmLabel = 'Confirmar', onConfirm, onClose }: Props) {
  const { session } = useAuth()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleConfirm() {
    if (!password) return
    setLoading(true)
    setError('')
    const email = session?.user.email
    const { error: authError } = await supabase.auth.signInWithPassword({ email: email ?? '', password })
    if (authError) {
      setLoading(false)
      setError('Palavra-passe incorreta.')
      return
    }
    await onConfirm()
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-navy/40 animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white rounded-xl shadow-2xl p-5 animate-scale-in">
        <h2 className="font-display font-bold text-navy text-base">{title}</h2>
        <p className="text-sm text-navy/60 mt-1.5">{description}</p>

        <div className="mt-4">
          <label className="block text-xs font-medium text-navy/60 mb-1">Palavra-passe</label>
          <input
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleConfirm() }}
            placeholder="Confirme a sua palavra-passe"
            className="w-full rounded-lg border border-navy/15 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gold"
          />
          {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
        </div>

        <div className="flex gap-2 mt-5">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-navy/15 text-navy text-sm font-medium py-2.5 hover:bg-sand/60 transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading || !password}
            className="flex-1 rounded-lg bg-red-600 text-white text-sm font-medium py-2.5 hover:brightness-105 transition disabled:opacity-50"
          >
            {loading ? 'A verificar…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
