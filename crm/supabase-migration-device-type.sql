-- Executar uma vez, no SQL Editor do Supabase. Só leitura de acréscimo, não
-- mexe em nenhuma política existente — a coluna é nova e opcional, e as
-- políticas de leads não fazem referência a colunas específicas além de
-- estado/atribuido_a/atribuido_em, então continuam a valer sem alteração.
alter table public.leads add column if not exists device_type text
  check (device_type in ('mobile', 'desktop'));
