import { useState } from 'react'

interface Props {
  nome: string
  onConfirm: (novaSenha: string) => Promise<void>
  onClose: () => void
}

export default function RedefinirSenhaModal({ nome, onConfirm, onClose }: Props) {
  const [senha, setSenha] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function submit() {
    if (senha.length < 12 || busy) return
    setBusy(true)
    setError('')
    try {
      await onConfirm(senha)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível repor a senha.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-navy/40 animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white rounded-xl shadow-2xl p-5 animate-scale-in">
        <h2 className="font-display font-bold text-navy text-base">Repor senha de {nome}</h2>
        <p className="text-sm text-navy/60 mt-1.5">
          Defina uma senha temporária nova. Não precisa da senha atual — a conta fica marcada para trocar
          no próximo acesso, igual acontece na criação de uma conta.
        </p>

        <div className="mt-4">
          <label className="block text-xs font-medium text-navy/60 mb-1">Nova senha temporária</label>
          <input
            type="password"
            autoFocus
            autoComplete="new-password"
            minLength={12}
            maxLength={72}
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') submit() }}
            placeholder="Pelo menos 12 caracteres"
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
            onClick={submit}
            disabled={busy || senha.length < 12}
            className="flex-1 rounded-lg bg-navy text-sand text-sm font-medium py-2.5 hover:brightness-110 transition disabled:opacity-50"
          >
            {busy ? 'A repor…' : 'Repor senha'}
          </button>
        </div>
      </div>
    </div>
  )
}
