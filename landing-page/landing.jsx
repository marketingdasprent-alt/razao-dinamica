import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '../css/landing.css';
import logoUrl from '../assets/images/logo-razao-dinamica-branca.png';
import problemImageUrl from '../assets/images/consultoria-cliente.jpg';
import problemImage600 from '../assets/images/consultoria-cliente-600.webp';
import problemImage900 from '../assets/images/consultoria-cliente-900.webp';
import teamImageUrl from '../assets/images/equipa-reuniao.jpg';
import teamImage600 from '../assets/images/equipa-reuniao-600.webp';
import teamImage900 from '../assets/images/equipa-reuniao-900.webp';
import officeImageUrl from '../assets/images/equipa-razao-dinamica.jpg';
import officeImage600 from '../assets/images/equipa-razao-dinamica-600.webp';
import officeImage900 from '../assets/images/equipa-razao-dinamica-900.webp';

// Image replacement slots requested for final campaign photography:
// /images/landing/hero-razao-dinamica.jpg
// /images/landing/problem-financial-control.jpg
// /images/landing/team-razao-dinamica.jpg
// /images/landing/office-razao-dinamica.jpg

const services = [
  ['01', 'Contabilidade', 'Organização contabilística rigorosa para acompanhar a evolução do negócio com informação clara.'],
  ['02', 'Fiscalidade', 'Cumprimento fiscal e antecipação de riscos para reduzir surpresas e decisões em cima do prazo.'],
  ['03', 'Consultoria de Gestão', 'Leitura dos números para apoiar decisões sobre custos, margem, crescimento e rentabilidade.'],
  ['04', 'Planeamento Financeiro', 'Projeções e acompanhamento para preparar necessidades de tesouraria e decisões de investimento.'],
  ['05', 'Auditoria Interna', 'Revisão de processos e controlos para identificar fragilidades e melhorar a qualidade da informação.'],
  ['06', 'Apoio à Gestão Empresarial', 'Acompanhamento próximo para transformar dados financeiros em prioridades práticas de gestão.']
];

const problems = [
  'A contabilidade só chega quando o problema já aconteceu.',
  'Falta clareza sobre custos, impostos e margem.',
  'As decisões dependem mais de sensação do que de dados.',
  'As obrigações fiscais geram stress e risco desnecessários.',
  'A empresa cresceu, mas o controlo financeiro não acompanhou.',
  'O contabilista atual é distante ou apenas reativo.'
];

const benefits = [
  'Maior controlo financeiro', 'Organização contabilística', 'Menos risco fiscal',
  'Acompanhamento próximo', 'Decisões mais fundamentadas', 'Visão clara da saúde financeira',
  'Preparação para crescer', 'Mais tempo para o negócio'
];

const faqs = [
  ['Quando faz sentido mudar de contabilista?', 'Quando falta proximidade, clareza ou capacidade de antecipação. A mudança pode ser preparada com método para assegurar continuidade e reduzir impacto na operação.'],
  ['A Razão Dinâmica trabalha com empresas de que dimensão?', 'Acompanhamos empresas em diferentes fases, com especial atenção às necessidades concretas, à complexidade da operação e aos objetivos da gestão.'],
  ['É possível receber apoio fiscal e de gestão além da contabilidade?', 'Sim. A contabilidade pode ser articulada com fiscalidade, planeamento financeiro, auditoria interna e consultoria de gestão.'],
  ['Como funciona o primeiro contacto?', 'Começamos por compreender o contexto, as prioridades e os principais desafios da empresa. Depois indicamos o enquadramento de acompanhamento mais adequado.'],
  ['Podem ajudar a organizar processos contabilísticos já existentes?', 'Sim. Analisamos a situação atual, identificamos pontos críticos e definimos uma transição organizada, com prioridades claras.']
];

function Nav(){
  return <nav id="mainNav" aria-label="Navegação principal">
    <div className="wrap">
      <a className="logo header-logo" href="#top" aria-label="Razão Dinâmica, início"><img src={logoUrl} width="1433" height="461" alt="Razão Dinâmica, Consultoria e Contabilidade" /></a>
      <div className="navlinks" id="mobileNavPanel">
        <a href="#abordagem">Abordagem</a><a href="#servicos">Serviços</a><a href="#faq">FAQ</a><a href="#contacto" className="cta">Marcar reunião</a>
      </div>
      <button className="burger" id="burgerBtn" type="button" aria-label="Abrir menu" aria-expanded="false" aria-controls="mobileNavPanel"><span></span><span></span><span></span></button>
    </div>
  </nav>;
}

