import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import type { Lead } from '@/lib/types'

export type LeadSheetTab = 'detalhes' | 'whatsapp'

interface LeadSheetApi {
  selected: Lead | null
  initialTab: LeadSheetTab
  openLead: (lead: Lead, tab?: LeadSheetTab) => void
  closeLead: () => void
}

const LeadSheetContext = createContext<LeadSheetApi>({
  selected: null,
  initialTab: 'detalhes',
  openLead: () => {},
  closeLead: () => {},
})

export function LeadSheetProvider({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState<Lead | null>(null)
  const [initialTab, setInitialTab] = useState<LeadSheetTab>('detalhes')

  useEffect(() => {
    if (!selected) return
    let disposed = false
    const id = selected.id
    async function refresh() {
      const { data, error } = await supabase.from('leads').select('*, responsavel:perfis!leads_atribuido_a_fkey(nome)').eq('id', id).maybeSingle()
      if (disposed) return
      if (error || !data) { setSelected(null); return }
      setSelected(previous => previous?.id === id && previous.atualizado_em !== data.atualizado_em ? data as Lead : previous)
    }
    const timer = window.setInterval(refresh, 15000)
    window.addEventListener('focus', refresh)
    window.addEventListener(LEADS_CHANGED_EVENT, refresh)
    return () => { disposed = true; clearInterval(timer); window.removeEventListener('focus', refresh); window.removeEventListener(LEADS_CHANGED_EVENT, refresh) }
  }, [selected?.id])

  function openLead(lead: Lead, tab: LeadSheetTab = 'detalhes') {
    setInitialTab(tab)
    setSelected(lead)
  }

  return (
    <LeadSheetContext.Provider value={{ selected, initialTab, openLead, closeLead: () => setSelected(null) }}>
      {children}
    </LeadSheetContext.Provider>
  )
}

export function useLeadSheet() {
  return useContext(LeadSheetContext)
}

export const LEADS_CHANGED_EVENT = 'leads:changed'

export function notifyLeadsChanged() {
  window.dispatchEvent(new CustomEvent(LEADS_CHANGED_EVENT))
}
