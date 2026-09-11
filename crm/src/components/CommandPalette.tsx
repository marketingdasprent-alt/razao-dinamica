import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import type { Lead } from '@/lib/types'
import Avatar from '@/components/crm/Avatar'

export default function CommandPalette({ onOpenLead }: { onOpenLead: (lead: Lead) => void }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [leads, setLeads] = useState<Lead[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((o) => !o)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    if (!open) return
    supabase.from('leads').select('*').order('criado_em', { ascending: false }).limit(200).then(({ data }) => {
      setLeads((data as Lead[]) ?? [])
    })
  }, [open])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return leads.slice(0, 6)
    return leads
      .filter((l) => `${l.nome} ${l.apelido ?? ''} ${l.email} ${l.empresa ?? ''}`.toLowerCase().includes(q))
      .slice(0, 8)
  }, [leads, query])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh]">
      <div className="absolute inset-0 bg-navy/50 animate-fade-in" onClick={() => setOpen(false)} />
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden animate-scale-in">
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Pesquisar leads, ou ir para…"
          className="w-full px-4 py-3.5 text-sm outline-none border-b border-navy/10"
        />
        <div className="max-h-80 overflow-y-auto">
          {!query && (
            <div className="px-2 py-2">
              <div className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wide text-navy/40">Ir para</div>
              <PaletteItem label="Dashboard" onClick={() => { navigate('/'); setOpen(false) }} />
              <PaletteItem label="Leads" onClick={() => { navigate('/leads'); setOpen(false) }} />
            </div>
          )}
          {results.length > 0 && (
            <div className="px-2 py-2 border-t border-navy/5">
              <div className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wide text-navy/40">Leads</div>
              {results.map((lead) => (
                <button
                  key={lead.id}
                  onClick={() => { onOpenLead(lead); setOpen(false); setQuery('') }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-sand text-left"
                >
                  <Avatar nome={lead.nome} apelido={lead.apelido} size={26} />
                  <div className="min-w-0">
                    <div className="text-sm text-navy truncate">{lead.nome} {lead.apelido ?? ''}</div>
                    <div className="text-xs text-navy/45 truncate">{lead.email}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
          {query && results.length === 0 && (
            <p className="px-4 py-6 text-sm text-navy/40 text-center">Sem resultados para "{query}".</p>
          )}
        </div>
        <div className="border-t border-navy/10 px-4 py-2 text-[10px] text-navy/35 flex items-center gap-3">
          <span><kbd className="font-mono">↵</kbd> abrir</span>
          <span><kbd className="font-mono">esc</kbd> fechar</span>
        </div>
      </div>
    </div>
  )
}

function PaletteItem({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-sand text-sm text-navy">
      {label}
    </button>
  )
}
