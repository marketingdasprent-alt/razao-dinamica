(function(){
  // Consent-gated Meta Pixel. A future CMP must call
  // window.RazaoDinamicaTracking.enableMarketing() only after valid marketing consent.
  (function(){
    var pixelId = '28161293560174741';
    var enabled = false;
    var loading = false;
    var initialized = false;

    function queue(){
      if (window.fbq) return window.fbq;
      var fbq = function(){ fbq.callMethod ? fbq.callMethod.apply(fbq, arguments) : fbq.queue.push(arguments); };
      fbq.push = fbq;
      fbq.loaded = true;
      fbq.version = '2.0';
      fbq.queue = [];
      window._fbq = window.fbq = fbq;
      return fbq;
    }

    function enableMarketing(){
      if (enabled || loading) return;
      if (initialized && window.fbq) {
        window.fbq('consent', 'grant');
        window.fbq('track', 'PageView');
        enabled = true;
        return;
      }
      loading = true;
      var fbq = queue();
      var script = document.createElement('script');
      script.async = true;
      script.src = 'https://connect.facebook.net/en_US/fbevents.js';
      script.onload = function(){
        enabled = true;
        initialized = true;
        loading = false;
        fbq('init', pixelId);
        fbq('track', 'PageView');
      };
      script.onerror = function(){ loading = false; };
      document.head.appendChild(script);
    }

    function track(eventName){
      if (enabled && window.fbq) window.fbq('track', eventName);
    }

    function revokeMarketing(){
      if (window.fbq && initialized) window.fbq('consent', 'revoke');
      enabled = false;
    }

    window.RazaoDinamicaTracking = {
      enableMarketing: enableMarketing,
      revokeMarketing: revokeMarketing,
      trackWhatsAppClick: function(){ track('Contact'); },
      trackLeadSent: function(){ track('Lead'); }
    };

    document.querySelectorAll('[data-meta-event="whatsapp"]').forEach(function(link){
      link.addEventListener('click', function(){ window.RazaoDinamicaTracking.trackWhatsAppClick(); });
    });
  })();

  // Lightweight consent manager. Necessary storage is always active; marketing is opt-in.
  (function(){
    var storageKey = 'razaoDinamicaConsent';
    var storageVersion = 1;
    var banner = document.getElementById('cookieBanner');
    var preferences = document.getElementById('cookiePreferences');
    var panel = preferences && preferences.querySelector('.cookie-preferences-panel');
    var marketing = document.getElementById('marketingConsent');
    var acceptButton = document.querySelector('[data-cookie-accept]');
    var rejectButton = document.querySelector('[data-cookie-reject]');
    var manageButton = document.querySelector('[data-cookie-manage]');
    var saveButton = document.querySelector('[data-cookie-save]');
    var footerButton = document.querySelector('[data-cookie-settings]');
    if (!banner || !preferences || !marketing) return;
    var previousFocus = null;
    var openedFromBanner = false;

    function readChoice(){
      try {
        var value = JSON.parse(window.localStorage.getItem(storageKey));
        return value && value.version === storageVersion && value.necessary === true && typeof value.marketing === 'boolean' ? value : null;
      } catch (error) { return null; }
    }
    function writeChoice(marketingAllowed){
      var value = { version:storageVersion, necessary:true, marketing:Boolean(marketingAllowed), updatedAt:new Date().toISOString() };
      try { window.localStorage.setItem(storageKey, JSON.stringify(value)); } catch (error) {}
      if (value.marketing) window.RazaoDinamicaTracking.enableMarketing();
      else window.RazaoDinamicaTracking.revokeMarketing();
      return value;
    }
    function focusable(){ return Array.prototype.slice.call(panel.querySelectorAll('button,[href],input:not([disabled]),[tabindex]:not([tabindex="-1"])')); }
    function showBanner(){ banner.hidden = false; document.body.classList.add('cookie-banner-visible'); }
    function hideBanner(){ banner.hidden = true; document.body.classList.remove('cookie-banner-visible'); }
    function openPreferences(fromBanner, trigger){
      openedFromBanner = Boolean(fromBanner);
      previousFocus = trigger || document.activeElement;
      var choice = readChoice();
      marketing.checked = choice ? choice.marketing : false;
      preferences.hidden = false;
      document.body.classList.add('cookie-preferences-open');
      window.requestAnimationFrame(function(){ preferences.classList.add('is-open'); preferences.querySelector('.cookie-preferences-close').focus(); });
    }
    function closePreferences(returnFocus){
      preferences.classList.remove('is-open');
      document.body.classList.remove('cookie-preferences-open');
      window.setTimeout(function(){
        preferences.hidden = true;
        if (!readChoice()) showBanner();
        if (returnFocus && previousFocus) previousFocus.focus();
      }, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 220);
    }
    function finish(marketingAllowed){
      writeChoice(marketingAllowed);
      hideBanner();
      closePreferences(false);
    }

    acceptButton.addEventListener('click', function(){ finish(true); });
    rejectButton.addEventListener('click', function(){ finish(false); });
    manageButton.addEventListener('click', function(){ openPreferences(true, manageButton); });
    saveButton.addEventListener('click', function(){ finish(marketing.checked); });
    footerButton.addEventListener('click', function(){ openPreferences(false, footerButton); });
    preferences.querySelectorAll('[data-cookie-close]').forEach(function(item){ item.addEventListener('click', function(){ closePreferences(true); }); });
    document.addEventListener('keydown', function(event){
      if (preferences.hidden) return;
      if (event.key === 'Escape') { event.preventDefault(); closePreferences(true); }
      if (event.key === 'Tab') {
        var items = focusable();
        var first = items[0];
        var last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    });

    var choice = readChoice();
    if (!choice) showBanner();
    else if (choice.marketing) window.RazaoDinamicaTracking.enableMarketing();
  })();

    var nav = document.getElementById('mainNav');
    var burger = document.getElementById('burgerBtn');
    var panel = document.getElementById('mobileNavPanel');
    if (!nav || !burger || !panel) return;

    function setMenu(open, returnFocus){
      nav.classList.toggle('open', open);
      document.body.classList.toggle('nav-menu-open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
      panel.setAttribute('aria-hidden', open ? 'false' : 'true');
      if (open) {
        var firstLink = panel.querySelector('a');
        if (firstLink) window.setTimeout(function(){ firstLink.focus(); }, 180);
      } else if (returnFocus) {
        burger.focus();
      }
    }

    panel.setAttribute('aria-hidden', window.innerWidth <= 860 ? 'true' : 'false');

    burger.addEventListener('click', function(){
      setMenu(!nav.classList.contains('open'), false);
    });

    // Close the menu after tapping a nav link (anchor scroll)
    nav.querySelectorAll('.navlinks a').forEach(function(link){
      link.addEventListener('click', function(){
        setMenu(false, false);
      });
    });

    document.addEventListener('keydown', function(event){
      if (event.key === 'Escape' && nav.classList.contains('open')) setMenu(false, true);
    });

    window.addEventListener('resize', function(){
      if (window.innerWidth > 860) {
        setMenu(false, false);
        panel.setAttribute('aria-hidden', 'false');
      } else if (!nav.classList.contains('open')) {
        panel.setAttribute('aria-hidden', 'true');
      }
    });
  })();
  (function(){
    var imgs = document.querySelectorAll('.hero-bg img');
    var dots = document.querySelectorAll('.hero-dots span');
    if (!imgs.length) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var i = 0;
    setInterval(function(){
      imgs[i].classList.remove('active');
      dots[i] && dots[i].classList.remove('active');
      i = (i + 1) % imgs.length;
      imgs[i].classList.add('active');
      dots[i] && dots[i].classList.add('active');
    }, 4000);
  })();
  // Scroll reveal microinteraction
  (function(){
    var items = document.querySelectorAll('.reveal');
    if (!items.length) return;
    var obs = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting){
          entry.target.classList.add('in');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    items.forEach(function(el){ obs.observe(el); });
  })();

  // Smooth scroll for in-page anchors
  document.querySelectorAll('a[href^="#"]').forEach(function(link){
    link.addEventListener('click', function(e){
      var id = this.getAttribute('href');
      if (id.length > 1) {
        var target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
        }
      }
    });
  });  // FAQ accordion
  (function(){
    var items = document.querySelectorAll('.faq-item');
    items.forEach(function(item, index){
      var btn = item.querySelector('.faq-q');
      var answer = item.querySelector('.faq-a');
      if (!btn || !answer) return;
      var answerId = 'faq-answer-' + (index + 1);
      answer.id = answerId;
      btn.setAttribute('aria-controls', answerId);
      btn.setAttribute('aria-expanded', 'false');
      btn.addEventListener('click', function(){
        var wasOpen = item.classList.contains('open');
        items.forEach(function(i){
          i.classList.remove('open');
          var otherButton = i.querySelector('.faq-q');
          if (otherButton) otherButton.setAttribute('aria-expanded', 'false');
        });
        if (!wasOpen) {
          item.classList.add('open');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });
  })();

  // Accessible service details, populated from the service selected by the visitor.
  (function(){
    var modal = document.getElementById('servico-modal');
    if (!modal) return;
    var panel = modal.querySelector('.service-modal-panel');
    var closeButton = modal.querySelector('.service-modal-close');
    var title = document.getElementById('serviceModalTitle');
    var number = document.getElementById('serviceModalNumber');
    var description = document.getElementById('serviceModalDescription');
    var list = document.getElementById('serviceModalList');
    var cta = modal.querySelector('.service-modal-cta');
    var serviceSelect = document.getElementById('serviceSelect');
    var previousFocus = null;
    var activeService = '';
    var services = {
      'Contabilidade': { number:'01', description:'Acompanhamos a organização contabilística da empresa e transformamos a informação financeira numa base clara para a gestão.', items:['Organização e acompanhamento contabilístico','Preparação de balancetes e demonstrações financeiras','Informação de apoio à gestão'] },
      'Fiscalidade': { number:'02', description:'Apoiamos a empresa no acompanhamento fiscal e na organização das obrigações aplicáveis à sua atividade.', items:['Acompanhamento das obrigações fiscais','Organização da informação necessária','Esclarecimento de dúvidas fiscais correntes'] },
      'Consultoria de gestão': { number:'03', description:'Analisamos a informação do negócio para apoiar decisões mais informadas e adequadas aos objetivos da empresa.', items:['Leitura de indicadores de gestão','Apoio à análise de decisões','Acompanhamento da evolução do negócio'] },
      'Planeamento financeiro': { number:'04', description:'Ajudamos a organizar previsões e necessidades financeiras para dar maior clareza ao planeamento da empresa.', items:['Preparação de previsões financeiras','Acompanhamento de orçamento e tesouraria','Análise de necessidades de financiamento'] },
      'Auditoria interna': { number:'05', description:'Realizamos uma leitura independente dos processos e controlos internos para ajudar a identificar riscos e oportunidades de melhoria.', items:['Revisão de processos internos','Análise de controlos e procedimentos','Identificação de áreas a acompanhar'] }
    };

    function focusable(){ return Array.prototype.slice.call(panel.querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')); }
    function openModal(service, trigger){
      var data = services[service];
      if (!data) return;
      activeService = service;
      previousFocus = trigger || document.activeElement;
      number.textContent = data.number;
      title.textContent = service;
      description.textContent = data.description;
      list.innerHTML = data.items.map(function(item){ return '<li>' + item + '</li>'; }).join('');
      modal.hidden = false;
      document.body.classList.add('modal-open');
      window.requestAnimationFrame(function(){ modal.classList.add('is-open'); closeButton.focus(); });
    }
    function closeModal(returnFocus){
      modal.classList.remove('is-open');
      document.body.classList.remove('modal-open');
      window.setTimeout(function(){
        modal.hidden = true;
        if (returnFocus && previousFocus) previousFocus.focus();
      }, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 220);
    }

    document.querySelectorAll('[data-service-detail]').forEach(function(trigger){
      if (trigger.matches('.solution-card')) {
        trigger.removeAttribute('role');
        trigger.removeAttribute('tabindex');
        trigger.removeAttribute('aria-label');
      }
      trigger.addEventListener('click', function(event){
        event.preventDefault();
        event.stopImmediatePropagation();
        openModal(trigger.getAttribute('data-service-detail'), trigger);
      });
      if (!trigger.matches('a,button')) trigger.addEventListener('keydown', function(event){
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openModal(trigger.getAttribute('data-service-detail'), trigger); }
      });
    });
    modal.querySelectorAll('[data-modal-close]').forEach(function(item){ item.addEventListener('click', function(){ closeModal(true); }); });
    cta.addEventListener('click', function(){
      if (serviceSelect) {
        serviceSelect.value = activeService;
        serviceSelect.dispatchEvent(new Event('change', { bubbles:true }));
      }
      closeModal(false);
      window.setTimeout(function(){
        document.getElementById('contacto').scrollIntoView({ behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block:'start' });
        if (serviceSelect) serviceSelect.focus({ preventScroll:true });
      }, 240);
    });
    document.addEventListener('keydown', function(event){
      if (modal.hidden) return;
      if (event.key === 'Escape') { event.preventDefault(); closeModal(true); }
      if (event.key === 'Tab') {
        var items = focusable();
        var first = items[0];
        var last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    });
  })();

  // Reveal a discrete shortcut after the visitor has moved away from the hero.
  (function(){
    var button = document.querySelector('.back-to-top');
    if (!button) return;
    var ticking = false;
    function render(){ ticking = false; button.classList.toggle('is-visible', window.scrollY > Math.max(420, window.innerHeight * .65)); }
    window.addEventListener('scroll', function(){ if (!ticking) { ticking = true; window.requestAnimationFrame(render); } }, { passive:true });
    button.addEventListener('click', function(){ document.getElementById('top').scrollIntoView({ behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); });
    render();
  })();

  // Scroll-driven process narrative: horizontal on desktop, vertical on mobile.
  (function(){
    var section = document.getElementById('processo');
    if (!section) return;
    var steps = Array.prototype.slice.call(section.querySelectorAll('.process-step'));
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    var ticking = false;

    function render(){
      ticking = false;
      if (reducedMotion.matches) {
        section.style.setProperty('--process-progress', '100%');
        steps.forEach(function(step){ step.classList.add('is-done'); });
        return;
      }
      var rect = section.getBoundingClientRect();
      var start = window.innerHeight * .74;
      var distance = Math.max(rect.height - window.innerHeight * .34, 1);
      var progress = Math.max(0, Math.min(1, (start - rect.top) / distance));
      var activeIndex = Math.min(steps.length - 1, Math.floor(progress * steps.length));
      section.style.setProperty('--process-progress', (progress * 100).toFixed(2) + '%');
      steps.forEach(function(step, index){
        step.classList.toggle('is-active', progress > 0 && index === activeIndex);
        step.classList.toggle('is-done', index < activeIndex || progress >= 1);
      });
    }
    function requestRender(){
      if (!ticking) { ticking = true; window.requestAnimationFrame(render); }
    }
    window.addEventListener('scroll', requestRender, { passive:true });
    window.addEventListener('resize', requestRender);
    if (reducedMotion.addEventListener) reducedMotion.addEventListener('change', render);
    render();
  })();

  // Carry the visitor's selected challenge into the contact form.
  (function(){
    var serviceSelect = document.getElementById('serviceSelect');
    document.querySelectorAll('[data-service]').forEach(function(link){
      link.addEventListener('click', function(){
        if (serviceSelect) serviceSelect.value = link.getAttribute('data-service');
      });
    });
  })();

  // Circular service navigation: one active card, flanked by its real neighbours.
  (function(){
    var track = document.querySelector('.solutions-track');
    var previous = document.querySelector('.solution-prev');
    var next = document.querySelector('.solution-next');
    var count = document.querySelector('.solution-count');
    if (!track) return;
    var cards = Array.prototype.slice.call(track.querySelectorAll('.solution-card'));
    var activeIndex = 0;
    var pointerStartX = null;
    var transition = null;

    function circular(index){
      return (index + cards.length) % cards.length;
    }

    function render(direction){
      var visible = [circular(activeIndex - 1), activeIndex, circular(activeIndex + 1)];
      cards.forEach(function(card, index){
        var position = visible.indexOf(index);
        var isVisible = position !== -1;
        var isActive = index === activeIndex;
        card.classList.toggle('is-visible', isVisible);
        card.classList.toggle('is-active', isActive);
        card.style.order = isVisible ? String(position + 1) : '';
        card.setAttribute('aria-hidden', isVisible ? 'false' : 'true');
        card.setAttribute('data-carousel-index', String(index));
      });
      if (count) count.textContent = String(activeIndex + 1).padStart(2, '0') + ' / ' + String(cards.length).padStart(2, '0');
      if (transition) transition.cancel();
      if (direction && track.animate && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        transition = track.animate([
          { opacity:.72, transform:'translateX(' + (direction > 0 ? '12px' : '-12px') + ')' },
          { opacity:1, transform:'translateX(0)' }
        ], { duration:240, easing:'cubic-bezier(.2,.7,.2,1)' });
      }
    }

    function move(direction){
      activeIndex = circular(activeIndex + direction);
      render(direction);
    }
    if (previous) previous.addEventListener('click', function(){ move(-1); });
    if (next) next.addEventListener('click', function(){ move(1); });
    cards.forEach(function(card, index){
      card.addEventListener('click', function(event){
        if (event.target.closest('a')) return;
        if (index === circular(activeIndex - 1)) move(-1);
        else if (index === circular(activeIndex + 1)) move(1);
      });
    });
    track.addEventListener('keydown', function(event){
      if (event.key === 'ArrowRight') { event.preventDefault(); move(1); }
      if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1); }
      if (event.key === 'Home') { event.preventDefault(); activeIndex = 0; render(0); }
      if (event.key === 'End') { event.preventDefault(); activeIndex = cards.length - 1; render(0); }
    });
    track.addEventListener('pointerdown', function(event){ pointerStartX = event.clientX; }, { passive:true });
    track.addEventListener('pointerup', function(event){
      if (pointerStartX === null) return;
      var distance = event.clientX - pointerStartX;
      pointerStartX = null;
      if (Math.abs(distance) > 45) move(distance < 0 ? 1 : -1);
    }, { passive:true });
    track.addEventListener('pointercancel', function(){ pointerStartX = null; });
    window.addEventListener('resize', function(){ render(0); });
    render(0);
  })();

  // Preserve the selected office as simple page state for the contact conversation.
  (function(){
    var selectedLocation = document.getElementById('selectedLocation');
    var message = document.querySelector('#leadForm textarea[name="mensagem"]');
    document.querySelectorAll('[data-location]').forEach(function(link){
      link.addEventListener('click', function(){
        var location = link.getAttribute('data-location');
        if (selectedLocation) selectedLocation.textContent = 'Localização selecionada: ' + location;
        if (message && !message.value) message.value = 'Gostaria de falar com a equipa da localização de ' + location + '.';
      });
    });
  })();

  // Switch the embedded Google Map without leaving the page.
  (function(){
    var map = document.getElementById('officeMap');
    var name = document.getElementById('mapLocationName');
    var external = document.getElementById('mapExternalLink');
    var buttons = document.querySelectorAll('[data-map-query]');
    if (!map || !buttons.length) return;
    buttons.forEach(function(button){
      button.addEventListener('click', function(){
        var location = button.getAttribute('data-map-location');
        var query = button.getAttribute('data-map-query');
        var encoded = encodeURIComponent(query);
        map.src = 'https://www.google.com/maps?q=' + encoded + '&output=embed';
        map.title = 'Mapa do escritório da Razão Dinâmica em ' + location;
        if (name) name.textContent = location;
        if (external) external.href = 'https://www.google.com/maps/search/?api=1&query=' + encoded;
        buttons.forEach(function(item){ item.classList.toggle('is-active', item === button); });
        document.getElementById('mapa-escritorios').scrollIntoView({ behavior:'smooth', block:'center' });
      });
    });
  })();

  // Integration guard: keep the prototype honest until a real endpoint exists.
  (function(){
    var form = document.getElementById('leadForm');
    var status = document.getElementById('formStatus');
    if (!form) return;
    var honeypot = document.createElement('label');
    honeypot.className = 'form-honeypot';
    honeypot.setAttribute('aria-hidden', 'true');
    honeypot.innerHTML = '<span>Website</span><input type="text" name="website" tabindex="-1" autocomplete="off">';
    form.insertBefore(honeypot, form.firstChild);
    form.querySelectorAll('input, select, textarea').forEach(function(field){
      if (field.name === 'website') return;
      var label = field.closest('label');
      var error = document.createElement('span');
      var errorId = 'error-' + (field.name || 'field');
      error.className = 'field-error';
      error.id = errorId;
      if (label) label.appendChild(error);
      field.setAttribute('aria-describedby', errorId);
      function updateFilled(){ field.classList.toggle('is-filled', Boolean(field.value)); }
      function updateError(){
        var message = '';
        if (!field.validity.valid) {
          if (field.validity.valueMissing) message = 'Este campo é obrigatório.';
          else if (field.validity.typeMismatch) message = 'Introduza um formato válido.';
          else message = field.validationMessage;
        }
        error.textContent = message;
        field.classList.toggle('is-error', Boolean(message));
        field.setAttribute('aria-invalid', message ? 'true' : 'false');
      }
      field.addEventListener('input', updateFilled);
      field.addEventListener('change', updateFilled);
      field.addEventListener('invalid', function(){ updateError(); });
      field.addEventListener('blur', updateError);
      field.addEventListener('input', function(){ if (field.checkValidity()) updateError(); });
    });
    form.addEventListener('submit', async function(event){
      if (form.elements.website && form.elements.website.value) { event.preventDefault(); return; }
      event.preventDefault();
      var endpoint = form.getAttribute('action');
      if (!endpoint) {
        status.textContent = 'O envio online ainda não está disponível. Contacte-nos por email, telefone ou WhatsApp.';
        return;
      }
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var submitButton = form.querySelector('[type="submit"]');
      form.classList.remove('is-success');
      form.classList.add('is-sending');
      if (submitButton) submitButton.disabled = true;
      status.textContent = 'A enviar a sua mensagem…';
      try {
        var formData = new FormData(form);
        var ddi = form.elements.ddi ? form.elements.ddi.value : '';
        var phone = form.elements.telefone ? form.elements.telefone.value.trim() : '';
        formData.set('telefone_completo', phone ? ddi + ' ' + phone : '');
        var response = await fetch(endpoint, { method:form.method || 'POST', body:formData, headers:{ Accept:'application/json' } });
        if (!response.ok) throw new Error('Resposta inválida do servidor');
        form.reset();
        form.querySelectorAll('.is-filled').forEach(function(field){ field.classList.remove('is-filled'); });
        form.classList.add('is-success');
        status.textContent = 'Mensagem enviada com sucesso. Entraremos em contacto brevemente.';
        if (window.RazaoDinamicaTracking) window.RazaoDinamicaTracking.trackLeadSent();
      } catch (error) {
        status.textContent = 'Não foi possível enviar a mensagem. Tente novamente ou contacte-nos por telefone.';
      } finally {
        form.classList.remove('is-sending');
        if (submitButton) submitButton.disabled = false;
      }
    });
  })();

  // Lift the floating contact action when the footer enters the viewport.
  (function(){
    var button = document.querySelector('.whatsapp-float');
    var backToTop = document.querySelector('.back-to-top');
    var footer = document.getElementById('rodape');
    if (!button || !footer || !('IntersectionObserver' in window)) return;
    new IntersectionObserver(function(entries){
      button.classList.toggle('near-footer', entries[0].isIntersecting);
      if (backToTop) backToTop.classList.toggle('near-footer', entries[0].isIntersecting);
    }, { threshold:.08 }).observe(footer);
  })();
