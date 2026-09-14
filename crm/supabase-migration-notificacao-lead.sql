-- Executar no SQL Editor do Supabase (pode ser executado de novo com
-- segurança — substitui a função e o trigger existentes).
--
-- Sempre que um lead novo é inserido, chama o Apps Script (de forma
-- assíncrona, não bloqueia o INSERT) para enviar o email de notificação.
--
-- A URL do Apps Script (com o segredo que a autentica) NÃO fica mais nesta
-- migração — versões anteriores deste ficheiro tinham-na em texto simples,
-- o que a deixa exposta para sempre no histórico do Git. Agora o valor vive
-- no Supabase Vault e é lido em tempo de execução.
--
-- Antes de correr isto:
--   1. No Apps Script, gere um novo segredo e reimplante-o — o valor antigo
--      (h_vCYxgT-K-LtguqOzdc16O8mqDmaq-i) está no histórico do Git e tem de
--      parar de ser aceite.
--   2. No SQL Editor, guarde a URL nova no Vault (este comando corre uma
--      vez e NÃO fica no histórico do Git):
--        select vault.create_secret(
--          'https://script.google.com/macros/s/SEU_ID/exec?secret=SEU_SEGREDO_NOVO',
--          'lead_notification_webhook_url',
--          'URL do Apps Script que envia o email de novo lead'
--        );
--      Numa reimplantação futura (trocar o segredo outra vez), use em vez
--      disso:
--        select vault.update_secret(
--          (select id from vault.secrets where name = 'lead_notification_webhook_url'),
--          'https://script.google.com/macros/s/SEU_ID/exec?secret=SEU_SEGREDO_NOVO'
--        );
begin;

create extension if not exists pg_net;

create or replace function crm_private.notificar_novo_lead() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  webhook_url text;
begin
  select decrypted_secret into webhook_url
    from vault.decrypted_secrets
    where name = 'lead_notification_webhook_url'
    limit 1;

  -- Segredo ainda não configurado no Vault: não bloqueia o INSERT do lead,
  -- só deixa de notificar até alguém completar o passo 2 acima.
  if webhook_url is not null then
    perform net.http_post(
      url := webhook_url,
      body := jsonb_build_object('type', 'INSERT', 'table', 'leads', 'record', to_jsonb(new)),
      headers := jsonb_build_object('Content-Type', 'application/json')
    );
  end if;

  return new;
end;
$$;
revoke all on function crm_private.notificar_novo_lead() from public;

drop trigger if exists notificar_novo_lead on public.leads;
create trigger notificar_novo_lead
  after insert on public.leads
  for each row execute function crm_private.notificar_novo_lead();

commit;
