-- Executar depois de supabase-migration.sql. Inclui a tabela de eventos,
-- independentemente de a migração antiga de eventos já ter sido aplicada.
-- O bootstrap do primeiro administrador é separado e exige um UUID verificado.
begin;

create table public.perfis (
  id uuid primary key references auth.users(id) on delete restrict,
  nome text not null check (length(trim(nome)) between 1 and 120),
  email text not null unique,
  papel text not null default 'gestor' check (papel in ('admin', 'gestor')),
  ativo boolean not null default true,
  criado_em timestamptz not null default now()
);
alter table public.perfis enable row level security;
revoke all on public.perfis from anon, authenticated;
grant select on public.perfis to authenticated;
grant all on public.perfis to service_role;

create schema if not exists crm_private;
revoke all on schema crm_private from public;
grant usage on schema crm_private to authenticated, anon;

create function crm_private.ativo() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.perfis where id = auth.uid() and ativo);
$$;
create function crm_private.admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.perfis where id = auth.uid() and ativo and papel = 'admin');
$$;
revoke all on function crm_private.ativo(), crm_private.admin() from public;
grant execute on function crm_private.ativo(), crm_private.admin() to anon, authenticated;

create policy perfis_leitura on public.perfis for select to authenticated
using (id = auth.uid() or crm_private.admin());

-- Única operação de alteração de perfis disponível a sessões do CRM.
-- O bloqueio serializa despromoções concorrentes do último administrador.
create function public.alterar_perfil(p_id uuid, p_nome text, p_papel text, p_ativo boolean)
returns public.perfis language plpgsql security definer set search_path = '' as $$
declare resultado public.perfis;
begin
  lock table public.perfis in share row exclusive mode;
  if not crm_private.admin() then raise exception 'Acesso reservado ao administrador.'; end if;
  if p_papel not in ('admin', 'gestor') or p_ativo is null or p_nome is null then
    raise exception 'Perfil inválido.';
  end if;
  select * into resultado from public.perfis where id = p_id for update;
  if not found then raise exception 'Utilizador não encontrado.'; end if;
  if resultado.papel = 'admin' and resultado.ativo and (p_papel <> 'admin' or not p_ativo)
    and not exists(select 1 from public.perfis where id <> p_id and ativo and papel = 'admin') then
    raise exception 'É necessário manter pelo menos um administrador ativo.';
  end if;
  update public.perfis set nome = trim(p_nome), papel = p_papel, ativo = p_ativo
    where id = p_id returning * into resultado;
  return resultado;
end;
$$;
revoke all on function public.alterar_perfil(uuid, text, text, boolean) from public;
grant execute on function public.alterar_perfil(uuid, text, text, boolean) to authenticated;

alter table public.leads add column atribuido_a uuid references public.perfis(id) on delete restrict;
alter table public.leads add column atribuido_em timestamptz;
create index leads_atribuido_a_idx on public.leads(atribuido_a);

