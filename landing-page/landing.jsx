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
import benefitControlo from '../assets/images/benefit-controlo.jpg';
import benefitOrganizacao from '../assets/images/benefit-organizacao.jpg';
import benefitRisco from '../assets/images/benefit-risco.jpg';
import benefitEquipa from '../assets/images/benefit-equipa.jpg';
import benefitDecisoes from '../assets/images/benefit-decisoes.jpg';
import benefitSaude from '../assets/images/benefit-saude.jpg';
import benefitCrescer from '../assets/images/benefit-crescer.jpg';
import benefitTempo from '../assets/images/benefit-tempo.jpg';

const WHATSAPP_HERO_URL = 'https://wa.me/351910205029?text=Ol%C3%A1%21%20Gostaria%20de%20saber%20mais%20sobre%20os%20servi%C3%A7os%20da%20Raz%C3%A3o%20Din%C3%A2mica.';

function WhatsAppIcon(){
  return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.39 1.26 4.81L2 22l5.4-1.42a9.9 9.9 0 0 0 4.64 1.18h.01c5.46 0 9.9-4.45 9.9-9.91C21.96 6.45 17.5 2 12.04 2zm5.79 14.1c-.24.68-1.4 1.3-1.93 1.38-.5.08-1.12.11-1.8-.11-.42-.13-.96-.31-1.65-.6-2.9-1.25-4.8-4.17-4.94-4.36-.15-.19-1.18-1.57-1.18-3 0-1.42.75-2.12 1.01-2.41.27-.29.58-.36.78-.36.19 0 .39 0 .56.01.18.01.42-.07.65.5.24.58.83 2 .9 2.15.07.15.11.32.02.51-.09.19-.14.31-.27.48-.14.17-.29.37-.41.5-.14.15-.28.31-.12.6.16.29.71 1.17 1.53 1.9 1.05.94 1.94 1.23 2.23 1.37.29.14.46.12.63-.07.17-.19.72-.84.92-1.13.19-.29.38-.24.65-.14.26.1 1.67.79 1.96.93.29.14.48.21.55.33.07.12.07.68-.17 1.36z"/></svg>;
}

function CalendarIcon(){
  return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1V3a1 1 0 0 1 1-1Zm13 8H4v10a.5.5 0 0 0 .5.5h15a.5.5 0 0 0 .5-.5V10ZM8.5 13a1 1 0 1 1 0 2 1 1 0 0 1 0-2Zm3.5 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2Zm3.5 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2Z"/></svg>;
}

function MailIcon(){
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 6h16v12H4z"/><path d="m4 7 8 6 8-6"/></svg>;
}

function PhoneIcon(){
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6.5 3h3l1.5 4.5-2 1.5a12 12 0 0 0 6 6l1.5-2 4.5 1.5v3c0 1-1 2-2 2C11.5 20.5 3.5 12.5 3.5 5c0-1 1-2 2-2Z"/></svg>;
}

