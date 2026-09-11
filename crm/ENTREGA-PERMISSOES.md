# Utilizadores e distribuição de leads

**Fluxo atual:** criação direta com senha temporária, substituindo convites por email. Consulte `CONTAS-SENHA-TEMPORARIA.md`. As instruções sobre Brevo e SMTP abaixo são histórico da abordagem anterior.

Implementação local em 11/09/2026. Aplicação ainda não publicada. O utilizador confirmou a execução da migração e do bootstrap e o acesso administrativo.

Configuração remota atualizada nesta tarefa: cadastro público desativado em Sign In / Providers; adicionado o redirecionamento exato `http://localhost:5175/definir-palavra-passe`. O Site URL existente permanece `http://localhost:3000`, a rever quando o domínio publicado do CRM for confirmado. SMTP personalizado está desativado; aguarda identificação do serviço de envio da empresa. A chave administrativa local ainda precisa ser preenchida em `.env.local`. Nenhum convite real foi enviado.

Atualização da ativação: o utilizador informou que executou os scripts e confirmou o acesso administrativo. O servidor local agora executa `/api/utilizadores` pelo mesmo handler da Vercel. Foram aprovados 29 testes e a verificação de tipos. Falta configurar a chave administrativa em `crm/.env.local` (ignorado pelo Git), desativar signup e configurar redirecionamento/SMTP. A consulta pública ao Auth confirmou `disable_signup=false` antes dessa configuração.

