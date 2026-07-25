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
    // :not(.mob-toggle) es imprescindible: el boton de Services tambien lleva la
    // clase .mob-link, y sin excluirlo cerraria el menu entero en vez de
    // desplegar su submenu.
    mobileNav
      .querySelectorAll('.mob-link:not(.mob-toggle), .mob-cta, .mob-portal, .mob-submenu a')
      .forEach((link) => {
        link.addEventListener('click', () => {
          mobileNav.classList.remove('open');
          hamburger.classList.remove('open');
          hamburger.setAttribute('aria-expanded', 'false');
        });
      });
  }

  // Menu desplegable de Services. En escritorio el CSS ya lo abre al pasar el
  // raton; esto anade el teclado, que es lo que el hover no cubre.
  const servicesToggle = document.getElementById('servicesToggle');
  const servicesMenu = document.getElementById('servicesMenu');
  if (servicesToggle && servicesMenu) {
    const setOpen = (open) => servicesToggle.setAttribute('aria-expanded', String(open));
    const isOpen = () => servicesToggle.getAttribute('aria-expanded') === 'true';

    servicesToggle.addEventListener('click', (event) => {
      event.preventDefault();
      setOpen(!isOpen());
    });

    document.addEventListener('click', (event) => {
      if (isOpen() && !servicesToggle.parentElement.contains(event.target)) setOpen(false);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape' || !isOpen()) return;
      setOpen(false);
      servicesToggle.focus();
    });

    // Al navegar a un enlace el menu debe quedar cerrado para la siguiente pagina.
    servicesMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => setOpen(false));
    });
  }

  // Categorias plegables: al pulsar una, sus servicios aparecen debajo y las
  // demas se cierran, para que el panel no crezca sin control.
  document.querySelectorAll('.nav-dd-cat').forEach((cat) => {
    const panel = document.getElementById(cat.getAttribute('aria-controls'));
    if (!panel) return;

    cat.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      const abrir = cat.getAttribute('aria-expanded') !== 'true';

      const hermanas = cat.closest('.nav-dd-cols, .mob-submenu');
      hermanas?.querySelectorAll('.nav-dd-cat').forEach((otra) => {
        otra.setAttribute('aria-expanded', 'false');
        document.getElementById(otra.getAttribute('aria-controls'))?.classList.remove('open');
      });

      cat.setAttribute('aria-expanded', String(abrir));
      panel.classList.toggle('open', abrir);
    });
  });

  // La primera categoria arranca abierta: el panel nunca se ve vacio.
  document.querySelectorAll('.nav-dd-cols, .mob-submenu').forEach((cont) => {
    const primera = cont.querySelector('.nav-dd-cat');
    if (!primera) return;
    primera.setAttribute('aria-expanded', 'true');
    document.getElementById(primera.getAttribute('aria-controls'))?.classList.add('open');
  });

  const mobServicesToggle = document.getElementById('mobServicesToggle');
  const mobServicesMenu = document.getElementById('mobServicesMenu');
  if (mobServicesToggle && mobServicesMenu) {
    mobServicesToggle.addEventListener('click', () => {
      const open = mobServicesMenu.classList.toggle('open');
      mobServicesToggle.setAttribute('aria-expanded', String(open));
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