function Footer(){
  return <footer id="rodape" className="footer-compact">
    <div className="footer-accent" aria-hidden="true"></div>
    <div className="wrap">
      <div className="footer-main">
        <a className="footer-logo" href="#top" aria-label="Razão Dinâmica, início"><img src={logoUrl} width="1433" height="461" alt="Razão Dinâmica, Consultoria e Contabilidade" loading="lazy" decoding="async" /></a>
        <p>A razão certa entre rigor contabilístico e visão de negócio.</p>
        <nav className="footer-nav" aria-label="Navegação do rodapé"><a href="#abordagem">Abordagem</a><a href="#servicos">Serviços</a><a href="#faq">FAQ</a><a href="#contacto">Contacto</a><a href="https://www.instagram.com/razaodinamica/" target="_blank" rel="noreferrer">Instagram</a><a href="https://www.facebook.com/profile.php?id=61593083117317" target="_blank" rel="noreferrer">Facebook</a></nav>
        <div className="footer-contact"><a href="mailto:geral@razaodinamica.pt">geral@razaodinamica.pt</a><a href="tel:+351919381551">+351 919 381 551</a><a href="tel:+351910205029">+351 910 205 029</a></div>
      </div>
      <div className="foot-bottom"><span>© 2026 Razão Dinâmica · Consultoria e Contabilidade</span></div>
      <nav className="legal-links" aria-label="Informação legal"><a href="../privacidade.html">Política de Privacidade</a><a href="../cookies.html">Política de Cookies</a><a href="../informacao-legal.html">Informação legal</a><a href="https://www.livroreclamacoes.pt/Inicio/" target="_blank" rel="noreferrer">Livro de Reclamações Eletrónico</a><button className="cookie-settings-link" type="button" data-cookie-settings>Gerir cookies</button></nav>
    </div>
  </footer>;
}

function Consent(){
  return <>
    <section className="cookie-banner" id="cookieBanner" aria-labelledby="cookieBannerTitle" aria-describedby="cookieBannerDescription" hidden>
      <div className="cookie-banner-copy"><span className="mono">PRIVACIDADE E COOKIES</span><h2 id="cookieBannerTitle">Privacidade e cookies</h2><p id="cookieBannerDescription">Utilizamos cookies necessários e, com o seu consentimento, tecnologias de marketing para medir campanhas através do Meta Pixel. Consulte a nossa <a href="../cookies.html">Política de Cookies</a>.</p></div>
      <div className="cookie-banner-actions"><button className="cookie-action cookie-accept" type="button" data-cookie-accept>Aceitar todos</button><button className="cookie-action" type="button" data-cookie-reject>Recusar não essenciais</button><button className="cookie-action cookie-manage" type="button" data-cookie-manage>Gerir preferências</button></div>
    </section>
    <div className="cookie-preferences" id="cookiePreferences" hidden>
      <div className="cookie-preferences-backdrop" data-cookie-close></div>
      <section className="cookie-preferences-panel" role="dialog" aria-modal="true" aria-labelledby="cookiePreferencesTitle" aria-describedby="cookiePreferencesDescription">
        <button className="cookie-preferences-close" type="button" data-cookie-close aria-label="Fechar preferências">×</button><span className="mono">PREFERÊNCIAS DE COOKIES</span><h2 id="cookiePreferencesTitle">Escolha como podemos utilizar cookies.</h2><p id="cookiePreferencesDescription">Pode alterar esta decisão a qualquer momento através de “Gerir cookies” no rodapé.</p>
        <div className="cookie-category"><div><h3>Necessários</h3><p>Asseguram funções essenciais do site e guardam a sua preferência.</p></div><label className="cookie-switch"><input type="checkbox" checked disabled readOnly /><span>Sempre ativos</span></label></div>
        <div className="cookie-category"><div><h3>Marketing</h3><p>Permite ativar o Meta Pixel para medir campanhas e conversões.</p></div><label className="cookie-switch"><input type="checkbox" id="marketingConsent" /><span>Permitir marketing</span></label></div>
        <div className="cookie-preferences-actions"><button className="cookie-action cookie-accept" type="button" data-cookie-save>Guardar preferências</button><a href="../cookies.html">Consultar Política de Cookies</a></div>
      </section>
    </div>
  </>;
}

