import { useEffect, useRef } from 'react'
import { LEADS_CHANGED_EVENT } from './useLeadSheet'

// A RLS bloqueia imediatamente pedidos novos. A atualização periódica retira
// também da interface os leads que outro utilizador assumiu ou reatribuiu.
export function useDataRefresh(load: () => void) {
  const latest = useRef(load)
  latest.current = load
  useEffect(() => {
    const refresh = () => latest.current()
    const timer = window.setInterval(refresh, 15000)
    window.addEventListener('focus', refresh)
    window.addEventListener(LEADS_CHANGED_EVENT, refresh)
    return () => {
      clearInterval(timer)
      window.removeEventListener('focus', refresh)
      window.removeEventListener(LEADS_CHANGED_EVENT, refresh)
    }
  }, [])
}
