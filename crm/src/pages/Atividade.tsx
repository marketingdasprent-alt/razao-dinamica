import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { EventoLead } from '@/lib/types'
import { format } from 'date-fns'

const ACAO_LABEL: Record<string, string> = {
  apagado: 'Apagou',
  atribuido: 'Atribuiu',
  reatribuido: 'Reatribuiu',
  devolvido: 'Devolveu à fila',
}

export default function Atividade() {
  const [eventos, setEventos] = useState<EventoLead[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('eventos_leads')
      .select('*')
      .order('criado_em', { ascending: false })
      .limit(200)
      .then(({ data }) => {
        setEventos((data as EventoLead[]) ?? [])
        setLoading(false)
      })
  }, [])

  return (
    <div>
      <div className="mb-5">
        <h1 className="font-display text-2xl font-bold text-navy">Atividade</h1>
        <p className="text-sm text-navy/60 mt-1">
          Registo de ações sensíveis no CRM, como leads apagados — para o admin acompanhar o que aconteceu.
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
            <div key={evento.id} className="flex items-center gap-3 px-4 py-3">
              <span className="flex-shrink-0 rounded-full bg-red-50 text-red-600 text-[11px] font-medium px-2.5 py-1">
                {ACAO_LABEL[evento.acao] ?? evento.acao}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-navy truncate">
                  {evento.lead_nome || 'Lead sem nome'}
                </div>
                <div className="text-xs text-navy/50 truncate">
                  {evento.lead_email && `${evento.lead_email} · `}
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
