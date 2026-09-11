-- Razão Dinâmica CRM — log de auditoria de leads
-- Como usar: abra o SQL Editor do projeto Supabase do CRM, cole este ficheiro
-- inteiro, e clique em "Run". Só precisa de correr uma vez.

-- ============================================================
-- Tabela: eventos_leads (auditoria — quem apagou, quando, qual lead)
-- ============================================================
create table eventos_leads (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid,
  lead_nome text,
  lead_email text,
  acao text not null check (acao in ('apagado')),
  realizado_por uuid references auth.users(id) on delete set null default auth.uid(),
  realizado_por_email text default auth.email(),
  criado_em timestamptz not null default now()
);

alter table eventos_leads enable row level security;

-- É um registo de auditoria: qualquer conta do CRM pode criar e consultar
-- eventos, mas ninguém pode alterar ou apagar um registo já criado (não há
-- políticas de update/delete — por omissão fica bloqueado).
create policy "authenticated_insert_eventos_leads"
  on eventos_leads for insert to authenticated with check (true);

create policy "authenticated_select_eventos_leads"
  on eventos_leads for select to authenticated using (true);

create index eventos_leads_criado_em_idx on eventos_leads(criado_em desc);
