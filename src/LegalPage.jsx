function LegalPage() {
  const openCookieSettings = (e) => {
    e.preventDefault()
    if (typeof window !== 'undefined' && typeof window.CookieScript !== 'undefined') {
      window.CookieScript.instance.show()
    }
  }

  return (
    <main className="privacy-page">
      <div className="privacy-container">
        <header className="privacy-header">
          <a href="#inicio" className="privacy-back">
            <i className="fas fa-arrow-left"></i> Voltar ao site
          </a>
          <h1>Política de Privacidade e Cookies</h1>
          <div className="accent-line"></div>
          <p className="privacy-updated">Última atualização: 19 de maio de 2026</p>
        </header>

        <section className="privacy-section">
          <h2>1. Introdução</h2>
          <p>
            A <strong>Razão Dinâmica - Contabilidade e Consultoria</strong> respeita a sua privacidade
            e está empenhada em proteger os seus dados pessoais. Esta Política de Privacidade
            explica como recolhemos, utilizamos, partilhamos e protegemos as suas informações
            quando visita o nosso website ou utiliza os nossos serviços.
          </p>
          <p>
            Esta política foi elaborada em conformidade com o Regulamento Geral sobre a Proteção
            de Dados (RGPD - Regulamento (UE) 2016/679) e a Lei n.º 58/2019 de 8 de agosto.
          </p>
        </section>

        <section className="privacy-section">
          <h2>2. Responsável pelo Tratamento</h2>
          <p>
            <strong>Razão Dinâmica - Contabilidade e Consultoria</strong><br />
            Email: <a href="mailto:geral@razaodinamica.pt">geral@razaodinamica.pt</a><br />
            Telefones: <a href="tel:+351919381551">919 381 551</a> | <a href="tel:+351910205029">910 205 029</a>
          </p>
        </section>

        <section className="privacy-section">
          <h2>3. Dados Recolhidos</h2>
          <p>Podemos recolher e tratar os seguintes tipos de dados:</p>
          <ul>
            <li><strong>Dados de contacto:</strong> nome, email, telefone, quando nos contacta;</li>
            <li><strong>Dados de navegação:</strong> endereço IP, tipo de browser, páginas visitadas, duração da visita;</li>
            <li><strong>Cookies e tecnologias semelhantes:</strong> ver secção 7 abaixo;</li>
            <li><strong>Dados profissionais:</strong> informações fornecidas no âmbito da prestação dos nossos serviços.</li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2>4. Finalidades do Tratamento</h2>
          <p>Os seus dados são tratados para as seguintes finalidades:</p>
          <ul>
            <li>Resposta a pedidos de informação e contacto;</li>
            <li>Prestação dos serviços de contabilidade e consultoria contratados;</li>
            <li>Cumprimento de obrigações legais e fiscais;</li>
            <li>Melhoria da experiência de navegação no website;</li>
            <li>Comunicações comerciais, mediante o seu consentimento.</li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2>5. Fundamentos Legais</h2>
          <p>Tratamos os seus dados com base nos seguintes fundamentos:</p>
          <ul>
            <li><strong>Consentimento</strong> (artigo 6.º, n.º 1, alínea a) do RGPD);</li>
            <li><strong>Execução de contrato</strong> (artigo 6.º, n.º 1, alínea b) do RGPD);</li>
            <li><strong>Obrigação legal</strong> (artigo 6.º, n.º 1, alínea c) do RGPD);</li>
            <li><strong>Interesse legítimo</strong> (artigo 6.º, n.º 1, alínea f) do RGPD).</li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2>6. Conservação dos Dados</h2>
          <p>
            Os dados pessoais são conservados pelo período necessário ao cumprimento das
            finalidades para as quais foram recolhidos, e em conformidade com os prazos legais
            aplicáveis (nomeadamente, 10 anos para documentação contabilística e fiscal).
          </p>
        </section>

        <section className="privacy-section">
          <h2>7. Política de Cookies</h2>
          <p>
            Utilizamos cookies e tecnologias semelhantes para melhorar a sua experiência de
            navegação, analisar o tráfego do website e personalizar conteúdos.
          </p>

          <h3>O que são cookies?</h3>
          <p>
            Cookies são pequenos ficheiros de texto armazenados no seu dispositivo quando visita
            um website. Permitem que o website reconheça o seu dispositivo e guarde informações
            sobre as suas preferências.
          </p>

          <h3>Tipos de cookies utilizados</h3>
          <ul>
            <li>
              <strong>Cookies estritamente necessários:</strong> essenciais para o funcionamento
              do website. Não requerem consentimento.
            </li>
            <li>
              <strong>Cookies de desempenho/analíticos:</strong> ajudam-nos a compreender como os
              visitantes interagem com o site, recolhendo informação de forma anónima.
            </li>
            <li>
              <strong>Cookies de funcionalidade:</strong> permitem ao website lembrar-se das suas
              escolhas e preferências.
            </li>
            <li>
              <strong>Cookies de marketing:</strong> utilizados para apresentar publicidade
              relevante (apenas com o seu consentimento).
            </li>
          </ul>

          <h3>Gestão de cookies</h3>
          <p>
            Pode gerir as suas preferências de cookies a qualquer momento através do nosso
            painel de definições ou diretamente nas configurações do seu navegador.
          </p>
          <button onClick={openCookieSettings} className="cookie-settings-btn">
            <i className="fas fa-cookie-bite"></i> Gerir Preferências de Cookies
          </button>
        </section>

        <section className="privacy-section">
          <h2>8. Partilha de Dados com Terceiros</h2>
          <p>
            Não vendemos os seus dados pessoais. Podemos partilhar dados com:
          </p>
          <ul>
            <li>Autoridades fiscais e administrativas, quando exigido por lei;</li>
            <li>Prestadores de serviços técnicos (alojamento, analítica web) sujeitos a contratos de confidencialidade;</li>
            <li>Entidades parceiras estritamente no âmbito da prestação dos nossos serviços.</li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2>9. Os Seus Direitos</h2>
          <p>Enquanto titular dos dados, tem os seguintes direitos:</p>
          <ul>
            <li>Direito de acesso aos seus dados;</li>
            <li>Direito de retificação;</li>
            <li>Direito ao apagamento ("direito a ser esquecido");</li>
            <li>Direito à limitação do tratamento;</li>
            <li>Direito à portabilidade dos dados;</li>
            <li>Direito de oposição;</li>
            <li>Direito de retirar o consentimento a qualquer momento;</li>
            <li>Direito de apresentar reclamação à <strong>Comissão Nacional de Proteção de Dados (CNPD)</strong>.</li>
          </ul>
          <p>
            Para exercer estes direitos, contacte-nos através de{' '}
            <a href="mailto:geral@razaodinamica.pt">geral@razaodinamica.pt</a>.
          </p>
        </section>

        <section className="privacy-section">
          <h2>10. Segurança</h2>
          <p>
            Adotamos medidas técnicas e organizativas adequadas para proteger os seus dados
            contra acesso não autorizado, perda, destruição ou alteração.
          </p>
        </section>

        <section className="privacy-section">
          <h2>11. Alterações à Política</h2>
          <p>
            Esta Política de Privacidade pode ser atualizada periodicamente. As alterações
            serão publicadas nesta página com a respetiva data de atualização.
          </p>
        </section>

        <section className="privacy-section">
          <h2>12. Contacto</h2>
          <p>
            Para quaisquer questões relativas à proteção de dados, contacte-nos:
          </p>
          <p>
            <i className="fas fa-envelope"></i>{' '}
            <a href="mailto:geral@razaodinamica.pt">geral@razaodinamica.pt</a><br />
            <i className="fas fa-phone"></i>{' '}
            <a href="tel:+351919381551">919 381 551</a> |{' '}
            <a href="tel:+351910205029">910 205 029</a>
          </p>
        </section>

        <div className="privacy-footer-nav">
          <a href="#inicio" className="cta-button-large">
            <i className="fas fa-arrow-left"></i> Voltar ao Início
          </a>
        </div>
      </div>
    </main>
  )
}

export default LegalPage
