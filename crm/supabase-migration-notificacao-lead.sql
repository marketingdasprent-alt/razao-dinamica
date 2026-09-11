-- Executar uma vez, no SQL Editor do Supabase, depois de guardar a nova
-- versão do Apps Script (crm/ENTREGA-PERMISSOES.md ou o handoff descrevem
-- o resto do fluxo; este script só liga o "disparador" do lado do banco).
--
-- Sempre que um lead novo é inserido, chama o Apps Script (de forma
-- assíncrona, não bloqueia o INSERT) para enviar o email de notificação.
-- Troque a URL abaixo se o Apps Script for reimplantado com outro link.
begin;

create extension if not exists pg_net;

create function crm_private.notificar_novo_lead() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  perform net.http_post(
    url := 'https://script.google.com/macros/s/AKfycbx9Gp6hVY8t9DinxcBK_f1SJ143np4Cx0aKlyzTPhe5AqXUJnulfKAYiSNbD7QvOOLo/exec?secret=h_vCYxgT-K-LtguqOzdc16O8mqDmaq-i',
    body := jsonb_build_object('type', 'INSERT', 'table', 'leads', 'record', to_jsonb(new)),
    headers := jsonb_build_object('Content-Type', 'application/json')
  );
  return new;
end;
$$;
revoke all on function crm_private.notificar_novo_lead() from public;

create trigger notificar_novo_lead
  after insert on public.leads
  for each row execute function crm_private.notificar_novo_lead();

commit;
