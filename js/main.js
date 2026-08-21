(function(){
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
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
        status.textContent = '[INTEGRAÇÃO PENDENTE] O formulário está validado, mas ainda não envia dados.';
        return;
      }
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var submitButton = form.querySelector('[type="submit"]');
      form.classList.remove('is-success');
      form.classList.add('is-sending');
      if (submitButton) submitButton.disabled = true;
      status.textContent = 'A enviar a sua mensagem…';
      try {
        var response = await fetch(endpoint, { method:form.method || 'POST', body:new FormData(form), headers:{ Accept:'application/json' } });
        if (!response.ok) throw new Error('Resposta inválida do servidor');
        form.reset();
        form.querySelectorAll('.is-filled').forEach(function(field){ field.classList.remove('is-filled'); });
        form.classList.add('is-success');
        status.textContent = 'Mensagem enviada com sucesso. Entraremos em contacto brevemente.';
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
    var footer = document.getElementById('rodape');
    if (!button || !footer || !('IntersectionObserver' in window)) return;
    new IntersectionObserver(function(entries){
      button.classList.toggle('near-footer', entries[0].isIntersecting);
    }, { threshold:.08 }).observe(footer);
  })();
