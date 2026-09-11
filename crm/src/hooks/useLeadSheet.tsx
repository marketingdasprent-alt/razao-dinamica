import { createContext, useContext, useState, type ReactNode } from 'react'
import type { Lead } from '@/lib/types'

interface LeadSheetApi {
  selected: Lead | null
  openLead: (lead: Lead) => void
  closeLead: () => void
}

const LeadSheetContext = createContext<LeadSheetApi>({
  selected: null,
  openLead: () => {},
  closeLead: () => {},
})

export function LeadSheetProvider({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState<Lead | null>(null)
  return (
    <LeadSheetContext.Provider value={{ selected, openLead: setSelected, closeLead: () => setSelected(null) }}>
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
