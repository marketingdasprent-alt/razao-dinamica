# Criação direta de contas

Este fluxo substitui os convites por email por decisão do utilizador. Brevo, SMTP e mudanças de DNS não são necessários para criar contas do CRM. Não foram aplicadas mudanças DNS nem enviado qualquer convite.

O administrador abre Utilizadores e informa nome, email, perfil e uma senha temporária com pelo menos 12 caracteres (máximo 72 bytes). Entrega os dados por um canal privado. A conta é criada diretamente no Supabase Auth e o email é confirmado administrativamente, sem mensagem de confirmação. Conferir o destinatário antes de entregar os dados.

No primeiro login, o CRM solicita uma nova senha. Enquanto a troca está pendente, as políticas do banco bloqueiam o acesso aos leads, notas, mensagens e funções administrativas. Alterações em metadata do utilizador não removem esse bloqueio. O banco libera o perfil após uma alteração da credencial em auth.users.

A senha temporária não é gravada na tabela de perfis, devolvida pela API ou registrada em logs. O administrador deve guardá-la apenas pelo tempo necessário à entrega. A senha pessoal é definida pelo próprio utilizador.

## Ativação e validação

- `supabase-migration-senha-temporaria.sql` aplicada no Supabase desta conta, com resultado Success. Não repetir.
- 31 testes passaram, além da verificação de tipos e compilação. Testes de banco verificam o bloqueio, a impossibilidade de remover o indicador diretamente e a liberação após alteração de senha; o endpoint usa Auth simulado nos testes.
- Falta preencher `SUPABASE_SERVICE_ROLE_KEY` no arquivo local `crm/.env.local` e reiniciar o servidor. O arquivo é ignorado pelo Git. A chave também será necessária no ambiente servidor da Vercel quando a aplicação for publicada.
- A criação e a troca de senha em uma conta real ainda precisam ser verificadas após configurar essa chave. Nenhuma conta de teste foi criada em produção.

Contas existentes permanecem com o acesso anterior. Novas contas recebem `exigir_troca_senha=true`. Não usar o antigo fluxo de convites. Recuperação de senha esquecida continua sendo uma operação administrativa separada; não há redefinição de senha pelo painel nesta entrega.

Referência: [criação administrativa no Supabase](https://supabase.com/docs/reference/javascript/auth-admin-createuser).
