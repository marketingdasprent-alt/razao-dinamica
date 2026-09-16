-- Executar depois de supabase-migration-permissoes.sql, no SQL Editor do
-- Supabase.
--
-- RPC para o admin excluir a conta de um utilizador. leads.atribuido_a
-- referencia perfis com "on delete restrict" de propósito — em vez de
-- desatribuir leads silenciosamente, a exclusão é recusada enquanto o
-- utilizador ainda tiver leads em nome dele, para forçar uma decisão
-- explícita sobre esses leads primeiro. eventos_leads.realizado_por não
-- tem chave estrangeira, então o histórico de auditoria sobrevive à
-- exclusão da conta.
begin;

create or replace function public.excluir_perfil(p_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare alvo public.perfis; total_leads int;
begin
  lock table public.perfis in share row exclusive mode;
  if not crm_private.admin() then raise exception 'Acesso reservado ao administrador.'; end if;
  select * into alvo from public.perfis where id = p_id for update;
  if not found then raise exception 'Utilizador não encontrado.'; end if;
  if alvo.papel = 'admin' and alvo.ativo
    and not exists(select 1 from public.perfis where id <> p_id and ativo and papel = 'admin') then
    raise exception 'É necessário manter pelo menos um administrador ativo.';
  end if;
  select count(*) into total_leads from public.leads where atribuido_a = p_id;
  if total_leads > 0 then
    raise exception 'Este utilizador tem % lead(s) atribuído(s). Reatribua-os antes de excluir.', total_leads;
  end if;
  delete from public.perfis where id = p_id;
end;
$$;
revoke all on function public.excluir_perfil(uuid) from public;
grant execute on function public.excluir_perfil(uuid) to authenticated;

commit;