-- Leads antigos fora de Novo e sem responsável ficam visíveis só ao admin,
-- que os atribui após rever a operação. Nenhum dono é inferido pela migração.
create function crm_private.ver_lead(p_lead uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select crm_private.ativo() and exists (
    select 1 from public.leads where id = p_lead and
    (crm_private.admin() or atribuido_a = auth.uid() or (atribuido_a is null and estado = 'Novo'))
  );
$$;
create function crm_private.editar_lead(p_lead uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select crm_private.ativo() and exists (
    select 1 from public.leads where id = p_lead and (crm_private.admin() or atribuido_a = auth.uid())
  );
$$;
revoke all on function crm_private.ver_lead(uuid), crm_private.editar_lead(uuid) from public;
grant execute on function crm_private.ver_lead(uuid), crm_private.editar_lead(uuid) to authenticated;

-- Remover todas as políticas antigas das tabelas envolvidas: políticas permissivas
-- combinam-se por OR e deixá-las ativas anularia o isolamento.
do $$ declare p record; begin
  for p in select tablename, policyname from pg_policies where schemaname = 'public'
    and tablename in ('leads', 'notas', 'whatsapp_mensagens', 'eventos_leads') loop
    execute format('drop policy %I on public.%I', p.policyname, p.tablename);
  end loop;
end $$;

create policy leads_publico on public.leads for insert to anon
with check (estado = 'Novo' and atribuido_a is null and atribuido_em is null);
create policy leads_ler on public.leads for select to authenticated
using (crm_private.ativo() and (crm_private.admin() or atribuido_a = auth.uid() or (atribuido_a is null and estado = 'Novo')));
create policy leads_criar on public.leads for insert to authenticated
with check (crm_private.admin() and estado = 'Novo' and atribuido_a is null and atribuido_em is null);
create policy leads_editar on public.leads for update to authenticated
using (crm_private.ativo() and (crm_private.admin() or atribuido_a = auth.uid() or (atribuido_a is null and estado = 'Novo')))
with check (crm_private.ativo() and (crm_private.admin() or atribuido_a = auth.uid()));
create policy leads_apagar on public.leads for delete to authenticated using (crm_private.admin());

create function crm_private.proteger_lead() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if not crm_private.ativo() then raise exception 'Conta sem acesso ao CRM.'; end if;
  if new.id <> old.id or new.criado_em <> old.criado_em then
    raise exception 'Identificação do lead não pode ser alterada.';
  end if;
  if not crm_private.admin() then
    if new.atribuido_a is distinct from old.atribuido_a or new.atribuido_em is distinct from old.atribuido_em then
      raise exception 'Apenas o administrador pode reatribuir leads.';
    end if;
    if old.atribuido_a is null and old.estado = 'Novo' and new.estado <> 'Novo' then
      if (to_jsonb(new) - array['estado', 'atualizado_em']) is distinct from
         (to_jsonb(old) - array['estado', 'atualizado_em']) then
        raise exception 'Assuma o lead antes de editar os detalhes.';
      end if;
      new.atribuido_a := auth.uid();
      new.atribuido_em := now();
    elsif old.atribuido_a is distinct from auth.uid() then
      raise exception 'Este lead já não está disponível. Atualize a lista.';
    end if;
  else
    if new.atribuido_a is distinct from old.atribuido_a then
      if new.atribuido_a is not null and not exists (
        select 1 from public.perfis where id = new.atribuido_a and ativo
      ) then raise exception 'Escolha um utilizador ativo.'; end if;
      new.atribuido_em := case when new.atribuido_a is null then null else now() end;
    else
      new.atribuido_em := old.atribuido_em;
    end if;
    if new.atribuido_a is null and new.estado <> 'Novo' and
      (new.estado is distinct from old.estado or new.atribuido_a is distinct from old.atribuido_a) then
      raise exception 'Atribua um responsável antes de mudar o estado.';
    end if;
  end if;
  new.atualizado_em := now();
  return new;
end;
$$;
revoke all on function crm_private.proteger_lead() from public;
create trigger proteger_lead before update on public.leads for each row execute function crm_private.proteger_lead();

-- RPC mantém o bloqueio da linha até ao fim e falha explicitamente se a visão
-- do cliente estiver desatualizada. O trigger protege também o REST direto.
create function public.mudar_estado_lead(p_id uuid, p_estado public.lead_estado, p_versao timestamptz)
returns public.leads language plpgsql security invoker set search_path = '' as $$
declare resultado public.leads;
begin
  select * into resultado from public.leads where id = p_id for update;
  if not found or resultado.atualizado_em is distinct from p_versao then
    raise exception 'O lead mudou ou já não está disponível. Atualize a lista.';
  end if;
  update public.leads set estado = p_estado where id = p_id returning * into resultado;
  if not found then raise exception 'Não foi possível alterar este lead.'; end if;
  return resultado;
end;
$$;
create function public.atribuir_lead(p_id uuid, p_responsavel uuid, p_versao timestamptz)
returns public.leads language plpgsql security invoker set search_path = '' as $$
declare resultado public.leads;
begin
  if not crm_private.admin() then raise exception 'Acesso reservado ao administrador.'; end if;
  select * into resultado from public.leads where id = p_id for update;
  if not found or resultado.atualizado_em is distinct from p_versao then
    raise exception 'O lead mudou. Atualize antes de atribuir.';
  end if;
  update public.leads set atribuido_a = p_responsavel,
    estado = case when p_responsavel is null then 'Novo'::public.lead_estado else estado end
    where id = p_id returning * into resultado;
  return resultado;
end;
$$;
revoke all on function public.mudar_estado_lead(uuid, public.lead_estado, timestamptz), public.atribuir_lead(uuid, uuid, timestamptz) from public;
grant execute on function public.mudar_estado_lead(uuid, public.lead_estado, timestamptz), public.atribuir_lead(uuid, uuid, timestamptz) to authenticated;

create policy notas_ler on public.notas for select to authenticated using (crm_private.ver_lead(lead_id));
create policy notas_criar on public.notas for insert to authenticated with check (crm_private.editar_lead(lead_id));
create policy notas_editar on public.notas for update to authenticated using (crm_private.editar_lead(lead_id)) with check (crm_private.editar_lead(lead_id));
create policy notas_apagar on public.notas for delete to authenticated using (crm_private.editar_lead(lead_id));
create policy mensagens_ler on public.whatsapp_mensagens for select to authenticated using (crm_private.ver_lead(lead_id));
create policy mensagens_criar on public.whatsapp_mensagens for insert to authenticated with check (crm_private.editar_lead(lead_id));
create policy mensagens_editar on public.whatsapp_mensagens for update to authenticated using (crm_private.editar_lead(lead_id)) with check (crm_private.editar_lead(lead_id));
create policy mensagens_apagar on public.whatsapp_mensagens for delete to authenticated using (crm_private.editar_lead(lead_id));

-- Serializar escritas em notas/mensagens com a reatribuição do respetivo lead.
-- O bloqueio impede que uma escrita iniciada pelo antigo dono atravesse uma
-- reatribuição concorrente. A eliminação em cascata já é autorizada pelo lead.
create function crm_private.proteger_conteudo() returns trigger
language plpgsql security definer set search_path = '' as $$
declare pai public.leads;
begin
  if tg_op = 'UPDATE' and new.lead_id <> old.lead_id then
    raise exception 'Não é permitido mover conteúdo entre leads.';
  end if;
  select * into pai from public.leads where id = new.lead_id for update;
  if not found or not crm_private.ativo() or not (crm_private.admin() or coalesce(pai.atribuido_a = auth.uid(), false)) then
    raise exception 'Assuma o lead antes de escrever ou atualize a conversa.';
  end if;
  return new;
end;
$$;
revoke all on function crm_private.proteger_conteudo() from public;
create trigger proteger_nota before insert or update on public.notas for each row execute function crm_private.proteger_conteudo();
create trigger proteger_mensagem before insert or update on public.whatsapp_mensagens for each row execute function crm_private.proteger_conteudo();

create table if not exists public.eventos_leads (
  id uuid primary key default gen_random_uuid(), lead_id uuid, lead_nome text, lead_email text,
  acao text not null, realizado_por uuid, realizado_por_email text,
  criado_em timestamptz not null default now()
);
alter table public.eventos_leads drop constraint if exists eventos_leads_acao_check;
alter table public.eventos_leads add constraint eventos_leads_acao_check
  check (acao in ('apagado', 'atribuido', 'reatribuido', 'devolvido'));
alter table public.eventos_leads add column if not exists responsavel_anterior uuid;
alter table public.eventos_leads add column if not exists responsavel_novo uuid;
alter table public.eventos_leads enable row level security;
revoke all on public.eventos_leads from anon, authenticated;
grant select on public.eventos_leads to authenticated;
create policy eventos_admin on public.eventos_leads for select to authenticated using (crm_private.admin());
create index if not exists eventos_leads_criado_em_idx on public.eventos_leads(criado_em desc);

create function crm_private.auditar_lead() returns trigger
language plpgsql security definer set search_path = '' as $$
declare acao_evento text; novo_responsavel uuid;
begin
  if tg_op = 'DELETE' then acao_evento := 'apagado';
  elsif new.atribuido_a is distinct from old.atribuido_a then
    novo_responsavel := new.atribuido_a;
    acao_evento := case when new.atribuido_a is null then 'devolvido'
      when old.atribuido_a is null then 'atribuido' else 'reatribuido' end;
  else return new;
  end if;
  insert into public.eventos_leads(lead_id, lead_nome, lead_email, acao, realizado_por,
    realizado_por_email, responsavel_anterior, responsavel_novo)
  values(old.id, trim(concat(old.nome, ' ', old.apelido)), old.email, acao_evento,
    auth.uid(), auth.email(), old.atribuido_a, novo_responsavel);
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;
revoke all on function crm_private.auditar_lead() from public;
create trigger auditar_lead after update or delete on public.leads for each row execute function crm_private.auditar_lead();
commit;
