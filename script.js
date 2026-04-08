/* ════════════════════════════════════
   SIMO SECURITY — Main Script
   ════════════════════════════════════ */

(function () {
  'use strict';

  /* ── Hamburger / Mobile Nav ── */
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobileNav');

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      const isOpen = mobileNav.classList.toggle('open');
      hamburger.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
    });

    mobileNav.querySelectorAll('.mob-link, .mob-cta').forEach(link => {
      link.addEventListener('click', () => {
        mobileNav.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ── Header scroll state ── */
  const header = document.getElementById('header');
  if (header) {
    const onScroll = () => {
      header.classList.toggle('scrolled', window.scrollY > 50);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── Scroll-reveal animations ── */
  const animEls = document.querySelectorAll('[data-animate]');
  if (animEls.length) {
    // Stagger children inside grids
    document.querySelectorAll('.services-grid, .why-grid, .testi-grid').forEach(grid => {
      grid.querySelectorAll('[data-animate]').forEach((el, i) => {
        el.dataset.delay = i * 110;
      });
    });

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const delay = parseInt(entry.target.dataset.delay || 0, 10);
            setTimeout(() => entry.target.classList.add('visible'), delay);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    animEls.forEach(el => io.observe(el));
  }

  /* ── Active nav link on scroll ── */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');

  if (sections.length && navLinks.length) {
    const sectionObs = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            navLinks.forEach(link => {
              link.classList.toggle('active-link', link.getAttribute('href') === `#${id}`);
            });
          }
        });
      },
      { threshold: 0.4 }
    );
    sections.forEach(s => sectionObs.observe(s));
  }

  /* ── Contact form ── */
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const name = form.querySelector('[name="name"]').value.trim();
      const email = form.querySelector('[name="email"]').value.trim();
      const msg = form.querySelector('[name="message"]').value.trim();

      if (!name || !email || !msg) {
        showToast('Please fill in all required fields.', 'error');
        return;
      }
      const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRx.test(email)) {
        showToast('Please enter a valid email address.', 'error');
        return;
      }

      const orig = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending…';

      setTimeout(() => {
        btn.disabled = false;
        btn.innerHTML = orig;
        form.reset();
        showToast('Message sent! We\'ll be in touch shortly.', 'success');
      }, 1800);
    });
  }

  /* ── Toast ── */
  function showToast(msg, type) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.className = 'toast ' + (type || 'success') + ' show';
    clearTimeout(toast._t);
    toast._t = setTimeout(() => toast.classList.remove('show'), 4200);
  }

  /* ── Smooth scroll (fallback) ── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const sel = anchor.getAttribute('href');
      if (sel === '#') return;
      const target = document.querySelector(sel);
      if (!target) return;
      e.preventDefault();
      const offset = (header ? header.offsetHeight : 0) + 8;
      window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
    });
  });

})();
