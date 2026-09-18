-- Executar depois de supabase-migration-permissoes.sql, no SQL Editor do
-- Supabase.
--
-- Tipo de dispositivo (mobile/desktop) usado no último acesso ao CRM, por
-- utilizador. A data do último acesso já é rastreada pelo Supabase Auth
-- (last_sign_in_at, exposta via GET /api/utilizadores) — isto complementa
-- só com o tipo de dispositivo, que o Auth não guarda.
--
-- A auditoria nativa do Supabase (auth.audit_log_entries) está disponível
-- mas vazia neste projeto — por isso o registo é feito pelo próprio CRM,
-- não por essa tabela.
begin;

alter table public.perfis add column if not exists ultimo_dispositivo text
  check (ultimo_dispositivo is null or ultimo_dispositivo in ('mobile', 'desktop'));

-- Cada sessão só grava o próprio dispositivo (auth.uid()) — não há como
-- uma conta alterar o registo de outra.
create or replace function public.registar_dispositivo(p_tipo text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not crm_private.ativo() then raise exception 'Conta sem acesso ao CRM.'; end if;
  if p_tipo not in ('mobile', 'desktop') then raise exception 'Tipo de dispositivo inválido.'; end if;
  update public.perfis set ultimo_dispositivo = p_tipo where id = auth.uid();
end;
$$;
revoke all on function public.registar_dispositivo(text) from public;
grant execute on function public.registar_dispositivo(text) to authenticated;

commit;
