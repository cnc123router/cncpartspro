/* =============================================
   CNC PARTS PRO — Main JavaScript
   ============================================= */

(function () {
  'use strict';

  /* =============================================
     MOBILE NAV TOGGLE
     ============================================= */
  function initMobileNav() {
    const toggle = document.querySelector('.nav-toggle');
    const drawer = document.querySelector('.nav-drawer');

    if (!toggle || !drawer) return;

    toggle.addEventListener('click', function () {
      const isOpen = drawer.classList.contains('open');
      drawer.classList.toggle('open', !isOpen);
      toggle.setAttribute('aria-expanded', String(!isOpen));
      toggle.textContent = isOpen ? '☰' : '✕';
    });

    // Close drawer on link click
    drawer.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        drawer.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.textContent = '☰';
      });
    });

    // Close on outside click
    document.addEventListener('click', function (e) {
      const nav = document.querySelector('.nav');
      if (nav && !nav.contains(e.target) && !drawer.contains(e.target)) {
        drawer.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.textContent = '☰';
      }
    });
  }

  /* =============================================
     SCROLL-BASED NAV SHADOW
     ============================================= */
  function initNavScroll() {
    const nav = document.querySelector('.nav');
    if (!nav) return;

    function onScroll() {
      if (window.scrollY > 20) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // run on load
  }

  /* =============================================
     INTERSECTION OBSERVER — FADE UP ANIMATIONS
     ============================================= */
  function initScrollAnimations() {
    if (!('IntersectionObserver' in window)) {
      // Fallback: make everything visible
      document.querySelectorAll('.fade-up').forEach(function (el) {
        el.classList.add('visible');
      });
      return;
    }

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    document.querySelectorAll('.fade-up').forEach(function (el) {
      observer.observe(el);
    });
  }

  /* =============================================
     CATEGORY FILTER — SHOP PAGE
     ============================================= */
  function initCategoryFilter() {
    const pills = document.querySelectorAll('.filter-pill');
    const cards = document.querySelectorAll('.product-card[data-category]');

    if (!pills.length || !cards.length) return;

    pills.forEach(function (pill) {
      pill.addEventListener('click', function () {
        // Update active pill
        pills.forEach(function (p) {
          p.classList.remove('active');
        });
        pill.classList.add('active');

        const selected = pill.dataset.filter;

        cards.forEach(function (card) {
          const wrapper = card.closest('.product-card-wrapper') || card;
          if (selected === 'all' || card.dataset.category === selected) {
            wrapper.style.display = '';
            // Re-trigger fade animation
            setTimeout(function () {
              card.classList.add('visible');
            }, 10);
          } else {
            wrapper.style.display = 'none';
          }
        });

        // Update count
        const countEl = document.querySelector('.products-count');
        if (countEl) {
          const visible = Array.from(cards).filter(function (c) {
            return c.closest('.product-card-wrapper')
              ? c.closest('.product-card-wrapper').style.display !== 'none'
              : true;
          });
          countEl.textContent = (selected === 'all' ? cards.length : visible.length) + ' products';
        }
      });
    });
  }

  /* =============================================
     CONTACT FORM — ORDER NUMBER TOGGLE
     ============================================= */
  function initOrderNumberToggle() {
    const subjectSelect = document.getElementById('subject');
    const orderGroup = document.getElementById('order-number-group');

    if (!subjectSelect || !orderGroup) return;

    function toggle() {
      if (subjectSelect.value === 'Order Question') {
        orderGroup.style.display = 'flex';
      } else {
        orderGroup.style.display = 'none';
      }
    }

    subjectSelect.addEventListener('change', toggle);
    toggle(); // run on load
  }

  /* =============================================
     CONTACT FORM — VALIDATION + FORMSPREE
     ============================================= */
  function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    const messageEl = document.getElementById('form-message');

    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      // Basic validation
      let valid = true;
      const required = form.querySelectorAll('[required]');
      required.forEach(function (field) {
        field.style.borderColor = '';
        if (!field.value.trim()) {
          field.style.borderColor = 'var(--danger)';
          valid = false;
        }
      });

      // Message min length
      const msgField = form.querySelector('textarea[name="message"]');
      if (msgField && msgField.value.trim().length < 20) {
        msgField.style.borderColor = 'var(--danger)';
        valid = false;
      }

      if (!valid) {
        showMessage('error', 'Please fill in all required fields. Message must be at least 20 characters.');
        return;
      }

      // Submit to Formspree
      const submitBtn = form.querySelector('[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Sending…';
      submitBtn.disabled = true;

      try {
        const data = new FormData(form);
        const response = await fetch(form.action, {
          method: 'POST',
          body: data,
          headers: { Accept: 'application/json' },
        });

        if (response.ok) {
          form.reset();
          showMessage('success', '✓ Message sent! We\'ll get back to you within 1 business day.');
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
        } else {
          throw new Error('Network response was not ok');
        }
      } catch (err) {
        showMessage('error', 'Something went wrong. Please email us directly at info@cncpartspro.com');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });

    function showMessage(type, text) {
      if (!messageEl) return;
      messageEl.className = 'form-message ' + type;
      messageEl.textContent = text;
      messageEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  /* =============================================
     SMOOTH SCROLL — ANCHOR LINKS
     ============================================= */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          const navHeight = parseInt(
            getComputedStyle(document.documentElement).getPropertyValue('--nav-height') || '72',
            10
          );
          const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 16;
          window.scrollTo({ top: top, behavior: 'smooth' });
        }
      });
    });
  }

  /* =============================================
     ACTIVE NAV LINK HIGHLIGHT
     ============================================= */
  function initActiveNavLink() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a, .nav-drawer a').forEach(function (link) {
      const href = link.getAttribute('href');
      if (href && href.includes(currentPath) && currentPath !== '') {
        link.style.color = 'var(--accent)';
      }
    });
  }

  /* =============================================
     INIT ALL
     ============================================= */
  document.addEventListener('DOMContentLoaded', function () {
    initMobileNav();
    initNavScroll();
    initScrollAnimations();
    initCategoryFilter();
    initOrderNumberToggle();
    initContactForm();
    initSmoothScroll();
    initActiveNavLink();
  });
})();
