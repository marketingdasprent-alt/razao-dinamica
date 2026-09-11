import { useDataRefresh } from '@/hooks/useDataRefresh'
import { useEffect, useState } from 'react'
import { mudarEstado } from '@/lib/leadActions'
import { supabase } from '@/lib/supabase'
import type { Estado, Lead } from '@/lib/types'
import { useLeadSheet, notifyLeadsChanged } from '@/hooks/useLeadSheet'
import { useToast } from '@/hooks/useToast'
import KanbanBoard from '@/components/crm/KanbanBoard'
import LeadsTable from '@/components/crm/LeadsTable'

type View = 'kanban' | 'lista'

export default function Leads() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<View>('kanban')
  const { openLead } = useLeadSheet()
  const toast = useToast()

  async function load() {
    const { data } = await supabase.from('leads').select('*, responsavel:perfis!leads_atribuido_a_fkey(nome)').order('criado_em', { ascending: false })
    setLeads((data as Lead[]) ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])
  useDataRefresh(load)

  async function handleEstadoChange(leadId: string, estado: Estado) {
    const lead = leads.find(item => item.id === leadId)
    if (!lead) return
    try {
      await mudarEstado(lead, estado)
      toast.show('Estado atualizado.')
    } catch (error) {
      toast.show(error instanceof Error ? error.message : 'Não foi possível mover o lead.', 'error')
    }
    notifyLeadsChanged()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="font-display text-2xl font-bold text-navy">Leads</h1>
        <div className="inline-flex rounded-lg border border-navy/15 bg-white p-0.5">
          <button
            onClick={() => setView('kanban')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${view === 'kanban' ? 'bg-navy text-sand' : 'text-navy/60 hover:text-navy'}`}
          >
            Kanban
          </button>
          <button
            onClick={() => setView('lista')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${view === 'lista' ? 'bg-navy text-sand' : 'text-navy/60 hover:text-navy'}`}
          >
            Lista
          </button>
        </div>
      </div>

      {loading ? (
        <SkeletonBoard />
      ) : view === 'kanban' ? (
        <KanbanBoard leads={leads} onEstadoChange={handleEstadoChange} onSelect={openLead} />
      ) : (
        <LeadsTable leads={leads} onSelect={openLead} />
      )}
    </div>
  )
}

function SkeletonBoard() {
  return (
    <div className="grid grid-flow-col auto-cols-[252px] gap-3 overflow-x-hidden animate-pulse">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-navy/10 bg-white/60 h-[60vh] p-3 space-y-2">
          <div className="h-4 w-20 bg-navy/10 rounded" />
          <div className="h-16 bg-navy/5 rounded-lg" />
          <div className="h-16 bg-navy/5 rounded-lg" />
        </div>
      ))}
    </div>
  )
}
