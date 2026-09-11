import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { PGlite } from '@electric-sql/pglite'

const root = new URL('../', import.meta.url)
const ids = ['00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000004']

for (const oldEvents of [false, true]) test(`Permissões com migração antiga de eventos: ${oldEvents}`, async t => {
  const db = new PGlite({ parsers: { 1184: value => value } })
  await db.exec(`
    create role anon; create role authenticated; create role service_role bypassrls;
    create schema auth;
    create table auth.users(id uuid primary key, email text, encrypted_password text);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    create function auth.email() returns text language sql stable as $$ select current_setting('request.jwt.claim.email', true) $$;
    grant usage on schema public, auth to anon, authenticated, service_role;
    grant execute on all functions in schema auth to anon, authenticated, service_role;
  `)
  await db.exec(await readFile(new URL('supabase-migration.sql', root), 'utf8'))
  if (oldEvents) await db.exec(await readFile(new URL('supabase-migration-eventos.sql', root), 'utf8'))
  await db.exec(`grant all on all tables in schema public to anon, authenticated, service_role`)
  await db.exec(await readFile(new URL('supabase-migration-permissoes.sql', root), 'utf8'))
  await db.exec(await readFile(new URL('supabase-migration-senha-temporaria.sql', root), 'utf8'))
  for (let i = 0; i < ids.length; i++) {
    await db.query('insert into auth.users(id,email) values ($1, $2)', [ids[i], `user${i}@test.invalid`])
    if (i < 3) await db.query('insert into public.perfis(id,nome,email,papel) values ($1,$2,$3,$4)', [ids[i], `Pessoa ${i}`, `user${i}@test.invalid`, i === 0 ? 'admin' : 'gestor'])
  }
  async function as(user) {
    await db.exec('reset role')
    await db.query("select set_config('request.jwt.claim.sub', $1, false), set_config('request.jwt.claim.email', $2, false)", [user == null ? '' : ids[user], user == null ? '' : `user${user}@test.invalid`])
    await db.exec(`set role ${user == null ? 'anon' : 'authenticated'}`)
  }
  const rows = async (sql, params = []) => (await db.query(sql, params)).rows
  let lead
  let version
  await t.test('Visitante só cria Novo sem dono; não lê nem altera', async () => {
    await as(null)
    await db.query("insert into leads(nome,email) values ('Lead teste','lead@test.invalid')")
    assert.equal((await rows('select * from leads')).length, 0)
    assert.equal((await rows("update leads set nome = 'Inválido' returning id")).length, 0)
    await assert.rejects(db.query("insert into leads(nome,email,estado) values ('X','x@test.invalid','Ganho')"))
    await assert.rejects(db.query("insert into leads(nome,email,atribuido_a) values ('X','x@test.invalid',$1)", [ids[1]]))
    await assert.rejects(db.query('select * from perfis'))
    await assert.rejects(db.query('select * from eventos_leads'))
  })
  await t.test('Fila comum visível aos gestores; exige assumir antes de escrever', async () => {
    await as(1)
    ;[lead] = await rows('select * from leads')
    assert.ok(lead)
    await assert.rejects(db.query("update leads set nome='Não permitido' where id=$1", [lead.id]))
    await assert.rejects(db.query("insert into notas(lead_id,corpo) values ($1,'X')", [lead.id]))
    await assert.rejects(db.query("insert into whatsapp_mensagens(lead_id,direcao,corpo) values ($1,'saida','X')", [lead.id]))
    await assert.rejects(db.query('update leads set atribuido_a=$1 where id=$2', [ids[1], lead.id]))
    await assert.rejects(db.query("update leads set estado='Contactado',nome='Troca' where id=$1", [lead.id]))
    await as(2)
    assert.equal((await rows('select * from leads')).length, 1)
  })
  await t.test('Primeiro gestor assume e tentativa concorrente obsoleta falha', async () => {
    await as(1)
    const [claimed] = await rows("select * from public.mudar_estado_lead($1,'Contactado',$2)", [lead.id, lead.atualizado_em])
    assert.equal(claimed.atribuido_a, ids[1])
    version = claimed.atualizado_em
    await as(2)
    await assert.rejects(db.query("select public.mudar_estado_lead($1,'Contactado',$2)", [lead.id, lead.atualizado_em]))
    assert.equal((await rows('select * from leads')).length, 0)
    assert.equal((await rows("update leads set estado='Ganho' where id=$1 returning id", [lead.id])).length, 0)
    await assert.rejects(db.query("select public.atribuir_lead($1,$2,$3)", [lead.id, ids[2], version]))
  })
  await t.test('Notas e conversas privadas; gestores não apagam nem forjam auditoria', async () => {
    await as(1)
    await db.query("insert into notas(lead_id,corpo) values ($1,'Privado')", [lead.id])
    await db.query("insert into whatsapp_mensagens(lead_id,direcao,corpo) values ($1,'saida','Privado')", [lead.id])
    assert.equal((await rows('select * from notas')).length, 1)
    assert.equal((await rows('delete from leads returning id')).length, 0)
    await assert.rejects(db.query("insert into eventos_leads(acao) values ('apagado')"))
    assert.equal((await rows('select * from eventos_leads')).length, 0)
    await as(2)
    assert.equal((await rows('select * from notas')).length, 0)
    assert.equal((await rows('select * from whatsapp_mensagens')).length, 0)
    await assert.rejects(db.query("insert into notas(lead_id,corpo) values ($1,'Invasão')", [lead.id]))
  })
  await t.test('Retornar a Novo mantém dono; admin reatribui e devolve à fila', async () => {
    await as(1)
    await db.query("update leads set estado='Novo' where id=$1", [lead.id])
    assert.equal((await rows('select * from leads'))[0].atribuido_a, ids[1])
    await as(0)
    const [current] = await rows('select * from leads')
    await db.query('select public.atribuir_lead($1,$2,$3)', [lead.id, ids[2], current.atualizado_em])
    await as(1)
    assert.equal((await rows('select * from leads')).length, 0)
    await as(2)
    assert.equal((await rows('select * from notas')).length, 1)
    await as(0)
    const [assigned] = await rows('select * from leads')
    await db.query('select public.atribuir_lead($1,null,$2)', [lead.id, assigned.atualizado_em])
    const [returned] = await rows('select * from leads')
    assert.equal(returned.atribuido_a, null)
    assert.equal(returned.estado, 'Novo')
    assert.equal(returned.atribuido_em, null)
    await assert.rejects(db.query("update leads set estado='Contactado' where id=$1", [lead.id]))
  })
  await t.test('Sem perfil, conta desativada e tentativas de escalada são bloqueados', async () => {
    await as(3)
    assert.equal((await rows('select * from leads')).length, 0)
    await as(1)
    await assert.rejects(db.query("update perfis set papel='admin' where id=$1", [ids[1]]))
    await assert.rejects(db.query("select public.alterar_perfil($1,'X','admin',true)", [ids[1]]))
    await as(0)
    await db.query("select public.alterar_perfil($1,'Gestor','gestor',false)", [ids[1]])
    await as(1)
    assert.equal((await rows('select * from leads')).length, 0)
    assert.equal((await rows('select * from notas')).length, 0)
    assert.equal((await rows('select * from whatsapp_mensagens')).length, 0)
  })
  await t.test('Senha temporária bloqueia acesso até alteração real no Auth', async () => {
    await db.exec('reset role')
    await db.query("update auth.users set encrypted_password='hash-temporario' where id=$1", [ids[2]])
    await db.query('update perfis set exigir_troca_senha=true where id=$1', [ids[2]])
    await as(2)
    assert.equal((await rows('select * from leads')).length, 0)
    assert.equal((await rows('select * from perfis where id=$1', [ids[2]]))[0].exigir_troca_senha, true)
    await assert.rejects(db.query('update perfis set exigir_troca_senha=false where id=$1', [ids[2]]))
    await db.exec('reset role')
    await db.query("update auth.users set encrypted_password=encrypted_password where id=$1", [ids[2]])
    assert.equal((await rows('select * from perfis where id=$1', [ids[2]]))[0].exigir_troca_senha, true)
    await db.query("update auth.users set encrypted_password='hash-pessoal-novo' where id=$1", [ids[2]])
    await as(2)
    assert.equal((await rows('select * from leads')).length, 1)
    assert.equal((await rows('select * from perfis where id=$1', [ids[2]]))[0].exigir_troca_senha, false)
  })
  await t.test('Último administrador é preservado', async () => {
    await as(0)
    await assert.rejects(db.query("select public.alterar_perfil($1,'Admin','gestor',true)", [ids[0]]))
    await assert.rejects(db.query("select public.alterar_perfil($1,'Admin','admin',false)", [ids[0]]))
  })
  await t.test('Falha de auditoria impede a exclusão do lead', async () => {
    await db.exec('reset role')
    await db.exec("alter table eventos_leads add constraint teste_falha_auditoria check (acao <> 'apagado')")
    await as(0)
    await assert.rejects(db.query('delete from leads where id=$1', [lead.id]))
    assert.equal((await rows('select * from leads where id=$1', [lead.id])).length, 1)
    await db.exec('reset role')
    await db.exec('alter table eventos_leads drop constraint teste_falha_auditoria')
  })
  await t.test('Exclusão auditada de forma atómica com snapshot e autor', async () => {
    await as(0)
    await db.query('delete from leads where id=$1', [lead.id])
    const events = await rows('select * from eventos_leads order by criado_em')
    assert.deepEqual(events.map(e => e.acao), ['atribuido', 'reatribuido', 'devolvido', 'apagado'])
    assert.equal(events.at(-1).realizado_por, ids[0])
    assert.equal(events.at(-1).lead_nome, 'Lead teste')
    assert.equal((await rows('select * from notas')).length, 0)
    await assert.rejects(db.query('delete from eventos_leads'))
    await assert.rejects(db.query("update eventos_leads set lead_nome='Fraude'"))
  })
  await db.close()
})
