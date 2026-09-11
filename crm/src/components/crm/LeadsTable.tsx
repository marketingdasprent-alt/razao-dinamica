import { useMemo, useState } from 'react'
import { format } from 'date-fns'
import { ESTADOS, SERVICOS, type Lead } from '@/lib/types'
import EstadoBadge from './EstadoBadge'
import Avatar from './Avatar'

interface Props {
  leads: Lead[]
  onSelect: (lead: Lead) => void
}

type SortDir = 'asc' | 'desc'

export default function LeadsTable({ leads, onSelect }: Props) {
  const [query, setQuery] = useState('')
  const [estadoFiltro, setEstadoFiltro] = useState('')
  const [servicoFiltro, setServicoFiltro] = useState('')
  const [origemFiltro, setOrigemFiltro] = useState('')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const filtrados = useMemo(() => {
    const q = query.trim().toLowerCase()
    let result = leads.filter((lead) => {
      if (estadoFiltro && lead.estado !== estadoFiltro) return false
      if (servicoFiltro && lead.servico !== servicoFiltro) return false
      if (origemFiltro && lead.origem !== origemFiltro) return false
      if (q) {
        const haystack = `${lead.nome} ${lead.apelido ?? ''} ${lead.email} ${lead.empresa ?? ''}`.toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })
    result = result.sort((a, b) => {
      const diff = new Date(a.criado_em).getTime() - new Date(b.criado_em).getTime()
      return sortDir === 'asc' ? diff : -diff
    })
    return result
  }, [leads, query, estadoFiltro, servicoFiltro, origemFiltro, sortDir])

  const origens = useMemo(() => Array.from(new Set(leads.map((l) => l.origem))), [leads])
  const hasFilters = query || estadoFiltro || servicoFiltro || origemFiltro

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative flex-1 min-w-[220px]">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-navy/30" />
          <input
            type="text"
            placeholder="Pesquisar por nome, email ou empresa…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg border border-navy/15 bg-white pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gold"
          />
        </div>
        <select value={estadoFiltro} onChange={(e) => setEstadoFiltro(e.target.value)} className="rounded-lg border border-navy/15 bg-white px-2.5 py-2 text-sm">
          <option value="">Todos os estados</option>
          {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
        </select>
        <select value={servicoFiltro} onChange={(e) => setServicoFiltro(e.target.value)} className="rounded-lg border border-navy/15 bg-white px-2.5 py-2 text-sm">
          <option value="">Todos os serviços</option>
          {SERVICOS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={origemFiltro} onChange={(e) => setOrigemFiltro(e.target.value)} className="rounded-lg border border-navy/15 bg-white px-2.5 py-2 text-sm">
          <option value="">Todas as origens</option>
          {origens.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        {hasFilters && (
          <button
            onClick={() => { setQuery(''); setEstadoFiltro(''); setServicoFiltro(''); setOrigemFiltro('') }}
            className="text-xs text-navy/50 hover:text-navy underline underline-offset-2"
          >
            Limpar filtros
          </button>
        )}
        <span className="text-xs text-navy/40 ml-auto">{filtrados.length} de {leads.length}</span>
      </div>

      <div className="bg-white rounded-xl border border-navy/10 overflow-hidden overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wide text-navy/50 border-b border-navy/10">
              <th className="px-4 py-2.5 font-medium">Lead</th>
              <th className="px-4 py-2.5 font-medium">Empresa</th>
              <th className="px-4 py-2.5 font-medium">Contacto</th>
              <th className="px-4 py-2.5 font-medium">Serviço</th>
              <th className="px-4 py-2.5 font-medium">Origem</th>
              <th className="px-4 py-2.5 font-medium">Estado</th>
              <th
                className="px-4 py-2.5 font-medium cursor-pointer select-none hover:text-navy"
                onClick={() => setSortDir(sortDir === 'asc' ? 'desc' : 'asc')}
              >
                Criado em {sortDir === 'asc' ? '↑' : '↓'}
              </th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map((lead) => (
              <tr key={lead.id} onClick={() => onSelect(lead)} className="group border-b border-navy/5 last:border-0 hover:bg-sand/60 cursor-pointer">
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <Avatar nome={lead.nome} apelido={lead.apelido} size={28} />
                    <span className="font-medium text-navy">{lead.nome} {lead.apelido ?? ''}</span>
                  </div>
                </td>
                <td className="px-4 py-2.5 text-navy/70">{lead.empresa ?? '—'}</td>
                <td className="px-4 py-2.5 text-navy/70">
                  <div>{lead.email}</div>
                  {lead.telefone && <div className="text-xs text-navy/40">{lead.ddi} {lead.telefone}</div>}
                </td>
                <td className="px-4 py-2.5 text-navy/70">{lead.servico ?? '—'}</td>
                <td className="px-4 py-2.5 text-navy/50 capitalize">{lead.origem}</td>
                <td className="px-4 py-2.5"><EstadoBadge estado={lead.estado} /></td>
                <td className="px-4 py-2.5 text-navy/50 whitespace-nowrap">{format(new Date(lead.criado_em), 'dd/MM/yyyy HH:mm')}</td>
              </tr>
            ))}
            {filtrados.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-navy/40">Nenhum lead encontrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className={className}>
      <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
    </svg>
  )
}
