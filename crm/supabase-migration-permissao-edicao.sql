-- Executar depois de supabase-migration-permissoes.sql, no SQL Editor do
-- Supabase.
--
-- Adiciona uma permissão de edição por conta: por omissão, um gestor
-- consegue ver os leads atribuídos a ele mas não editar nada neles (nem
-- os campos do lead, nem o estado, nem notas ou mensagens de WhatsApp) —
-- só o admin edita livremente. A permissão fica desligada por omissão e o
-- admin ativa-a por utilizador, na ficha em Utilizadores.
--
-- Não afeta o direito de assumir um lead da fila comum (continua
-- disponível a qualquer gestor ativo, com ou sem esta permissão) — ela só
-- passa a valer depois de o lead já estar atribuído a alguém.
begin;

alter table public.perfis add column pode_editar_leads boolean not null default false;

create function crm_private.pode_editar_leads() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.perfis where id = auth.uid() and pode_editar_leads);
$$;
revoke all on function crm_private.pode_editar_leads() from public;
grant execute on function crm_private.pode_editar_leads() to authenticated;

-- editar_lead() é a função que a RLS de leads/notas/whatsapp_mensagens usa
-- para aceitar escrita: passa a exigir também a permissão de edição,
-- exceto para o admin (que edita sempre tudo).
create or replace function crm_private.editar_lead(p_lead uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select crm_private.ativo() and exists (
    select 1 from public.leads where id = p_lead and
    (crm_private.admin() or (atribuido_a = auth.uid() and crm_private.pode_editar_leads()))
  );
$$;

-- Mesmo controlo dentro do trigger que protege o UPDATE direto de leads.
-- Só o ramo "já estava atribuído a mim" passa a exigir a permissão — o
-- ramo de assumir um lead novo da fila comum (acima) fica como estava.
create or replace function crm_private.proteger_lead() returns trigger
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
    elsif not crm_private.pode_editar_leads() then
      raise exception 'Não tem permissão de edição para este lead. Peça ao administrador para a ativar.';
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

create or replace function crm_private.proteger_conteudo() returns trigger
language plpgsql security definer set search_path = '' as $$
declare pai public.leads;
begin
  if tg_op = 'UPDATE' and new.lead_id <> old.lead_id then
    raise exception 'Não é permitido mover conteúdo entre leads.';
  end if;
  select * into pai from public.leads where id = new.lead_id for update;
  if not found or not crm_private.ativo() or
    not (crm_private.admin() or (coalesce(pai.atribuido_a = auth.uid(), false) and crm_private.pode_editar_leads())) then
    raise exception 'Assuma o lead antes de escrever ou atualize a conversa.';
  end if;
  return new;
end;
$$;

-- alterar_perfil ganha o novo campo. A assinatura antiga (4 argumentos) é
-- removida de propósito para não deixar um caminho paralelo que ignore o
-- campo novo — mas como o 5º parâmetro tem omissão para false, quem ainda
-- chamar com só 4 argumentos continua a funcionar (só que grava a
-- permissão de edição como desligada; para preservar um valor já
-- concedido, passe o 5º argumento explicitamente).
drop function if exists public.alterar_perfil(uuid, text, text, boolean);
create function public.alterar_perfil(p_id uuid, p_nome text, p_papel text, p_ativo boolean, p_pode_editar boolean default false)
returns public.perfis language plpgsql security definer set search_path = '' as $$
declare resultado public.perfis;
begin
  lock table public.perfis in share row exclusive mode;
  if not crm_private.admin() then raise exception 'Acesso reservado ao administrador.'; end if;
  if p_papel not in ('admin', 'gestor') or p_ativo is null or p_nome is null or p_pode_editar is null then
    raise exception 'Perfil inválido.';
  end if;
  select * into resultado from public.perfis where id = p_id for update;
  if not found then raise exception 'Utilizador não encontrado.'; end if;
  if resultado.papel = 'admin' and resultado.ativo and (p_papel <> 'admin' or not p_ativo)
    and not exists(select 1 from public.perfis where id <> p_id and ativo and papel = 'admin') then
    raise exception 'É necessário manter pelo menos um administrador ativo.';
  end if;
  update public.perfis set nome = trim(p_nome), papel = p_papel, ativo = p_ativo, pode_editar_leads = p_pode_editar
    where id = p_id returning * into resultado;
  return resultado;
end;
$$;
revoke all on function public.alterar_perfil(uuid, text, text, boolean, boolean) from public;
grant execute on function public.alterar_perfil(uuid, text, text, boolean, boolean) to authenticated;

commit;
