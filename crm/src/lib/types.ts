export const ESTADOS = [
  'Novo',
  'Contactado',
  'Qualificado',
  'Proposta enviada',
  'Ganho',
  'Perdido',
] as const

export type Estado = (typeof ESTADOS)[number]

export const SERVICOS = [
  'Contabilidade',
  'Fiscalidade',
  'Consultoria de gestão',
  'Planeamento financeiro',
  'Auditoria interna',
  'Ainda não sei',
] as const

export interface Lead {
  responsavel?: { nome: string } | null
  atribuido_a: string | null
  atribuido_em: string | null
  id: string
  nome: string
  apelido: string | null
  email: string
  empresa: string | null
  ddi: string | null
  telefone: string | null
  servico: string | null
  mensagem: string | null
  consentimento: boolean | null
  origem: string
  device_type: 'mobile' | 'desktop' | null
  estado: Estado
  criado_em: string
  atualizado_em: string
}

export interface Nota {
  id: string
  lead_id: string
  corpo: string
  criado_em: string
}

export type MensagemEstado = 'simulado' | 'enviado' | 'entregue' | 'lido' | 'falhou'

export interface MensagemWhatsApp {
  id: string
  lead_id: string
  direcao: 'entrada' | 'saida'
  corpo: string
  estado: MensagemEstado
  criado_em: string
}

export type AcaoEvento = 'apagado' | 'atribuido' | 'reatribuido' | 'devolvido'

export interface Perfil {
  exigir_troca_senha: boolean
  id: string
  nome: string
  email: string
  papel: 'admin' | 'gestor'
  ativo: boolean
  criado_em: string
}

export interface EventoLead {
  id: string
  lead_id: string | null
  lead_nome: string | null
  lead_email: string | null
  acao: AcaoEvento
  realizado_por: string | null
  realizado_por_email: string | null
  criado_em: string
}
