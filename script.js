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
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const name = form.querySelector('[name="name"]')?.value.trim() ?? '';
      const email = form.querySelector('[name="email"]')?.value.trim() ?? '';
      const phone = form.querySelector('[name="phone"]')?.value.trim() ?? '';
      const service = form.querySelector('[name="service"]')?.value.trim() ?? '';
      const message = form.querySelector('[name="message"]')?.value.trim() ?? '';
      if (!name || !email || !message) {
        showToast('Please fill in all required fields.', 'error');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showToast('Please enter a valid email address.', 'error');
        return;
      }
      const subject = encodeURIComponent(`Website inquiry${service ? ` — ${service}` : ''}`);
      const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\nPhone: ${phone || 'Not provided'}\nService: ${service || 'Not selected'}\n\nMessage:\n${message}`);
      window.location.href = `mailto:athierasimo@gmail.com?subject=${subject}&body=${body}`;
      showToast('Your email app has been opened. Review the message and press Send.');
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
