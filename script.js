/* SIMO Security — public website interactions */
(function () {
  'use strict';

  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobileNav');
  const header = document.getElementById('header');

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      const isOpen = mobileNav.classList.toggle('open');
      hamburger.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
    });
    mobileNav.querySelectorAll('.mob-link, .mob-cta').forEach((link) => {
      link.addEventListener('click', () => {
        mobileNav.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  if (header) {
    const updateHeader = () => header.classList.toggle('scrolled', window.scrollY > 50);
    window.addEventListener('scroll', updateHeader, { passive: true });
    updateHeader();
  }

  const animatedElements = document.querySelectorAll('[data-animate]');
  if (animatedElements.length && 'IntersectionObserver' in window) {
    document.querySelectorAll('.services-grid, .why-grid, .testi-grid').forEach((grid) => {
      grid.querySelectorAll('[data-animate]').forEach((element, index) => {
        element.dataset.delay = index * 110;
      });
    });
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const delay = Number.parseInt(entry.target.dataset.delay || '0', 10);
        window.setTimeout(() => entry.target.classList.add('visible'), delay);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    animatedElements.forEach((element) => observer.observe(element));
  } else {
    animatedElements.forEach((element) => element.classList.add('visible'));
  }

  const toast = document.getElementById('toast');
  function showToast(message, type = 'success') {
    if (!toast) return;
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    window.clearTimeout(toast.hideTimer);
    toast.hideTimer = window.setTimeout(() => toast.classList.remove('show'), 4200);
  }

  const form = document.getElementById('contactForm');
  if (form) {
    const submitButton = form.querySelector('[type="submit"]');
    const statusRegion = document.getElementById('contactStatus');

    // Los mensajes van al toast y a una region aria-live, para que un lector de
    // pantalla anuncie el resultado sin depender del toast visual.
    function announce(message, type) {
      showToast(message, type);
      if (statusRegion) {
        statusRegion.textContent = message;
        statusRegion.className = `form-status ${type}`;
      }
    }

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const value = (name) => form.querySelector(`[name="${name}"]`)?.value.trim() ?? '';
      const name = value('name');
      const email = value('email');
      const message = value('message');
      const consent = form.querySelector('[name="consent"]')?.checked === true;

      // Validacion en cliente solo para dar respuesta inmediata. La que cuenta
      // es la del servidor, que se ejecuta igual aunque se salte esta.
      if (!name || !email || !message) {
        announce('Please fill in all required fields.', 'error');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        announce('Please enter a valid email address.', 'error');
        return;
      }
      if (!consent) {
        announce('Please confirm that we may contact you about this request.', 'error');
        return;
      }

      const payload = {
        name,
        email,
        phone: value('phone'),
        serviceType: value('service') || undefined,
        message,
        consent: true,
        website: value('website'),
      };

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.dataset.label = submitButton.innerHTML;
        submitButton.textContent = 'Sending…';
      }

      try {
        const response = await fetch('/api/v1/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          form.reset();
          announce('Thank you. Your request has been received and we will respond shortly.', 'success');
          return;
        }

        // El backend devuelve { code, message } con un texto pensado para el
        // visitante. Mostrarlo es mejor que un "request failed" generico.
        const body = await response.json().catch(() => null);
        announce(body?.message || 'We could not send your request. Please call us instead.', 'error');
      } catch {
        // Nunca se afirma que se envio si la peticion no llego a completarse.
        announce('We could not reach our server. Please call (201) 312-3509.', 'error');
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          if (submitButton.dataset.label) submitButton.innerHTML = submitButton.dataset.label;
        }
      }
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (event) => {
      const selector = anchor.getAttribute('href');
      if (!selector || selector === '#') return;
      const target = document.querySelector(selector);
      if (!target) return;
      event.preventDefault();
      const offset = (header?.offsetHeight ?? 0) + 8;
      window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
    });
  });
})();
