import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { EventoLead, EventoPerfil } from '@/lib/types'
import { format } from 'date-fns'

const ACAO_LABEL: Record<string, string> = {
  apagado: 'Apagou',
  atribuido: 'Atribuiu',
  reatribuido: 'Reatribuiu',
  devolvido: 'Devolveu à fila',
}

const ACAO_LABEL_PERFIL: Record<string, string> = {
  criado: 'Criou conta',
  editado: 'Editou conta',
  excluido: 'Excluiu conta',
  senha_reposta: 'Repôs senha',
}

type Evento =
  | { tipo: 'lead'; id: string; acao: string; nome: string | null; email: string | null; realizado_por_email: string | null; criado_em: string }
  | { tipo: 'perfil'; id: string; acao: string; nome: string | null; email: string | null; realizado_por_email: string | null; criado_em: string }

export default function Atividade() {
  const [eventos, setEventos] = useState<Evento[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      supabase.from('eventos_leads').select('*').order('criado_em', { ascending: false }).limit(200),
      supabase.from('eventos_perfis').select('*').order('criado_em', { ascending: false }).limit(200),
    ]).then(([leads, perfis]) => {
      const deLeads: Evento[] = ((leads.data as EventoLead[]) ?? []).map(e => ({
        tipo: 'lead', id: e.id, acao: e.acao, nome: e.lead_nome, email: e.lead_email,
        realizado_por_email: e.realizado_por_email, criado_em: e.criado_em,
      }))
      const dePerfis: Evento[] = ((perfis.data as EventoPerfil[]) ?? []).map(e => ({
        tipo: 'perfil', id: e.id, acao: e.acao, nome: e.alvo_nome, email: e.alvo_email,
        realizado_por_email: e.realizado_por_email, criado_em: e.criado_em,
      }))
      setEventos([...deLeads, ...dePerfis].sort((a, b) => b.criado_em.localeCompare(a.criado_em)).slice(0, 200))
      setLoading(false)
    })
  }, [])

  return (
    <div>
      <div className="mb-5">
        <h1 className="font-display text-2xl font-bold text-navy">Atividade</h1>
        <p className="text-sm text-navy/60 mt-1">
          Registo de ações sensíveis no CRM: leads apagados/reatribuídos e contas de utilizador criadas, editadas ou excluídas.
        </p>
      </div>

      {loading ? (
        <SkeletonAtividade />
      ) : eventos.length === 0 ? (
        <div className="bg-white rounded-xl border border-navy/10 p-10 text-center text-sm text-navy/50">
          Ainda não há eventos registados.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-navy/10 divide-y divide-navy/5">
          {eventos.map((evento) => (
            <div key={`${evento.tipo}-${evento.id}`} className="flex items-center gap-3 px-4 py-3">
              <span className={`flex-shrink-0 rounded-full text-[11px] font-medium px-2.5 py-1 ${evento.tipo === 'perfil' ? 'bg-teal/10 text-teal' : 'bg-red-50 text-red-600'}`}>
                {evento.tipo === 'perfil' ? ACAO_LABEL_PERFIL[evento.acao] ?? evento.acao : ACAO_LABEL[evento.acao] ?? evento.acao}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-navy truncate">
                  {evento.nome || (evento.tipo === 'perfil' ? 'Utilizador sem nome' : 'Lead sem nome')}
                </div>
                <div className="text-xs text-navy/50 truncate">
                  {evento.email && `${evento.email} · `}
                  por {evento.realizado_por_email ?? 'conta desconhecida'}
                </div>
              </div>
              <span className="flex-shrink-0 text-[11px] text-navy/40 font-mono">
                {format(new Date(evento.criado_em), 'dd/MM/yyyy HH:mm')}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function SkeletonAtividade() {
  return (
    <div className="bg-white rounded-xl border border-navy/10 divide-y divide-navy/5 animate-pulse">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3">
          <div className="w-14 h-6 rounded-full bg-navy/10 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-32 bg-navy/10 rounded" />
            <div className="h-2.5 w-48 bg-navy/5 rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}
