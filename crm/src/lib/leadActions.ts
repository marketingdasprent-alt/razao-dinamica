import { supabase } from './supabase'
import type { Estado, Lead } from './types'

export async function mudarEstado(lead: Lead, estado: Estado): Promise<Lead> {
  const { data, error } = await supabase.rpc('mudar_estado_lead', {
    p_id: lead.id, p_estado: estado, p_versao: lead.atualizado_em,
  })
  if (error || !data) throw new Error(error?.message || 'O lead já não está disponível.')
  return data as Lead
}
