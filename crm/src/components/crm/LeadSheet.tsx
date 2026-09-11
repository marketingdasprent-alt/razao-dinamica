import { useEffect, useState } from 'react'
import { format, formatDistanceToNow } from 'date-fns'
import { pt } from 'date-fns/locale'
import { useAuth } from '@/hooks/useAuth'
import { mudarEstado } from '@/lib/leadActions'
import Responsavel from './Responsavel'
import { supabase } from '@/lib/supabase'
import { ESTADOS, SERVICOS, type Estado, type Lead, type Nota, type Perfil } from '@/lib/types'
import { notifyLeadsChanged, type LeadSheetTab } from '@/hooks/useLeadSheet'
import { useToast } from '@/hooks/useToast'
import EstadoBadge from './EstadoBadge'
import Avatar from './Avatar'
import WhatsAppChat from './WhatsAppChat'

interface Props {
  lead: Lead
  initialTab?: LeadSheetTab
  onClose: () => void
}

type Tab = LeadSheetTab

export default function LeadSheet({ lead, initialTab = 'detalhes', onClose }: Props) {
  const toast = useToast()
  const { session, isAdmin } = useAuth()
  const [responsaveis, setResponsaveis] = useState<Perfil[]>([])
  const [novoResponsavel, setNovoResponsavel] = useState(lead.atribuido_a ?? '')
  const [changing, setChanging] = useState(false)
  const [tab, setTab] = useState<Tab>(initialTab)
  const [form, setForm] = useState(lead)
  const [saving, setSaving] = useState(false)
  const [notas, setNotas] = useState<Nota[]>([])
  const [novaNota, setNovaNota] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

  const canEdit = isAdmin || form.atribuido_a === session?.user.id
  useEffect(() => { setForm(lead); setNovoResponsavel(lead.atribuido_a ?? '') }, [lead])
  useEffect(() => {
    if (isAdmin) supabase.from('perfis').select('*').order('nome').then(({ data }) => setResponsaveis((data as Perfil[]) ?? []))
  }, [isAdmin])
  useEffect(() => { setTab(initialTab) }, [lead.id, initialTab])

  useEffect(() => {
    supabase
      .from('notas')
      .select('*')
      .eq('lead_id', lead.id)
      .order('criado_em', { ascending: false })
      .then(({ data }) => setNotas((data as Nota[]) ?? []))
  }, [lead.id])

  function set<K extends keyof Lead>(key: K, value: Lead[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSave() {
    if (!canEdit || saving) return
    setSaving(true)
    const { data, error } = await supabase
      .from('leads')
      .update({
        nome: form.nome,
        apelido: form.apelido,
        email: form.email,
        empresa: form.empresa,
        ddi: form.ddi,
        telefone: form.telefone,
        servico: form.servico,
        mensagem: form.mensagem,
        atualizado_em: new Date().toISOString(),
      })
      .eq('id', lead.id).eq('atualizado_em', form.atualizado_em).select().single()
    setSaving(false)
    if (error || !data) { toast.show('O lead mudou ou não pode ser editado. Atualize a ficha.', 'error'); notifyLeadsChanged(); onClose(); return }
    setForm(data as Lead)
    toast.show('Lead atualizado.')
    notifyLeadsChanged()
  }

  async function handleEstadoChange(estado: Estado) {
    if (changing) return
    setChanging(true)
    try { setForm(await mudarEstado(form, estado)); notifyLeadsChanged() }
    catch (error) { toast.show(error instanceof Error ? error.message : 'Não foi possível mudar o estado.', 'error'); notifyLeadsChanged(); onClose() }
    finally { setChanging(false) }
  }

  async function handleAtribuir() {
    if (!isAdmin || changing) return
    setChanging(true)
    const { data, error } = await supabase.rpc('atribuir_lead', {
      p_id: form.id, p_responsavel: novoResponsavel || null, p_versao: form.atualizado_em,
    })
    setChanging(false)
    if (error || !data) { toast.show(error?.message || 'Não foi possível atribuir.', 'error'); notifyLeadsChanged(); onClose(); return }
    setForm(data as Lead)
    toast.show(novoResponsavel ? 'Responsável atualizado.' : 'Lead devolvido à fila comum.')
    notifyLeadsChanged()
  }

  async function handleAddNota() {
    const corpo = novaNota.trim()
    if (!corpo || !canEdit) return
    const { data, error } = await supabase.from('notas').insert({ lead_id: lead.id, corpo }).select().single()
    if (error) { toast.show('Não foi possível adicionar a nota.', 'error'); return }
    setNotas((prev) => [data as Nota, ...prev])
    setNovaNota('')
  }

  async function handleDelete() {
    if (!isAdmin) return
    const { data, error } = await supabase.from('leads').delete().eq('id', lead.id).select('id').single()
    if (error || !data) { toast.show('Não foi possível apagar.', 'error'); return }
    toast.show('Lead apagado.')
    notifyLeadsChanged()
    onClose()
  }

  const telLink = form.telefone ? `${form.ddi ?? ''}${form.telefone}`.replace(/[^\d+]/g, '') : null
  const waLink = telLink ? `https://wa.me/${telLink.replace('+', '')}` : null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-navy/40 animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white h-full overflow-y-auto shadow-2xl animate-scale-in">
        <div className="sticky top-0 bg-white border-b border-navy/10 px-5 py-4 flex items-center gap-3 z-10">
          <Avatar nome={lead.nome} apelido={lead.apelido} size={40} />
          <div className="flex-1 min-w-0">
            <h2 className="font-display font-bold text-navy truncate">{lead.nome} {lead.apelido ?? ''}</h2>
            <div className="mt-1"><EstadoBadge estado={form.estado} /></div>
          </div>
          <button onClick={onClose} className="text-navy/40 hover:text-navy text-xl leading-none flex-shrink-0">&times;</button>
        </div>

        <div className="flex border-b border-navy/10 px-5">
          <TabButton label="Detalhes" active={tab === 'detalhes'} onClick={() => setTab('detalhes')} />
          <TabButton label="WhatsApp" active={tab === 'whatsapp'} onClick={() => setTab('whatsapp')} />
        </div>

        {tab === 'whatsapp' && (
          <div className="h-[calc(100%-118px)]">
            <WhatsAppChat lead={form} readOnly={!canEdit} />
          </div>
        )}

        {tab === 'detalhes' && (telLink || form.email) && (
          <div className="flex gap-2 px-5 py-3 border-b border-navy/5 bg-sand/40">
            {telLink && (
              <a href={`tel:${telLink}`} className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-white border border-navy/10 py-2 text-xs font-medium text-navy hover:border-gold transition-colors">
                <PhoneIcon /> Ligar
              </a>
            )}
            {waLink && (
              <a href={waLink} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-white border border-navy/10 py-2 text-xs font-medium text-navy hover:border-gold transition-colors">
                <WhatsAppIcon /> WhatsApp
              </a>
            )}
            <a href={`mailto:${form.email}`} className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-white border border-navy/10 py-2 text-xs font-medium text-navy hover:border-gold transition-colors">
              <MailIcon /> Email
            </a>
          </div>
        )}

        {tab === 'detalhes' && <div className="p-5 space-y-5">
          <div className="rounded-lg bg-sand p-3 space-y-2">
            <Responsavel lead={form} />
            {isAdmin && <>
              <label className="block text-xs text-navy/60">Responsável
                <select aria-label="Responsável" value={novoResponsavel} onChange={e => setNovoResponsavel(e.target.value)} className="w-full mt-1 border rounded-lg p-2 text-sm">
                  <option value="">Fila comum (Novo)</option>
                  {responsaveis.map(p => <option key={p.id} value={p.id} disabled={!p.ativo}>{p.nome}{!p.ativo ? ' (desativado)' : ''}</option>)}
                </select>
              </label>
              <button disabled={changing || (novoResponsavel === (form.atribuido_a ?? '') && form.estado === 'Novo')} onClick={handleAtribuir} className="text-sm text-teal underline disabled:opacity-40">{novoResponsavel ? 'Guardar responsável' : 'Devolver à fila comum'}</button>
            </>}
            {!canEdit && <p className="text-xs text-navy/60">Mude o estado para Contactado para assumir este lead e poder editar, adicionar notas e escrever mensagens.</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-navy/60 mb-1">Estado</label>
            <select
              disabled={changing || (isAdmin && !form.atribuido_a)}
              value={form.estado}
              onChange={(e) => handleEstadoChange(e.target.value as Estado)}
              className="w-full rounded-lg border border-navy/15 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gold"
            >
              {ESTADOS.map((estado) => <option key={estado} value={estado}>{estado}</option>)}
            </select>
          </div>

          <fieldset disabled={!canEdit || saving} className="space-y-5 disabled:opacity-60">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Nome" value={form.nome} onChange={(v) => set('nome', v)} />
            <Field label="Apelido" value={form.apelido ?? ''} onChange={(v) => set('apelido', v)} />
          </div>
          <Field label="Email" value={form.email} onChange={(v) => set('email', v)} type="email" />
          <Field label="Empresa" value={form.empresa ?? ''} onChange={(v) => set('empresa', v)} />
          <div className="grid grid-cols-3 gap-3">
            <Field label="DDI" value={form.ddi ?? ''} onChange={(v) => set('ddi', v)} />
            <div className="col-span-2"><Field label="Telefone" value={form.telefone ?? ''} onChange={(v) => set('telefone', v)} /></div>
          </div>
          <div>
            <label className="block text-xs font-medium text-navy/60 mb-1">Serviço de interesse</label>
            <select
              value={form.servico ?? ''}
              onChange={(e) => set('servico', e.target.value)}
              className="w-full rounded-lg border border-navy/15 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gold"
            >
              <option value="">—</option>
              {SERVICOS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-navy/60 mb-1">Mensagem</label>
            <textarea
              value={form.mensagem ?? ''}
              onChange={(e) => set('mensagem', e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-navy/15 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gold"
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-navy/40 font-mono">
            <span>
              Origem: {lead.origem}
              {lead.device_type && ` · ${lead.device_type === 'mobile' ? 'Telemóvel' : 'Computador'}`}
            </span>
            <span>Criado: {format(new Date(lead.criado_em), 'dd/MM/yyyy HH:mm')}</span>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full rounded-lg bg-navy text-sand text-sm font-medium py-2.5 hover:brightness-110 transition disabled:opacity-60"
          >
            {saving ? 'A guardar…' : 'Guardar alterações'}
          </button>

          <div className="border-t border-navy/10 pt-5">
            <h3 className="font-display font-semibold text-navy text-sm mb-3">Notas</h3>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={novaNota}
                onChange={(e) => setNovaNota(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddNota() }}
                placeholder="Adicionar uma nota…"
                className="flex-1 rounded-lg border border-navy/15 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gold"
              />
              <button onClick={handleAddNota} className="rounded-lg bg-gold text-navy text-sm font-medium px-3 hover:brightness-95">
                Adicionar
              </button>
            </div>
            <div className="space-y-2">
              {notas.map((nota) => (
                <div key={nota.id} className="bg-sand rounded-lg px-3 py-2">
                  <p className="text-sm text-navy whitespace-pre-wrap">{nota.corpo}</p>
                  <p className="text-[10px] text-navy/40 mt-1 font-mono">
                    {formatDistanceToNow(new Date(nota.criado_em), { addSuffix: true, locale: pt })}
                  </p>
                </div>
              ))}
              {notas.length === 0 && <p className="text-xs text-navy/40">Ainda sem notas.</p>}
            </div>
          </div>

          </fieldset>
          {isAdmin && <div className="border-t border-navy/10 pt-5">
            {!confirmDelete ? (
              <button onClick={() => setConfirmDelete(true)} className="text-xs text-red-500 hover:underline">
                Apagar lead
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-navy/60">Tem a certeza?</span>
                <button onClick={handleDelete} className="text-xs text-red-600 font-medium hover:underline">Sim, apagar</button>
                <button onClick={() => setConfirmDelete(false)} className="text-xs text-navy/50 hover:underline">Cancelar</button>
              </div>
            )}
          </div>}
        </div>}
      </div>
    </div>
  )
}

function TabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
        active ? 'border-gold text-navy' : 'border-transparent text-navy/40 hover:text-navy/70'
      }`}
    >
      {label}
    </button>
  )
}

function Field({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="block text-xs font-medium text-navy/60 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-navy/15 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gold"
      />
    </div>
  )
}

function PhoneIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 3h3l2 5-2 1a11 11 0 0 0 5 5l1-2 5 2v3a2 2 0 0 1-2 2C10 19 4 13 4 5a2 2 0 0 1 2-2z" /></svg>
}
function MailIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 6 8 7 8-7" /></svg>
}
function WhatsAppIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M17.6 6.3A8.9 8.9 0 0 0 3.5 16.9L2 22l5.3-1.4A8.9 8.9 0 0 0 21 12.4a8.9 8.9 0 0 0-3.4-6.1ZM12 20a7.6 7.6 0 0 1-3.9-1.1l-.3-.2-2.9.8.8-2.8-.2-.3A7.7 7.7 0 1 1 12 20Zm4.2-5.7c-.2-.1-1.3-.7-1.5-.7s-.4-.1-.5.1-.5.7-.7.8-.3.1-.5 0a6.3 6.3 0 0 1-1.9-1.1 6.9 6.9 0 0 1-1.3-1.6c-.1-.2 0-.3.1-.5l.4-.4.2-.4v-.4c-.1-.1-.5-1.2-.7-1.7s-.4-.4-.5-.4h-.5a.9.9 0 0 0-.6.3 2.7 2.7 0 0 0-.9 2.1 4.8 4.8 0 0 0 1 2.5 10.9 10.9 0 0 0 4.2 3.7c.6.2 1 .4 1.4.5a3.2 3.2 0 0 0 1.5.1 2.5 2.5 0 0 0 1.6-1.1 2 2 0 0 0 .1-1.1c0-.1-.2-.2-.4-.3Z" /></svg>
}