function LeadForm(){
  return <form className="contact-form reveal" id="leadForm" action="https://script.google.com/macros/s/AKfycbx9Gp6hVY8t9DinxcBK_f1SJ143np4Cx0aKlyzTPhe5AqXUJnulfKAYiSNbD7QvOOLo/exec" method="post">
    <div className="form-grid">
      <label><span>Nome *</span><input type="text" name="nome" autoComplete="given-name" required /></label>
      <label><span>Apelido *</span><input type="text" name="apelido" autoComplete="family-name" required /></label>
      <label className="form-wide"><span>Empresa</span><input type="text" name="empresa" autoComplete="organization" /></label>
      <label className="form-wide"><span>Email *</span><input type="email" name="email" autoComplete="email" required /></label>
      <label className="form-wide phone-field"><span>Telefone</span><input type="tel" id="phone" name="telefone" autoComplete="tel" inputMode="tel" aria-label="Número de telefone com indicativo internacional" /><input type="hidden" name="ddi" value="+351" readOnly /></label>
      <label className="form-wide"><span>Serviço de interesse</span><select name="servico" id="serviceSelect"><option value="">Selecione uma opção</option>{services.map((service) => <option key={service[1]}>{service[1]}</option>)}</select></label>
      <label className="form-wide"><span>Mensagem / principal desafio</span><textarea name="mensagem" rows="5"></textarea></label>
      <label className="form-wide consent-field"><input type="checkbox" name="consentimento" value="Aceito" required /><span>Li e aceito que os meus dados sejam utilizados para responder a este pedido, nos termos da <a href="../privacidade.html">Política de Privacidade</a>.</span></label>
    </div>
    <button className="btn-primary form-submit" type="submit">Solicitar contacto</button>
    <p className="form-status" id="formStatus" role="status" aria-live="polite"></p>
  </form>;
}

