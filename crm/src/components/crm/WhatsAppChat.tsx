import { useEffect, useRef, useState } from 'react'
import { format } from 'date-fns'
import { notifyLeadsChanged } from '@/hooks/useLeadSheet'
import { supabase } from '@/lib/supabase'
import type { Lead, MensagemWhatsApp } from '@/lib/types'
import { useToast } from '@/hooks/useToast'

export default function WhatsAppChat({ lead, readOnly = false }: { lead: Lead; readOnly?: boolean }) {
  const toast = useToast()
  const [mensagens, setMensagens] = useState<MensagemWhatsApp[]>([])
  const [texto, setTexto] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase
      .from('whatsapp_mensagens')
      .select('*')
      .eq('lead_id', lead.id)
      .order('criado_em', { ascending: true })
      .then(({ data, error }) => {
        if (!error) setMensagens((data as MensagemWhatsApp[]) ?? [])
        setLoading(false)
      })
  }, [lead.id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'nearest' })
  }, [mensagens])

  async function handleSend() {
    const corpo = texto.trim()
    if (!corpo || readOnly || sending) return
    setSending(true)
    const { data, error } = await supabase
      .from('whatsapp_mensagens')
      .insert({ lead_id: lead.id, direcao: 'saida', corpo, estado: 'simulado' })
      .select()
      .single()
    setSending(false)
    if (error) { toast.show('Não foi possível guardar a mensagem.', 'error'); return }
    setMensagens((prev) => [...prev, data as MensagemWhatsApp])
    setTexto('')
    notifyLeadsChanged()
  }

  const semNumero = !lead.telefone

  return (
    <div className="flex flex-col h-full">
      <div className="mx-4 mt-3 mb-1 flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
        <span className="text-amber-500 mt-0.5">⚠</span>
        <p className="text-[11px] text-amber-800 leading-relaxed">
          Pré-visualização — ainda não ligado à WhatsApp Business API da Meta. As mensagens ficam guardadas aqui, mas
          não são enviadas de verdade ao lead ainda.
        </p>
      </div>

      {semNumero && (
        <p className="mx-4 mt-2 text-[11px] text-navy/40">Este lead não tem número de telefone registado.</p>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 min-h-[220px]">
        {loading && <p className="text-xs text-navy/40 text-center py-6">A carregar…</p>}
        {!loading && mensagens.length === 0 && (
          <p className="text-xs text-navy/30 text-center py-10">Ainda sem mensagens com este lead.</p>
        )}
        {mensagens.map((m) => (
          <div key={m.id} className={`flex ${m.direcao === 'saida' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                m.direcao === 'saida'
                  ? 'bg-teal text-white rounded-br-sm'
                  : 'bg-sand text-navy rounded-bl-sm'
              }`}
            >
              <p className="whitespace-pre-wrap">{m.corpo}</p>
              <div className={`text-[10px] mt-1 ${m.direcao === 'saida' ? 'text-white/70' : 'text-navy/40'}`}>
                {format(new Date(m.criado_em), 'HH:mm')}
                {m.direcao === 'saida' && m.estado === 'simulado' && ' · rascunho'}
              </div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {readOnly && <p className="px-4 text-xs text-navy/60">Assuma o lead em Detalhes para escrever mensagens.</p>}
      <div className="border-t border-navy/10 p-3 flex gap-2">
        <input
          type="text"
          disabled={readOnly}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSend() }}
          placeholder="Escrever mensagem…"
          className="flex-1 rounded-lg border border-navy/15 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gold"
        />
        <button
          onClick={handleSend}
          disabled={readOnly || sending || !texto.trim()}
          className="rounded-lg bg-teal text-white text-sm font-medium px-4 hover:brightness-105 transition disabled:opacity-50"
        >
          Enviar
        </button>
      </div>
    </div>
  )
}
