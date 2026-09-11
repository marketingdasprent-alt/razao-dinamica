import { createContext, useContext, useState, type ReactNode } from 'react'
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