Para desenvolvimento local, preencher `SUPABASE_SERVICE_ROLE_KEY` em `.env.local` e reiniciar o servidor. Em Supabase Auth > URL Configuration, permitir `http://localhost:5175/definir-palavra-passe` para o teste local. Para convites de utilizadores noutras máquinas, usar o domínio publicado do CRM; localhost aponta sempre para a máquina de quem abre o link. O envio de convites exige SMTP configurado para destinatários fora da equipa do projeto, conforme a [documentação do Supabase](https://supabase.com/docs/guides/auth/auth-smtp).

## O que foi entregue

- Login sem criação pública de contas, painel administrativo de utilizadores e página para definir palavra-passe a partir do convite.
- Perfis admin/gestor ativos; contas sem perfil ou desativadas ficam sem acesso aos dados, mesmo com JWT válido.
- Fila comum de leads em Novo. Um gestor assume automaticamente ao mudar o estado. Apenas o dono e os administradores veem os leads atribuídos, notas e conversas.
- Gestor assume antes de editar detalhes, notas ou mensagens. Apenas o administrador apaga e reatribui leads. Voltar a Novo mantém o dono; devolver à fila é uma ação administrativa separada.
- Operações de estado e atribuição verificam a versão do lead e bloqueiam a linha no banco. Chamadas REST diretas também passam pelas regras de proteção.
- Auditoria de atribuição, reatribuição, devolução e exclusão na mesma transação, com consulta exclusiva do administrador.
- Atualização periódica e ao regressar à janela para remover da interface leads que deixaram de estar acessíveis. O banco bloqueia novos pedidos imediatamente; a interface atualiza em até 15 segundos. Perfis são revistos em até 30 segundos.

## Origem e preservação

A pasta atual recebeu uma cópia dos arquivos do repositório `C:\Users\Pichau\Documents\GitHub\razao-dinamica`, incluindo alterações ainda não commitadas. A origem não foi editada. O histórico Git não foi copiado; esta pasta tinha um repositório vazio. O site institucional e os seus formulários foram preservados.

`supabase-migration-permissoes.sql` substitui as políticas permissivas antigas. Funciona com ou sem a migração antiga de eventos já aplicada. Não voltar a executar a migração antiga de eventos depois desta.

## Ativação coordenada

1. Confirmar o ambiente Supabase/Vercel correto, guardar backup e testar primeiro num projeto de teste separado. Não publicar apenas a interface: ela exige a nova estrutura do banco.
2. No Supabase Auth, desligar **Allow new users to sign up**. Manter o login por email ativo. Retirar o botão do CRM, por si só, não bloqueia pedidos de cadastro direto.
3. Rever o schema real e executar `supabase-migration-permissoes.sql` uma vez. Num banco vazio, executar primeiro `supabase-migration.sql`.
4. Em Authentication > Users, verificar a conta `geral@razaodinamica.pt`, copiar o UUID e preencher o marcador em `supabase-bootstrap-admin.sql`. Executar esse arquivo. Nenhuma conta desconhecida recebe acesso automaticamente.
5. Configurar somente no servidor Vercel do CRM as variáveis de `.env.server.example`. A chave administrativa nunca deve estar em variáveis `VITE_*`, no navegador, em logs, mensagens ou commits. As duas variáveis públicas existentes do CRM continuam necessárias.
6. Configurar o URL do CRM e permitir o redirecionamento `/definir-palavra-passe` no Supabase. Validar SMTP e o envio de convites. O endpoint usa `inviteUserByEmail` e a página usa `updateUser` para a definição de palavra-passe.
7. Publicar a aplicação com Root Directory `crm` no projeto Vercel próprio do CRM. O caminho `/api/utilizadores` deve resolver para a função, nunca para `index.html`. Confirmar em Preview antes do ambiente de produção.
8. Entrar como administrador, rever leads antigos fora de Novo que ficaram sem dono e atribuí-los explicitamente. Rever utilizadores antigos sem perfil. Não deduzir responsáveis a partir do email ou do estado.
9. Validar com duas contas de gestor, incluindo disputa realmente simultânea pelo mesmo lead, desativação de sessão existente e pedidos REST diretos. Testar também o formulário público do site e o convite de ponta a ponta.

Em caso de falha, preservar as políticas restritivas. Não restaurar políticas de acesso total para recuperar a interface. A migração é transacional; se uma instrução falhar antes do commit, nenhuma das suas alterações deve persistir.

## Falha parcial de convite

Se o email foi enviado mas o perfil não foi criado, o endpoint devolve erro e não apaga a conta Auth. A conta sem perfil permanece bloqueada. O responsável técnico deve verificar a conta no Auth pelo UUID, conferir se já existe perfil e só então criar o perfil desejado no SQL Editor. Não promover pela metadata do utilizador. Convite para conta já existente retorna conflito; recuperação/reenvio pode ser feita pelas ferramentas administrativas do Supabase após verificar a identidade.

## Validação local e limites

Comandos: `npm ci`, `npm run typecheck`, `npm test`, `npm run build`, dentro de `crm`.

Resultado desta entrega: verificação de tipos e compilação concluídas, 26 testes aprovados. Revisão visual com dados fictícios cobriu login, painel de utilizadores, bloqueio da rota administrativa para gestor, atribuição pelo seletor de estado, campos bloqueados/desbloqueados, kanban, lista e chat; foram observados layouts de computador e telemóvel. A compilação mantém um aviso de tamanho do pacote JavaScript, sem impedir a geração do site.

Os testes de banco usam PostgreSQL incorporado (PGlite), com papéis anon/authenticated e funções Auth de teste. Cobrem RLS, atribuição, tentativa com versão obsoleta, notas/chats, contas desativadas, escalada de privilégios, último administrador e auditoria. Não substituem o ensaio com ligações concorrentes reais no Supabase. Os testes do endpoint usam um cliente simulado e verificam autenticação, autorização, entradas, origem, duplicação e falhas parciais.

A revisão visual usa apenas dados fictícios: `node tests/preview.mjs`, seguido de Vite na porta 5187 com `VITE_SUPABASE_URL=http://127.0.0.1:54329` e `VITE_SUPABASE_PUBLISHABLE_KEY=preview-public-key`. Login fictício: `admin@example.test` ou `gestor@example.test`, com qualquer palavra-passe de seis ou mais caracteres. Este servidor é apenas uma ferramenta de revisão visual, sem envio de email ou ligação ao Supabase; não o publicar.

Não foram testados em produção: entrega real de email, desativação de signup, deploy da função Vercel e migração no Supabase remoto. Não existe uma conexão administrativa Supabase disponível nas ferramentas desta tarefa. A credencial administrativa permanece por configurar no servidor.

## Referências

- [Convites administrativos](https://supabase.com/docs/reference/javascript/auth-admin-inviteuserbyemail)
- [Configuração de autenticação](https://supabase.com/docs/guides/auth/general-configuration)
- [Palavras-passe e redirecionamentos](https://supabase.com/docs/guides/auth/passwords)
