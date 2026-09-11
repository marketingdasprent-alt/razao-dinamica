import Responsavel from './Responsavel'
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors, type DragEndEvent, type DragStartEvent } from '@dnd-kit/core'
import { useDroppable } from '@dnd-kit/core'
import { useDraggable } from '@dnd-kit/core'
import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { pt } from 'date-fns/locale'
import { ESTADOS, type Estado, type Lead } from '@/lib/types'
import Avatar from './Avatar'

interface Props {
  leads: Lead[]
  onEstadoChange: (leadId: string, estado: Estado) => void
  onSelect: (lead: Lead) => void
}

const STALE_DIAS = 2

function isStale(lead: Lead) {
  if (lead.estado !== 'Novo') return false
  const dias = (Date.now() - new Date(lead.criado_em).getTime()) / (1000 * 60 * 60 * 24)
  return dias >= STALE_DIAS
}

export default function KanbanBoard({ leads, onEstadoChange, onSelect }: Props) {
  const [activeLead, setActiveLead] = useState<Lead | null>(null)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  function handleDragStart(event: DragStartEvent) {
    const lead = leads.find((l) => l.id === event.active.id)
    setActiveLead(lead ?? null)
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveLead(null)
    const { active, over } = event
    if (!over) return
    const novoEstado = over.id as Estado
    const lead = leads.find((l) => l.id === active.id)
    if (lead && lead.estado !== novoEstado) {
      onEstadoChange(lead.id, novoEstado)
    }
  }

  const staleCount = leads.filter(isStale).length

  return (
    <div>
      {staleCount > 0 && (
        <div className="flex items-center gap-2 mb-3 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 w-fit">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
          {staleCount} {staleCount === 1 ? 'lead novo sem contacto há' : 'leads novos sem contacto há'} {STALE_DIAS}+ dias
        </div>
      )}
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="grid grid-flow-col auto-cols-[252px] gap-3 overflow-x-auto pb-4">
          {ESTADOS.map((estado) => (
            <Column key={estado} estado={estado} leads={leads.filter((l) => l.estado === estado)} onSelect={onSelect} />
          ))}
        </div>
        <DragOverlay>{activeLead && <LeadCard lead={activeLead} dragging />}</DragOverlay>
      </DndContext>
    </div>
  )
}

function Column({ estado, leads, onSelect }: { estado: Estado; leads: Lead[]; onSelect: (l: Lead) => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: estado })
  return (
    <div ref={setNodeRef} className={`rounded-xl border bg-white/70 flex flex-col min-h-[60vh] transition-colors ${isOver ? 'border-gold bg-gold/5 ring-2 ring-gold/30' : 'border-navy/10'}`}>
      <div className="px-3.5 py-3 border-b border-navy/10 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur rounded-t-xl">
        <span className="text-xs font-semibold text-navy">{estado}</span>
        <span className="text-[10px] font-mono text-navy/40 bg-navy/5 rounded-full px-1.5 py-0.5">{leads.length}</span>
      </div>
      <div className="p-2.5 space-y-2 flex-1">
        {leads.map((lead) => (
          <DraggableCard key={lead.id} lead={lead} onSelect={onSelect} />
        ))}
        {leads.length === 0 && (
          <div className="text-center text-[11px] text-navy/25 py-6 select-none">Sem leads</div>
        )}
      </div>
    </div>
  )
}

function DraggableCard({ lead, onSelect }: { lead: Lead; onSelect: (l: Lead) => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: lead.id })
  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, opacity: isDragging ? 0.4 : 1 }
    : undefined
  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} onClick={() => onSelect(lead)}>
      <LeadCard lead={lead} />
    </div>
  )
}

function LeadCard({ lead, dragging }: { lead: Lead; dragging?: boolean }) {
  const stale = isStale(lead)
  return (
    <div
      className={`bg-white rounded-lg border p-3 cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 ${
        dragging ? 'shadow-xl rotate-1' : ''
      } ${stale ? 'border-red-200 bg-red-50/40' : 'border-navy/10 hover:border-gold'}`}
    >
      <div className="flex items-start gap-2.5">
        <Avatar nome={lead.nome} apelido={lead.apelido} size={28} />
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium text-navy truncate leading-tight">{lead.nome} {lead.apelido ?? ''}</div>
          {lead.empresa && <div className="text-xs text-navy/50 truncate mt-0.5">{lead.empresa}</div>}
        </div>
        {stale && <span className="w-2 h-2 rounded-full bg-red-500 mt-1 flex-shrink-0" title="Sem contacto há mais de 2 dias" />}
      </div>
      <div className="mt-2"><Responsavel lead={lead} /></div>
      <div className="flex items-center justify-between mt-2.5">
        {lead.servico ? (
          <span className="text-[10px] text-teal font-medium truncate bg-teal/10 rounded-full px-2 py-0.5">{lead.servico}</span>
        ) : <span />}
        <span className="text-[10px] text-navy/40 whitespace-nowrap ml-2">
          {formatDistanceToNow(new Date(lead.criado_em), { addSuffix: true, locale: pt })}
        </span>
      </div>
    </div>
  )
}
