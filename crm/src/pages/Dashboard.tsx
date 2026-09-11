import { useDataRefresh } from '@/hooks/useDataRefresh'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { ESTADOS, type Estado, type Lead } from '@/lib/types'
import { useLeadSheet, notifyLeadsChanged } from '@/hooks/useLeadSheet'
import { useToast } from '@/hooks/useToast'
import EstadoBadge from '@/components/crm/EstadoBadge'
import Avatar from '@/components/crm/Avatar'
import ConfirmPasswordModal from '@/components/crm/ConfirmPasswordModal'
import { formatDistanceToNow } from 'date-fns'
import { pt } from 'date-fns/locale'

export default function Dashboard() {
  const { isAdmin } = useAuth()
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [selecionados, setSelecionados] = useState<string[]>([])
  const [confirmando, setConfirmando] = useState(false)
  const { openLead } = useLeadSheet()
  const toast = useToast()

  function load() {
    supabase
      .from('leads')
      .select('*, responsavel:perfis!leads_atribuido_a_fkey(nome)')
      .order('criado_em', { ascending: false })
      .then(({ data }) => {
        const novos = (data as Lead[]) ?? []
        setLeads(novos)
        setSelecionados((prev) => prev.filter((id) => novos.some((l) => l.id === id)))
        setLoading(false)
      })
  }

  useEffect(() => { load() }, [])
  useDataRefresh(load)

  if (loading) return <SkeletonDashboard />

  const counts = ESTADOS.reduce((acc, estado) => {
    acc[estado] = leads.filter((l) => l.estado === estado).length
    return acc
  }, {} as Record<Estado, number>)

  const now = Date.now()
  const semanaMs = 7 * 24 * 60 * 60 * 1000
  const novosSemana = leads.filter((l) => now - new Date(l.criado_em).getTime() <= semanaMs).length

  const fechados = counts['Ganho'] + counts['Perdido']
  const taxaConversao = fechados > 0 ? Math.round((counts['Ganho'] / fechados) * 100) : null

  const recentes = leads.slice(0, 6)
  const todosRecentesSelecionados = recentes.length > 0 && recentes.every((l) => selecionados.includes(l.id))

  function toggleSelecionado(id: string) {
    setSelecionados((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  function toggleTodosRecentes() {
    if (todosRecentesSelecionados) {
      setSelecionados((prev) => prev.filter((id) => !recentes.some((l) => l.id === id)))
    } else {
      setSelecionados((prev) => Array.from(new Set([...prev, ...recentes.map((l) => l.id)])))
    }
  }

  async function handleDeleteSelecionados() {
    if (!isAdmin) return
    const { data, error } = await supabase.from('leads').delete().in('id', selecionados).select('id')
    if (error || !data?.length) { toast.show('Não foi possível apagar os leads selecionados.', 'error'); load(); return }
    toast.show(`${data.length} lead(s) apagado(s).`)
    setSelecionados([])
    setConfirmando(false)
    notifyLeadsChanged()
    load()
  }

  const dias = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    d.setHours(0, 0, 0, 0)
    return d
  })
  const porDia = dias.map((dia) => {
    const proximo = new Date(dia)
    proximo.setDate(proximo.getDate() + 1)
    return leads.filter((l) => {
      const t = new Date(l.criado_em).getTime()
      return t >= dia.getTime() && t < proximo.getTime()
    }).length
  })
  const maxDia = Math.max(1, ...porDia)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-navy">Dashboard</h1>
        <p className="text-sm text-navy/60 mt-1">Visão geral dos leads da Razão Dinâmica.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total de leads" value={leads.length} />
        <StatCard label="Novos esta semana" value={novosSemana} accent />
        <StatCard label="Em aberto" value={leads.length - fechados} />
        <StatCard
          label="Taxa de conversão"
          value={taxaConversao === null ? '—' : `${taxaConversao}%`}
          hint={fechados > 0 ? `${counts['Ganho']} ganhos de ${fechados} fechados` : 'ainda sem leads fechados'}
        />
      </div>

      <div className="grid md:grid-cols-[1.3fr_1fr] gap-4">
        <div className="bg-white rounded-xl border border-navy/10 p-5">
          <h2 className="font-display font-semibold text-navy text-sm mb-4">Novos leads (últimos 7 dias)</h2>
          <div className="flex items-end justify-between gap-2 h-32">
            {porDia.map((count, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                <div className="w-full flex items-end justify-center" style={{ height: 96 }}>
                  <div
                    className="w-full max-w-[28px] rounded-t-md bg-gold transition-all"
                    style={{ height: `${Math.max(4, (count / maxDia) * 96)}px` }}
                    title={`${count} leads`}
                  />
                </div>
                <span className="text-[10px] text-navy/40 font-mono">{dias[i].toLocaleDateString('pt-PT', { weekday: 'short' }).slice(0, 3)}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-display font-semibold text-navy mb-3 text-sm">Leads por estado</h2>
          <div className="grid grid-cols-3 gap-2">
            {ESTADOS.map((estado) => (
              <div key={estado} className="bg-white rounded-lg border border-navy/10 p-2.5 text-center">
                <div className="text-lg font-display font-bold text-navy">{counts[estado]}</div>
                <div className="mt-1 scale-90 origin-center"><EstadoBadge estado={estado} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <h2 className="font-display font-semibold text-navy">Leads recentes</h2>
            {isAdmin && recentes.length > 0 && (
              <label className="flex items-center gap-1.5 text-xs text-navy/50 hover:text-navy/70 cursor-pointer">
                <input
                  type="checkbox"
                  checked={todosRecentesSelecionados}
                  onChange={toggleTodosRecentes}
                  className="w-3.5 h-3.5 rounded border-navy/30 text-gold focus:ring-gold"
                />
                Selecionar todos
              </label>
            )}
          </div>
          <div className="flex items-center gap-4">
            {isAdmin && selecionados.length > 0 && (
              <button onClick={() => setConfirmando(true)} className="text-xs text-red-600 font-medium hover:underline">
                Apagar selecionados ({selecionados.length})
              </button>
            )}
            <Link to="/leads" className="text-xs text-teal hover:underline">Ver todos →</Link>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-navy/10 divide-y divide-navy/5">
          {recentes.length === 0 && (
            <p className="p-4 text-sm text-navy/50">Ainda não há leads.</p>
          )}
          {recentes.map((lead) => (
            <div key={lead.id} className="flex items-center gap-3 px-4 py-3 hover:bg-sand/60 transition-colors">
              {isAdmin && <input
                type="checkbox"
                checked={selecionados.includes(lead.id)}
                onChange={() => toggleSelecionado(lead.id)}
                className="w-4 h-4 rounded border-navy/30 text-gold focus:ring-gold flex-shrink-0"
              />}
              <button onClick={() => openLead(lead)} className="flex-1 flex items-center gap-3 min-w-0 text-left">
                <Avatar nome={lead.nome} apelido={lead.apelido} size={32} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-navy truncate">{lead.nome} {lead.apelido ?? ''}</div>
                  <div className="text-xs text-navy/50 truncate">
                    {lead.empresa ? `${lead.empresa} · ` : ''}
                    {formatDistanceToNow(new Date(lead.criado_em), { addSuffix: true, locale: pt })}
                  </div>
                </div>
              </button>
              <EstadoBadge estado={lead.estado} />
            </div>
          ))}
        </div>
      </div>

      {confirmando && (
        <ConfirmPasswordModal
          title="Apagar leads selecionados"
          description={`Esta ação vai apagar ${selecionados.length} lead(s) permanentemente. Introduza a sua palavra-passe para confirmar.`}
          confirmLabel="Apagar"
          onConfirm={handleDeleteSelecionados}
          onClose={() => setConfirmando(false)}
        />
      )}
    </div>
  )
}

function StatCard({ label, value, hint, accent }: { label: string; value: number | string; hint?: string; accent?: boolean }) {
  return (
    <div className={`rounded-xl p-4 border flex flex-col items-center text-center ${accent ? 'bg-navy text-sand border-navy' : 'bg-white text-navy border-navy/10'}`}>
      <div className={`text-[11px] font-mono uppercase tracking-wide ${accent ? 'text-gold' : 'text-navy/50'}`}>{label}</div>
      <div className="text-3xl font-display font-bold mt-1">{value}</div>
      {hint && <div className={`text-[11px] mt-1 ${accent ? 'text-sand/60' : 'text-navy/40'}`}>{hint}</div>}
    </div>
  )
}

function SkeletonDashboard() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-8 w-40 bg-navy/10 rounded" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 bg-white/80 border border-navy/10 rounded-xl" />)}
      </div>
      <div className="h-48 bg-white/80 border border-navy/10 rounded-xl" />
    </div>
  )
}
