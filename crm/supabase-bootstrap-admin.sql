-- Executar depois da migração de permissões, numa consulta nova.
begin;
do $$
begin
  if not exists (
    select 1 from auth.users
    where id = '00ca48ac-4e2e-4e57-aff8-84b27f7f7ca0'::uuid
      and lower(email) = 'geral@razaodinamica.pt'
  ) then
    raise exception 'O UUID não corresponde à conta geral esperada.';
  end if;

  if exists (select 1 from public.perfis where papel = 'admin' and ativo) then
    raise exception 'Já existe um administrador ativo. Use o painel Utilizadores.';
  end if;

  insert into public.perfis (id, nome, email, papel, ativo)
  values (
    '00ca48ac-4e2e-4e57-aff8-84b27f7f7ca0'::uuid,
    'Administração', 'geral@razaodinamica.pt', 'admin', true
  );
end $$;
commit;
