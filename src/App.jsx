import { useState, useEffect } from 'react'
import './App.css'
import LegalPage from './LegalPage'

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [animate, setAnimate] = useState(false)
  const [route, setRoute] = useState(typeof window !== 'undefined' ? window.location.hash : '')

  useEffect(() => {
    setAnimate(true)
    const onHashChange = () => {
      setRoute(window.location.hash)
      window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' })
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  if (route === '#privacidade' || route === '#politica-de-privacidade') {
    return <LegalPage />
  }

  return (
    <div className="app">
      {/* ==================== NAVBAR ==================== */}
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-logo">
            <img src="/logowbg.png" alt="Razão Dinâmica" className="navbar-logo-img" />
            <div className="navbar-logo-text-wrapper">
              <span className="navbar-logo-text">Razão Dinâmica</span>
              <span className="navbar-logo-subtitle">CONTABILIDADE E CONSULTORIA</span>
            </div>
          </div>

          <button
            className={`mobile-menu-btn ${mobileMenuOpen ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <ul className={`navbar-menu ${mobileMenuOpen ? 'active' : ''}`}>
            <li><a href="#inicio" className="active">Início</a></li>
            <li><a href="#servicos">Serviços</a></li>
            <li><a href="#sobre">Sobre</a></li>
            <li><a href="#contato">Contato</a></li>
          </ul>
        </div>
      </nav>

      {/* ==================== HERO SECTION ==================== */}
      <section className="hero" id="inicio">
        <div className="hero-arrows" aria-hidden="true">
          <svg viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMaxYMid slice">
            <defs>
              <linearGradient id="arrowGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="rgba(196,167,71,0)" />
                <stop offset="100%" stopColor="rgba(196,167,71,0.35)" />
              </linearGradient>
            </defs>
            <path d="M180 760 L180 200 L120 260 M180 200 L240 260" stroke="url(#arrowGrad)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M320 760 L320 120 L260 180 M320 120 L380 180" stroke="url(#arrowGrad)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
            <path d="M460 760 L460 60 L400 120 M460 60 L520 120" stroke="url(#arrowGrad)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
          </svg>
        </div>
        <div className="hero-content">
          <div className={`hero-text ${animate ? 'animate' : ''}`}>
            <div className="hero-brand">
              <img src="/logowbg.png" alt="Razão Dinâmica" className="hero-brand-icon" />
              <div className="hero-brand-text">
                <h1>Razão Dinâmica</h1>
                <span>CONTABILIDADE E CONSULTORIA</span>
              </div>
              <div className="hero-brand-divider"></div>
            </div>
            <h2 className="hero-under-construction">Estamos em Desenvolvimento</h2>
            <p className="hero-under-construction-subtitle">Mais conteúdo e funcionalidades chegando em breve</p>
          </div>
        </div>
      </section>

      {/* ==================== SERVICES SECTION ==================== */}
      <section className="services" id="servicos">
        <div className="section-container">
          <div className="section-header">
            <h2>Nossos Serviços</h2>
            <div className="accent-line"></div>
            <p>Soluções completas para a gestão financeira e tributária da sua empresa</p>
          </div>

          <div className="services-grid">
            {/* Service Card 1 */}
            <div className="service-card">
              <div className="service-icon"><i className="fas fa-chart-bar"></i></div>
              <h3>Contabilidade Geral</h3>
              <p>Gestão completa de registos contábeis, conformidade fiscal e relatórios financeiros.</p>
            </div>

            {/* Service Card 2 */}
            <div className="service-card">
              <div className="service-icon"><i className="fas fa-dollar-sign"></i></div>
              <h3>Consultoria Fiscal</h3>
              <p>Otimização fiscal e estratégias para minimizar a carga tributária do seu negócio.</p>
            </div>

            {/* Service Card 3 */}
            <div className="service-card">
              <div className="service-icon"><i className="fas fa-chart-line"></i></div>
              <h3>Análise Financeira</h3>
              <p>Diagnósticos profundos e recomendações estratégicas para crescimento sustentável.</p>
            </div>

            {/* Service Card 4 */}
            <div className="service-card">
              <div className="service-icon"><i className="fas fa-scale-balanced"></i></div>
              <h3>Consultoria Laboral</h3>
              <p>Orientação em questões trabalhistas, folhas de pagamento e conformidade legal.</p>
            </div>

            {/* Service Card 5 */}
            <div className="service-card">
              <div className="service-icon"><i className="fas fa-magnifying-glass"></i></div>
              <h3>Auditoria</h3>
              <p>Avaliações independentes para garantir a integridade dos processos financeiros.</p>
            </div>

            {/* Service Card 6 */}
            <div className="service-card">
              <div className="service-icon"><i className="fas fa-rocket"></i></div>
              <h3>Transformação Digital</h3>
              <p>Implementação de sistemas modernos para melhorar eficiência e automação.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== FEATURES SECTION ==================== */}
      <section className="features" id="sobre">
        <div className="section-container">
          <div className="section-header">
            <h2>Por Que Nos Escolher</h2>
            <div className="accent-line"></div>
          </div>

          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-number">01</div>
              <h3>Experiência</h3>
              <p>Mais de duas décadas de experiência em contabilidade e consultoria empresarial.</p>
            </div>

            <div className="feature-item">
              <div className="feature-number">02</div>
              <h3>Expertise</h3>
              <p>Equipa de profissionais certificados e sempre atualizados com as legislações.</p>
            </div>

            <div className="feature-item">
              <div className="feature-number">03</div>
              <h3>Tecnologia</h3>
              <p>Ferramentas digitais avançadas para maior segurança e agilidade nos processos.</p>
            </div>

            <div className="feature-item">
              <div className="feature-number">04</div>
              <h3>Personalização</h3>
              <p>Soluções adaptadas às necessidades específicas do seu negócio e setor.</p>
            </div>
          </div>
        </div>
      </section>

    
      {/* ==================== CTA SECTION ==================== */}
      <section className="cta-section" id="contato">
        <div className="section-container">
          <div className="cta-content">
            <h2>Pronto para Transformar Sua Gestão Financeira?</h2>
            <p>Fale connosco e descubra como podemos ajudar o seu negócio a crescer</p>
            <a href="mailto:geral@razaodinamica.pt" className="cta-button-large">
              Enviar Email
            </a>
            <div className="contact-info-group">
              <p className="contact-info">
                <i className="fas fa-envelope"></i>
                <a href="mailto:geral@razaodinamica.pt">geral@razaodinamica.pt</a>
              </p>
              <p className="contact-info">
                <i className="fas fa-phone"></i>
                <a href="tel:+351919381551">919 381 551</a>
                <span className="contact-separator">|</span>
                <a href="tel:+351910205029">910 205 029</a>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer className="footer">
        <div className="section-container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>Razão Dinâmica</h3>
              <p>Contabilidade e Consultoria Estratégica</p>
            </div>

            <div className="footer-section">
              <h4>Navegação</h4>
              <ul>
                <li><a href="#inicio">Início</a></li>
                <li><a href="#servicos">Serviços</a></li>
                <li><a href="#sobre">Sobre</a></li>
                <li><a href="#contato">Contato</a></li>
              </ul>
            </div>

            <div className="footer-section">
              <h4>Contato</h4>
              <p><i className="fas fa-envelope footer-icon"></i> <a href="mailto:geral@razaodinamica.pt">geral@razaodinamica.pt</a></p>
              <p><i className="fas fa-phone footer-icon"></i> <a href="tel:+351919381551">919 381 551</a> <span className="contact-separator">|</span> <a href="tel:+351910205029">910 205 029</a></p>
              <p><i className="fas fa-clock footer-icon"></i> Seg-Sex, 09:00-18:00</p>
            </div>
          </div>

          <div className="footer-bottom">
            <p>&copy; 2026 Razão Dinâmica. Todos os direitos reservados.</p>
            <ul className="footer-legal">
              <li><a href="#privacidade">Política de Privacidade e Cookies</a></li>
              <li>
                <a
                  href="#cookies"
                  onClick={(e) => {
                    e.preventDefault()
                    if (typeof window !== 'undefined' && window.CookieScript) {
                      window.CookieScript.instance.show()
                    }
                  }}
                >
                  Gerir Cookies
                </a>
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
