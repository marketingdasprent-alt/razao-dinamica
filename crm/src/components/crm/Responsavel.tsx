import { useAuth } from '@/hooks/useAuth'
import type { Lead } from '@/lib/types'

export default function Responsavel({ lead }: { lead: Lead }) {
  const { session } = useAuth()
  const label = !lead.atribuido_a ? (lead.estado === 'Novo' ? 'Fila comum' : 'Atribuição pendente')
    : lead.atribuido_a === session?.user.id ? 'Atribuído a si' : lead.responsavel?.nome ?? 'Atribuído à equipa'
  return <span className="text-[11px] text-teal">{label}</span>
}
