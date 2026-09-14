import { useAuth } from '@/hooks/useAuth'
import type { Lead } from '@/lib/types'

export default function Responsavel({ lead }: { lead: Lead }) {
  const { session, profile } = useAuth()

  if (!lead.atribuido_a) {
    if (lead.estado === 'Novo') {
      return (
        <span
          title="Visível para todos os gestores — some da vista dos outros assim que alguém assumir."
          className="inline-flex items-center gap-1 rounded-full bg-gold/25 border border-gold/50 px-2 py-0.5 text-[10px] font-semibold text-[#6b5522]"
        >
          <InboxIcon /> Fila comum
        </span>
      )
    }
    return <span className="text-[11px] font-medium text-red-500">Atribuição pendente</span>
  }

  const nome = lead.atribuido_a === session?.user.id ? profile?.nome : lead.responsavel?.nome
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-teal/15 px-2.5 py-1 text-[11px] font-medium text-teal">
      <span className="text-teal/60 font-normal">Atribuído a:</span> {nome ?? 'equipa'}
    </span>
  )
}

function InboxIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M22 12h-6l-2 3h-4l-2-3H2" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11Z" />
    </svg>
  )
}