function ScrollCueIcon(){
  return <svg width="14" height="20" viewBox="0 0 14 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M7 1V19M7 19L1 13M7 19L13 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}

const solutionPoints = [
  ['ledger', 'Contabilidade e fiscalidade articuladas'],
  ['team', 'Equipa multidisciplinar e acompanhamento próximo'],
  ['chart', 'Planeamento financeiro e leitura de gestão'],
  ['audit', 'Rigor técnico com visão do negócio']
];

const iconPaths = {
  ledger: <path d="M6 5h20v22H6zM10 11h12M10 16h12M10 21h7"/>,
  fiscal: <path d="M8 4h16v24H8zM12 10h8M12 15h8M12 20h5M21 22l2 2 4-5"/>,
  trend: <path d="M5 25l7-8 5 4 10-13M20 8h7v7"/>,
  chart: <path d="M5 25V15M12 25V9M19 25V13M26 25V5M3 27h26"/>,
  audit: <><circle cx="14" cy="14" r="8"/><path d="m20 20 7 7M10 14l3 3 5-6"/></>,
  team: <><circle cx="12" cy="10" r="4"/><circle cx="22" cy="12" r="3.4"/><path d="M4 27c0-4.4 3.6-8 8-8s8 3.6 8 8M18 20.4c3.6.3 6.5 2.9 6.5 6.6"/></>,
  clock: <><circle cx="16" cy="16" r="10"/><path d="M16 10v6l4 3"/></>,
  helpCircle: <><circle cx="16" cy="16" r="10"/><path d="M12.8 12.8a3.4 3.4 0 1 1 4.8 3.1c-1 .5-1.6 1.2-1.6 2.3"/><circle cx="16" cy="22" r=".7" fill="currentColor" stroke="none"/></>,
  dice: <><rect x="6" y="6" width="20" height="20" rx="3"/><circle cx="11" cy="11" r="1.3" fill="currentColor" stroke="none"/><circle cx="21" cy="11" r="1.3" fill="currentColor" stroke="none"/><circle cx="16" cy="16" r="1.3" fill="currentColor" stroke="none"/><circle cx="11" cy="21" r="1.3" fill="currentColor" stroke="none"/><circle cx="21" cy="21" r="1.3" fill="currentColor" stroke="none"/></>,
  alertTriangle: <><path d="M16 5 3 27h26L16 5Z"/><path d="M16 14v6"/><circle cx="16" cy="23" r=".8" fill="currentColor" stroke="none"/></>,
  diverge: <><path d="M6 20l8-8"/><path d="M14 12H9v5"/><path d="M26 12l-8 8"/><path d="M18 20h5v-5"/></>,
  person: <><circle cx="16" cy="11" r="5"/><path d="M6 27c0-5.5 4.5-10 10-10s10 4.5 10 10"/></>,
  gauge: <><path d="M6 21a10 10 0 0 1 20 0"/><path d="M16 21l5-6"/><circle cx="16" cy="21" r="1.3" fill="currentColor" stroke="none"/></>,
  shieldCheck: <><path d="M16 4l10 4v8c0 7-4.5 11.5-10 13-5.5-1.5-10-6-10-13V8Z"/><path d="m11.5 16 3 3 6-6"/></>,
  lightbulb: <><path d="M16 5a8 8 0 0 0-4 15c1 .7 1.5 1.7 1.5 3h5c0-1.3.5-2.3 1.5-3a8 8 0 0 0-4-15Z"/><path d="M13.5 27h5"/></>,
  pulse: <path d="M4 17h5l2.5-7 4 14 2.5-7H28"/>,
  arrowUpRight: <><path d="M7 25 25 7"/><path d="M13 7h12v12"/></>
};

function Icon({ type }){
  return <svg viewBox="0 0 32 32">{iconPaths[type]}</svg>;
}

function SolutionIcon({ type }){
  return <span className="solution-icon"><Icon type={type} /></span>;
}

// Image replacement slots requested for final campaign photography:
// /images/landing/hero-razao-dinamica.jpg
// /images/landing/problem-financial-control.jpg
// /images/landing/team-razao-dinamica.jpg
// /images/landing/office-razao-dinamica.jpg

const services = [
  ['01', 'Contabilidade', 'Organização contabilística rigorosa para acompanhar a evolução do negócio com informação clara.', 'ledger'],
  ['02', 'Fiscalidade', 'Cumprimento fiscal e antecipação de riscos para reduzir surpresas e decisões em cima do prazo.', 'fiscal'],
  ['03', 'Consultoria de Gestão', 'Leitura dos números para apoiar decisões sobre custos, margem, crescimento e rentabilidade.', 'trend'],
  ['04', 'Planeamento Financeiro', 'Projeções e acompanhamento para preparar necessidades de tesouraria e decisões de investimento.', 'chart'],
  ['05', 'Auditoria Interna', 'Revisão de processos e controlos para identificar fragilidades e melhorar a qualidade da informação.', 'audit'],
  ['06', 'Apoio à Gestão Empresarial', 'Acompanhamento próximo para transformar dados financeiros em prioridades práticas de gestão.', 'team']
];

const problems = [
  ['clock', 'A contabilidade só chega quando o problema já aconteceu.'],
  ['helpCircle', 'Falta clareza sobre custos, impostos e margem.'],
  ['dice', 'As decisões dependem mais de sensação do que de dados.'],
  ['alertTriangle', 'As obrigações fiscais geram stress e risco desnecessários.'],
  ['diverge', 'A empresa cresceu, mas o controlo financeiro não acompanhou.'],
  ['person', 'O contabilista atual é distante ou apenas reativo.']
];

const benefits = [
  [benefitControlo, 'Maior controlo financeiro'], [benefitOrganizacao, 'Organização contabilística'], [benefitRisco, 'Menos risco fiscal'],
  [benefitEquipa, 'Acompanhamento próximo'], [benefitDecisoes, 'Decisões mais fundamentadas'], [benefitSaude, 'Visão clara da saúde financeira'],
  [benefitCrescer, 'Preparação para crescer'], [benefitTempo, 'Mais tempo para o negócio']
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
        <a href="#abordagem">Abordagem</a><a href="#servicos">Serviços</a><a href="#faq">FAQ</a><a href="#contacto" className="cta">Marcar reunião</a><a href={WHATSAPP_HERO_URL} target="_blank" rel="noreferrer" className="cta cta-whatsapp" data-meta-event="whatsapp"><WhatsAppIcon /> WhatsApp</a>
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
      <label className="form-wide"><span>Nome completo *</span><input type="text" name="nome" autoComplete="name" required /></label>
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

function ThankYouModal(){
  return <div className="service-modal" id="leadThankYou" hidden>
    <div className="service-modal-backdrop" data-thankyou-close></div>
    <section className="service-modal-panel" role="dialog" aria-modal="true" aria-labelledby="leadThankYouTitle" aria-describedby="leadThankYouDescription">
      <button className="service-modal-close" type="button" data-thankyou-close aria-label="Fechar">×</button>
      <span className="service-modal-number mono">OBRIGADO</span>
      <h2 id="leadThankYouTitle">Mensagem enviada com sucesso.</h2>
      <p id="leadThankYouDescription">A nossa equipa vai analisar o seu pedido e entrar em contacto brevemente. Se preferir uma resposta mais rápida, fale connosco agora pelo WhatsApp.</p>
      <a className="btn-primary service-modal-cta" href={WHATSAPP_HERO_URL} target="_blank" rel="noreferrer" data-meta-event="whatsapp"><WhatsAppIcon /> Falar agora no WhatsApp</a>
    </section>
  </div>;
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
          <div className="lp-hero-copy reveal"><p className="eyebrow">Contabilidade · Fiscalidade · Gestão</p><h1>A contabilidade da sua empresa deve ajudar a <em>decidir</em>, não apenas cumprir obrigações.</h1><p>A Razão Dinâmica acompanha empresas para dar mais clareza, controlo e segurança ao negócio.</p><div className="hero-ctas"><a className="btn-primary" href="#contacto"><CalendarIcon /> Marcar reunião</a><a className="btn-whatsapp" href={WHATSAPP_HERO_URL} target="_blank" rel="noreferrer" data-meta-event="whatsapp"><WhatsAppIcon /> Falar no WhatsApp</a></div><div className="lp-stats hero-inline-stats" aria-label="Experiência Razão Dinâmica">{[['20','anos de atividade'],['500','empresas acompanhadas'],['70','especialistas']].map((stat) => <div className="lp-stat reveal" key={stat[1]}><strong className="mono" data-count={stat[0]}>{stat[0]}</strong><span>{stat[1]}</span></div>)}</div></div>
        </div>
        <a className="scroll-cue" href="#servicos" aria-label="Rolar para baixo"><span>Explorar</span><ScrollCueIcon /></a>
      </header>

      <section className="lp-section lp-problem" id="abordagem"><div className="wrap"><div className="section-heading reveal"><p className="section-tag">Quando os números não ajudam</p><h2>Decidir sem informação custa mais do que parece.</h2><p>Uma contabilidade distante pode cumprir prazos e, ainda assim, deixar a gestão sem respostas.</p></div><div className="problem-layout"><div className="problem-list">{problems.map(([type, problem]) => <article className="problem-card reveal" key={problem}><span className="problem-icon"><Icon type={type} /></span><p>{problem}</p></article>)}</div><div className="editorial-visual reveal" data-image-slot="/images/landing/problem-financial-control.jpg"><img src={problemImageUrl} srcSet={`${problemImage600} 600w, ${problemImage900} 900w`} sizes="(max-width: 860px) 100vw, 45vw" width="900" height="360" alt="Empresários a analisar informação financeira com acompanhamento profissional" loading="lazy" decoding="async" /></div></div></div></section>

      <section className="lp-section lp-solution"><div className="wrap solution-grid"><div className="solution-media reveal" data-image-slot="/images/landing/team-razao-dinamica.jpg"><img src={teamImageUrl} srcSet={`${teamImage600} 600w, ${teamImage900} 900w`} sizes="(max-width: 860px) 100vw, 45vw" width="900" height="598" alt="Equipa em reunião de acompanhamento" loading="lazy" decoding="async" /></div><div className="solution-copy reveal"><p className="section-tag">A abordagem Razão Dinâmica</p><h2>Informação útil para gerir com mais confiança.</h2><p className="solution-lede">Mais do que tratar documentos, ajudamos empresas a compreender os seus números, antecipar riscos e tomar decisões com mais confiança.</p><ul>{solutionPoints.map(([type, text]) => <li key={text}><SolutionIcon type={type} /><span>{text}</span></li>)}</ul><a className="text-link" href="#contacto">Falar sobre a sua empresa</a></div></div></section>

      <section className="lp-section lp-benefits"><div className="wrap"><div className="section-heading reveal"><p className="section-tag">O que muda na gestão</p><h2>Mais controlo hoje. Melhores decisões amanhã.</h2></div><div className="benefit-grid">{benefits.map(([img, benefit]) => <div className="benefit reveal" key={benefit}><div className="benefit-photo"><img src={img} alt="" loading="lazy" decoding="async" /></div><p>{benefit}</p></div>)}</div></div></section>

      <section className="lp-section lp-services" id="servicos"><div className="wrap"><div className="section-heading reveal"><p className="section-tag">Serviços</p><h2>Uma leitura integrada da sua empresa.</h2><p>O acompanhamento adapta-se ao contexto do negócio e às decisões que precisa de tomar.</p></div><div className="service-grid">{services.map((service) => <article className="service-card reveal" key={service[0]}><span className="service-icon"><Icon type={service[3]} /></span><h3>{service[1]}</h3><p>{service[2]}</p><a href="#contacto" aria-label={`Pedir contacto sobre ${service[1]}`}>Pedir contacto</a></article>)}</div></div></section>

      <section className="lp-section lp-trust"><div className="wrap trust-grid"><div className="trust-copy reveal"><p className="section-tag">Experiência que acompanha</p><h2>Proximidade sem perder rigor.</h2><p>Há mais de duas décadas, a Razão Dinâmica acompanha empresas em contabilidade, fiscalidade e consultoria, com uma equipa preparada para olhar para os números e para o contexto do negócio.</p><div className="hero-ctas"><a className="btn-primary" href="#contacto"><CalendarIcon /> Preencher formulário</a><a className="btn-whatsapp" href={WHATSAPP_HERO_URL} target="_blank" rel="noreferrer" data-meta-event="whatsapp"><WhatsAppIcon /> Falar no WhatsApp</a></div></div><div className="trust-media reveal" data-image-slot="/images/landing/office-razao-dinamica.jpg"><img src={officeImageUrl} srcSet={`${officeImage600} 600w, ${officeImage900} 900w`} sizes="(max-width: 860px) 100vw, 45vw" width="900" height="598" alt="Equipa Razão Dinâmica" loading="lazy" decoding="async" /></div></div></section>

      <section className="lp-section lp-contact" id="contacto"><div className="wrap contact-layout"><div className="contact-intro reveal"><p className="section-tag">Primeiro contacto</p><h2>Quer perceber como podemos apoiar melhor a gestão da sua empresa?</h2><div className="contact-quick"><a href="mailto:geral@razaodinamica.pt"><MailIcon /><span className="contact-quick-text"><span className="mono">EMAIL</span>geral@razaodinamica.pt</span></a><a href="tel:+351919381551"><PhoneIcon /><span className="contact-quick-text"><span className="mono">TELEFONE</span>+351 919 381 551</span></a><a className="contact-quick-whatsapp" href={WHATSAPP_HERO_URL} target="_blank" rel="noreferrer" data-meta-event="whatsapp"><WhatsAppIcon /> Falar agora no WhatsApp</a><p className="contact-quick-hours"><Icon type="clock" /><span className="contact-quick-text"><span className="mono">HORÁRIO</span>Segunda a sexta · 09h às 18h</span></p></div><p>Preencha o formulário e entraremos em contacto para compreender o contexto da sua empresa e indicar o melhor enquadramento.</p></div><LeadForm /></div></section>

      <section className="lp-section lp-faq" id="faq"><div className="wrap faq-layout"><div className="section-heading reveal"><p className="section-tag">Perguntas frequentes</p><h2>Antes da primeira conversa.</h2><div className="contact-assurance"><span>✓ Conversa sem compromisso</span><span>✓ Resposta personalizada</span><span>✓ Tratamento responsável dos dados</span></div></div><div className="faq-list">{faqs.map((faq, index) => <article className={`faq-item ${openFaq === index ? 'is-open' : ''}`} key={faq[0]}><h3><button type="button" aria-expanded={openFaq === index} onClick={() => setOpenFaq(openFaq === index ? -1 : index)}>{faq[0]}<span aria-hidden="true">+</span></button></h3><div className="faq-answer"><p>{faq[1]}</p></div></article>)}</div></div></section>

      <section className="lp-final"><div className="wrap reveal"><p className="section-tag">Próximo passo</p><h2>A sua empresa merece uma contabilidade que acompanhe o negócio de perto.</h2><p>Fale connosco e perceba como trazer mais clareza, controlo e segurança à gestão.</p><div className="hero-ctas lp-final-ctas"><a className="btn-primary" href="#contacto"><CalendarIcon /> Marcar reunião</a><a className="btn-whatsapp" href={WHATSAPP_HERO_URL} target="_blank" rel="noreferrer" data-meta-event="whatsapp"><WhatsAppIcon /> Falar no WhatsApp</a></div></div></section>
    </main>
    <Footer /><Consent /><ThankYouModal />
    <button className="back-to-top" type="button" aria-label="Voltar ao início da página"><span className="back-to-top-tooltip" role="tooltip">Voltar ao início</span><span aria-hidden="true">↑</span></button>
    <a className="whatsapp-float" href={WHATSAPP_HERO_URL} target="_blank" rel="noreferrer" aria-label="Falar pelo WhatsApp" data-meta-event="whatsapp"><span className="whatsapp-tooltip" role="tooltip">Fale connosco no WhatsApp</span><WhatsAppIcon /></a>
  </>;
}

createRoot(document.getElementById('landing-root')).render(<App />);
