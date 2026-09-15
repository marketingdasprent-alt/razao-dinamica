# Autenticação de razaodinamica.pt no Brevo

Registros obtidos da conta Brevo da RD. Ainda não aplicados ao DNS.

DNS autoritativo identificado: Cloudflare (`alla.ns.cloudflare.com` e `theo.ns.cloudflare.com`). As alterações devem ser feitas na zona ativa da Cloudflare, mesmo que o domínio/email tenha sido contratado na Domínios.pt. Configurar os CNAMEs DKIM como DNS only (sem proxy).

| Tipo | Nome | Valor |
| --- | --- | --- |
| TXT | @ | brevo-code:3f8f5d1892cfe5ad6ebf4a6debe86aa6 |
| CNAME | brevo1._domainkey | b1.razaodinamica-pt.dkim.brevo.com |
| CNAME | brevo2._domainkey | b2.razaodinamica-pt.dkim.brevo.com |

O DNS público já contém `_dmarc` TXT `v=DMARC1; p=none;`. Preservar esse registro; não criar DMARC duplicado. O Brevo sugere acrescentar `rua=mailto:rua@dmarc.brevo.com`, o que encaminharia relatórios agregados ao serviço. Essa alteração não foi aplicada e deve ser avaliada separadamente caso necessária.

Consulta pública: os dois nomes DKIM acima ainda não existiam. MX existente: `_dc-mx.88063ec0f1b1.razaodinamica.pt`, prioridade 0. Não alterar MX, A, AAAA, nameservers ou SPF para executar estes três registros de autenticação. Conferir a zona completa antes de gravar.

Depois de adicionar os registros, verificar propagação e concluir a autenticação no Brevo. Ainda será necessário configurar o remetente, SMTP no Supabase e cumprir a verificação de telefone solicitada pelo Brevo. Nenhum email foi enviado nesta preparação.