function App(){
  const [openFaq, setOpenFaq] = useState(0);
  useEffect(() => { import('../js/main.js'); }, []);
  return <>
    <a className="skip-link" href="#conteudo">Saltar para o conteúdo principal</a>
    <Nav />
    <main id="conteudo">
      <header className="lp-hero" id="top">
        <div className="lp-hero-media" role="img" aria-label="Reunião de acompanhamento empresarial"></div>
        <div className="wrap lp-hero-grid">
          <div className="lp-hero-copy reveal"><p className="eyebrow">Contabilidade · Fiscalidade · Gestão</p><h1>A contabilidade da sua empresa deve ajudar a <em>decidir</em>, não apenas cumprir obrigações.</h1><p>A Razão Dinâmica acompanha empresas para dar mais clareza, controlo e segurança ao negócio.</p><div className="hero-ctas"><a className="btn-primary" href="#contacto">Marcar reunião</a><a className="btn-ghost" href="#servicos">Conhecer serviços</a></div><div className="hero-proof"><span>20+ anos de atividade</span><span>500 empresas acompanhadas</span></div></div>
          <div className="lp-hero-frame reveal" data-image-slot="/images/landing/hero-razao-dinamica.jpg" aria-hidden="true"><span className="mono">RIGOR PARA CUMPRIR</span><strong>Clareza para decidir.</strong></div>
        </div>
      </header>

      <section className="lp-section lp-problem" id="abordagem"><div className="wrap"><div className="section-heading reveal"><p className="section-tag">Quando os números não ajudam</p><h2>Decidir sem informação custa mais do que parece.</h2><p>Uma contabilidade distante pode cumprir prazos e, ainda assim, deixar a gestão sem respostas.</p></div><div className="problem-layout"><div className="problem-list">{problems.map((problem, index) => <article className="problem-card reveal" key={problem}><span className="mono">0{index + 1}</span><p>{problem}</p></article>)}</div><div className="editorial-visual reveal" data-image-slot="/images/landing/problem-financial-control.jpg"><img src={problemImageUrl} srcSet={`${problemImage600} 600w, ${problemImage900} 900w`} sizes="(max-width: 860px) 100vw, 45vw" width="900" height="360" alt="Empresários a analisar informação financeira com acompanhamento profissional" loading="lazy" decoding="async" /></div></div></div></section>

      <section className="lp-section lp-solution"><div className="wrap solution-grid"><div className="solution-media reveal" data-image-slot="/images/landing/team-razao-dinamica.jpg"><img src={teamImageUrl} srcSet={`${teamImage600} 600w, ${teamImage900} 900w`} sizes="(max-width: 860px) 100vw, 45vw" width="900" height="598" alt="Equipa em reunião de acompanhamento" loading="lazy" decoding="async" /></div><div className="solution-copy reveal"><p className="section-tag">A abordagem Razão Dinâmica</p><h2>Informação útil para gerir com mais confiança.</h2><p className="solution-lede">Mais do que tratar documentos, ajudamos empresas a compreender os seus números, antecipar riscos e tomar decisões com mais confiança.</p><ul><li>Contabilidade e fiscalidade articuladas</li><li>Equipa multidisciplinar e acompanhamento próximo</li><li>Planeamento financeiro e leitura de gestão</li><li>Rigor técnico com visão do negócio</li></ul><a className="text-link" href="#contacto">Falar sobre a sua empresa</a></div></div></section>

      <section className="lp-stats" aria-label="Experiência Razão Dinâmica"><div className="wrap">{[['20','anos de atividade'],['500','empresas acompanhadas'],['70','especialistas']].map((stat) => <div className="lp-stat reveal" key={stat[1]}><strong className="mono" data-count={stat[0]}>{stat[0]}</strong><span>{stat[1]}</span></div>)}</div></section>

      <section className="lp-section lp-benefits"><div className="wrap"><div className="section-heading reveal"><p className="section-tag">O que muda na gestão</p><h2>Mais controlo hoje. Melhores decisões amanhã.</h2></div><div className="benefit-grid">{benefits.map((benefit, index) => <div className="benefit reveal" key={benefit}><span className="mono">{String(index + 1).padStart(2,'0')}</span><p>{benefit}</p></div>)}</div></div></section>

      <section className="lp-section lp-services" id="servicos"><div className="wrap"><div className="section-heading reveal"><p className="section-tag">Serviços</p><h2>Uma leitura integrada da sua empresa.</h2><p>O acompanhamento adapta-se ao contexto do negócio e às decisões que precisa de tomar.</p></div><div className="service-grid">{services.map((service) => <article className="service-card reveal" key={service[0]}><span className="mono">{service[0]}</span><h3>{service[1]}</h3><p>{service[2]}</p><a href="#contacto" aria-label={`Pedir contacto sobre ${service[1]}`}>Pedir contacto</a></article>)}</div></div></section>

      <section className="lp-section lp-trust"><div className="wrap trust-grid"><div className="trust-copy reveal"><p className="section-tag">Experiência que acompanha</p><h2>Proximidade sem perder rigor.</h2><p>Há mais de duas décadas, a Razão Dinâmica acompanha empresas em contabilidade, fiscalidade e consultoria, com uma equipa preparada para olhar para os números e para o contexto do negócio.</p><a className="btn-ghost" href="#contacto">Conversar com a equipa</a></div><div className="trust-media reveal" data-image-slot="/images/landing/office-razao-dinamica.jpg"><img src={officeImageUrl} srcSet={`${officeImage600} 600w, ${officeImage900} 900w`} sizes="(max-width: 860px) 100vw, 45vw" width="900" height="598" alt="Equipa Razão Dinâmica" loading="lazy" decoding="async" /></div></div></section>

      <section className="lp-section lp-contact" id="contacto"><div className="wrap contact-layout"><div className="contact-intro reveal"><p className="section-tag">Primeiro contacto</p><h2>Quer perceber como podemos apoiar melhor a gestão da sua empresa?</h2><p>Preencha o formulário e entraremos em contacto para compreender o contexto da sua empresa e indicar o melhor enquadramento.</p><div className="contact-assurance"><span>✓ Conversa sem compromisso</span><span>✓ Resposta personalizada</span><span>✓ Tratamento responsável dos dados</span></div></div><LeadForm /></div></section>

      <section className="lp-section lp-faq" id="faq"><div className="wrap faq-layout"><div className="section-heading reveal"><p className="section-tag">Perguntas frequentes</p><h2>Antes da primeira conversa.</h2></div><div className="faq-list">{faqs.map((faq, index) => <article className={`faq-item ${openFaq === index ? 'is-open' : ''}`} key={faq[0]}><h3><button type="button" aria-expanded={openFaq === index} onClick={() => setOpenFaq(openFaq === index ? -1 : index)}>{faq[0]}<span aria-hidden="true">+</span></button></h3><div className="faq-answer"><p>{faq[1]}</p></div></article>)}</div></div></section>

      <section className="lp-final"><div className="wrap reveal"><p className="section-tag">Próximo passo</p><h2>A sua empresa merece uma contabilidade que acompanhe o negócio de perto.</h2><p>Fale connosco e perceba como trazer mais clareza, controlo e segurança à gestão.</p><a className="btn-primary" href="#contacto">Marcar reunião</a></div></section>
    </main>
    <Footer /><Consent />
    <a className="whatsapp-float" href="https://wa.me/351910205029?text=Ol%C3%A1%21%20Gostaria%20de%20saber%20mais%20sobre%20os%20servi%C3%A7os%20da%20Raz%C3%A3o%20Din%C3%A2mica." target="_blank" rel="noreferrer" aria-label="Falar pelo WhatsApp" data-meta-event="whatsapp"><span className="whatsapp-tooltip" role="tooltip">Fale connosco no WhatsApp</span><span aria-hidden="true">✦</span></a>
  </>;
}

createRoot(document.getElementById('landing-root')).render(<App />);
