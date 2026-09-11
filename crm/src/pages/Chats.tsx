import { useDataRefresh } from '@/hooks/useDataRefresh'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Lead, MensagemWhatsApp } from '@/lib/types'
import { useLeadSheet } from '@/hooks/useLeadSheet'
import Avatar from '@/components/crm/Avatar'
import { formatDistanceToNow } from 'date-fns'
import { pt } from 'date-fns/locale'

interface Conversa {
  lead: Lead
  ultimaMensagem: MensagemWhatsApp
  total: number
}

export default function Chats() {
  const [conversas, setConversas] = useState<Conversa[]>([])
  const [revision, setRevision] = useState(0)
  useDataRefresh(() => setRevision(value => value + 1))
  const [loading, setLoading] = useState(true)
  const { openLead } = useLeadSheet()

  useEffect(() => {
    let ativo = true
    supabase
      .from('whatsapp_mensagens')
      .select('*, lead:leads(*)')
      .order('criado_em', { ascending: false })
      .then(({ data }) => {
        if (!ativo) return
        const linhas = (data as (MensagemWhatsApp & { lead: Lead | null })[]) ?? []
        const porLead = new Map<string, Conversa>()
        for (const linha of linhas) {
          if (!linha.lead) continue
          const existente = porLead.get(linha.lead_id)
          if (existente) {
            existente.total += 1
          } else {
            porLead.set(linha.lead_id, { lead: linha.lead, ultimaMensagem: linha, total: 1 })
          }
        }
        setConversas(Array.from(porLead.values()))
        setLoading(false)
      })
    return () => { ativo = false }
  }, [revision])

  return (
    <div>
      <div className="mb-5">
        <h1 className="font-display text-2xl font-bold text-navy">Chats</h1>
        <p className="text-sm text-navy/60 mt-1">Todas as conversas de WhatsApp com os leads, num só lugar.</p>
      </div>

      {loading ? (
        <SkeletonChats />
      ) : conversas.length === 0 ? (
        <div className="bg-white rounded-xl border border-navy/10 p-10 text-center text-sm text-navy/50">
          Ainda não há conversas. As mensagens enviadas na ficha de um lead (separador WhatsApp) aparecem aqui.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-navy/10 divide-y divide-navy/5">
          {conversas.map(({ lead, ultimaMensagem, total }) => (
            <button
              key={lead.id}
              onClick={() => openLead(lead, 'whatsapp')}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-sand/60 text-left transition-colors"
            >
              <Avatar nome={lead.nome} apelido={lead.apelido} size={38} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-navy truncate">{lead.nome} {lead.apelido ?? ''}</span>
                  {total > 1 && (
                    <span className="flex-shrink-0 text-[10px] font-mono text-navy/40">{total} msgs</span>
                  )}
                </div>
                <div className="text-xs text-navy/50 truncate mt-0.5">
                  {ultimaMensagem.direcao === 'saida' ? 'Você: ' : ''}
                  {ultimaMensagem.corpo}
                </div>
              </div>
              <span className="flex-shrink-0 text-[11px] text-navy/40">
                {formatDistanceToNow(new Date(ultimaMensagem.criado_em), { addSuffix: true, locale: pt })}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function SkeletonChats() {
  return (
    <div className="bg-white rounded-xl border border-navy/10 divide-y divide-navy/5 animate-pulse">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3">
          <div className="w-[38px] h-[38px] rounded-full bg-navy/10 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-32 bg-navy/10 rounded" />
            <div className="h-2.5 w-48 bg-navy/5 rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}
