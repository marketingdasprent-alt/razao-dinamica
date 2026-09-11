-- Executar uma vez, depois de supabase-migration-permissoes.sql.
begin;
alter table public.perfis add column exigir_troca_senha boolean not null default false;

-- Sessões com senha temporária podem consultar o próprio perfil, mas não os
-- dados do CRM nem executar operações administrativas, mesmo via REST direto.
create or replace function crm_private.ativo() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.perfis where id = auth.uid() and ativo and not exigir_troca_senha);
$$;
create or replace function crm_private.admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.perfis where id = auth.uid() and ativo and papel = 'admin' and not exigir_troca_senha);
$$;

-- Só uma alteração real da credencial no Auth libera o primeiro acesso.
-- Não confiar em user_metadata ou numa chamada do navegador para liberar o perfil.
create function crm_private.senha_atualizada() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.encrypted_password is distinct from old.encrypted_password
    and coalesce(old.encrypted_password, '') <> ''
    and coalesce(new.encrypted_password, '') <> '' then
    update public.perfis set exigir_troca_senha = false
      where id = new.id and exigir_troca_senha;
  end if;
  return new;
end;
$$;
revoke all on function crm_private.senha_atualizada() from public;
create trigger crm_senha_atualizada after update of encrypted_password on auth.users
for each row execute function crm_private.senha_atualizada();
commit;
