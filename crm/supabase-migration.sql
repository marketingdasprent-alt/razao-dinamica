-- Razão Dinâmica CRM — script completo de estrutura do banco de dados
-- Como usar: crie um projeto em https://supabase.com (grátis), abra o
-- "SQL Editor" desse projeto, cole este ficheiro inteiro, e clique em "Run".
-- Depois, copie o "Project URL" e a "anon public key" (em Project Settings
-- > API) e mande-os de volta — é só isso que preciso para ligar o CRM e o
-- site a este banco novo.

-- ============================================================
-- Estados possíveis de um lead (colunas do kanban)
-- ============================================================
create type lead_estado as enum (
  'Novo',
  'Contactado',
  'Qualificado',
  'Proposta enviada',
  'Ganho',
  'Perdido'
);

-- ============================================================
-- Tabela: leads
-- ============================================================
create table leads (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  apelido text,
  email text not null,
  empresa text,
  ddi text default '+351',
  telefone text,
  servico text,
  mensagem text,
  consentimento boolean default false,
  origem text not null default 'home',
  estado lead_estado not null default 'Novo',
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

alter table leads enable row level security;

-- O site público só pode CRIAR leads, nunca ler/editar/apagar leads de outros.
create policy "anon_insert_leads"
  on leads for insert
  to anon
  with check (true);

-- A equipa (autenticada no CRM) tem acesso completo.
create policy "authenticated_select_leads"
  on leads for select to authenticated using (true);
create policy "authenticated_insert_leads"
  on leads for insert to authenticated with check (true);
create policy "authenticated_update_leads"
  on leads for update to authenticated using (true) with check (true);
create policy "authenticated_delete_leads"
  on leads for delete to authenticated using (true);

-- ============================================================
-- Tabela: notas (notas internas por lead)
-- ============================================================
create table notas (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  corpo text not null,
  criado_em timestamptz not null default now()
);

alter table notas enable row level security;

-- Só a equipa autenticada mexe em notas — nenhum acesso público.
create policy "authenticated_all_notas"
  on notas for all to authenticated using (true) with check (true);

create index notas_lead_id_idx on notas(lead_id);

-- ============================================================
-- Tabela: whatsapp_mensagens (histórico de conversa por lead)
-- Nota: por agora isto só guarda mensagens dentro do CRM (modo
-- "rascunho/simulação"). Passa a ser conversa real assim que a
-- WhatsApp Business API da Meta for ligada.
-- ============================================================
create table whatsapp_mensagens (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  direcao text not null check (direcao in ('entrada','saida')),
  corpo text not null,
  estado text not null default 'simulado'
    check (estado in ('simulado','enviado','entregue','lido','falhou')),
  criado_em timestamptz not null default now()
);

alter table whatsapp_mensagens enable row level security;

create policy "authenticated_all_whatsapp_mensagens"
  on whatsapp_mensagens for all to authenticated using (true) with check (true);

create index whatsapp_mensagens_lead_id_idx on whatsapp_mensagens(lead_id);
