import { useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { LEADS_CHANGED_EVENT } from './useLeadSheet'

// A RLS bloqueia imediatamente pedidos novos, mas a interface só o reflete
// quando volta a consultar. A subscrição Realtime avisa em ~1s sempre que
// um lead muda (sobretudo atribuição) — essencial para não deixar duas
// pessoas assumirem o mesmo lead sem se aperceberem uma da outra. O
// polling longo fica só como rede de segurança caso a ligação caia.
export function useDataRefresh(load: () => void, table: string = 'leads') {
  const latest = useRef(load)
  latest.current = load
  useEffect(() => {
    const refresh = () => latest.current()
    const timer = window.setInterval(refresh, 60000)
    window.addEventListener('focus', refresh)
    window.addEventListener(LEADS_CHANGED_EVENT, refresh)
    const channel = supabase
      .channel(table + '-changes-' + Math.random().toString(36).slice(2))
      .on('postgres_changes', { event: '*', schema: 'public', table }, refresh)
      .subscribe()
    return () => {
      clearInterval(timer)
      window.removeEventListener('focus', refresh)
      window.removeEventListener(LEADS_CHANGED_EVENT, refresh)
      supabase.removeChannel(channel)
    }
  }, [table])
}
