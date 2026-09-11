import type { Estado } from '@/lib/types'

const STYLES: Record<Estado, string> = {
  'Novo': 'bg-teal/15 text-teal',
  'Contactado': 'bg-gold/20 text-[#8a6f2e]',
  'Qualificado': 'bg-gold/30 text-[#6b5522]',
  'Proposta enviada': 'bg-navy/10 text-navy',
  'Ganho': 'bg-emerald-100 text-emerald-700',
  'Perdido': 'bg-red-100 text-red-600',
}

export default function EstadoBadge({ estado }: { estado: Estado }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${STYLES[estado]}`}>
      {estado}
    </span>
  )
}
