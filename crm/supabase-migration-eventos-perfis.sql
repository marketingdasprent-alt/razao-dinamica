-- Executar depois de supabase-migration-permissao-edicao.sql, no SQL Editor
-- do Supabase.
--
-- Regista quem criou, editou, excluiu ou repôs a senha de cada conta do
-- CRM — o ponto mais fraco apontado na auditoria: hoje não há histórico de
-- ações administrativas sobre utilizadores, só sobre leads.
--
-- Edição e exclusão passam pelas RPCs alterar_perfil/excluir_perfil, que
-- preservam o JWT de quem chama mesmo vindas diretamente do REST (sem
-- passar pela API da Vercel) — por isso ficam num trigger, à prova do
-- cliente ir direto ao Postgres. Criação e reposição de senha só existem
-- através da API da Vercel (exigem a service role key, que nunca sai do
-- servidor), por isso a própria API grava esses dois eventos.
begin;

create table public.eventos_perfis (
  id uuid primary key default gen_random_uuid(),
  alvo_id uuid,
  alvo_nome text,
  alvo_email text,
  acao text not null check (acao in ('criado', 'editado', 'excluido', 'senha_reposta')),
  realizado_por uuid,
  realizado_por_email text,
  detalhe jsonb,
  criado_em timestamptz not null default now()
);
alter table public.eventos_perfis enable row level security;
revoke all on public.eventos_perfis from anon, authenticated;
grant select on public.eventos_perfis to authenticated;
grant all on public.eventos_perfis to service_role;
create policy eventos_perfis_admin on public.eventos_perfis for select to authenticated
using (crm_private.admin());
create index eventos_perfis_criado_em_idx on public.eventos_perfis(criado_em desc);

create function crm_private.auditar_perfil() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'DELETE' then
    insert into public.eventos_perfis(alvo_id, alvo_nome, alvo_email, acao, realizado_por, realizado_por_email)
    values (old.id, old.nome, old.email, 'excluido', auth.uid(), auth.email());
    return old;
  end if;
  -- Só grava se um campo que o admin de facto controla mudou — evita ruído
  -- de escritas internas que também passam por UPDATE (dispositivo do
  -- login, libertação automática de exigir_troca_senha).
  if new.nome is distinct from old.nome or new.papel is distinct from old.papel or
    new.ativo is distinct from old.ativo or new.pode_editar_leads is distinct from old.pode_editar_leads then
    insert into public.eventos_perfis(alvo_id, alvo_nome, alvo_email, acao, realizado_por, realizado_por_email, detalhe)
    values (new.id, new.nome, new.email, 'editado', auth.uid(), auth.email(), jsonb_build_object(
      'papel', jsonb_build_object('antes', old.papel, 'depois', new.papel),
      'ativo', jsonb_build_object('antes', old.ativo, 'depois', new.ativo),
      'pode_editar_leads', jsonb_build_object('antes', old.pode_editar_leads, 'depois', new.pode_editar_leads)
    ));
  end if;
  return new;
end;
$$;
revoke all on function crm_private.auditar_perfil() from public;
create trigger auditar_perfil after update or delete on public.perfis for each row execute function crm_private.auditar_perfil();

commit;
