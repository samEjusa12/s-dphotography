// S&D Photography Portfolio Website JavaScript
// Handles navbar, lightbox, marquee, and accessibility

document.addEventListener('DOMContentLoaded', function () {
  const body = document.body;
  const themeToggle = document.querySelector('.theme-toggle');
  const themeToggleLabel = themeToggle?.querySelector('.theme-toggle-label');

  function getPreferredTheme() {
    const storedTheme = localStorage.getItem('sd-theme');
    if (storedTheme === 'light' || storedTheme === 'dark') {
      return storedTheme;
    }

    return 'light';
  }

  function updateThemeToggle(theme) {
    if (!themeToggle || !themeToggleLabel) {
      return;
    }

    const isDark = theme === 'dark';
    themeToggle.setAttribute('aria-pressed', String(isDark));
    themeToggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    themeToggleLabel.textContent = isDark ? 'Light mode' : 'Dark mode';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    body.setAttribute('data-theme', theme);
    updateThemeToggle(theme);
  }

  applyTheme(body.getAttribute('data-theme') || getPreferredTheme());

  themeToggle?.addEventListener('click', function () {
    const nextTheme = body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    localStorage.setItem('sd-theme', nextTheme);
    applyTheme(nextTheme);
  });

  // Navbar hamburger menu
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  const navDropdown = document.querySelector('.nav-dropdown');
  const navDropdownToggle = document.querySelector('.nav-dropdown-toggle');
  const navDropdownMenu = document.querySelector('.nav-dropdown .dropdown-menu');
  const isHomePage = window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/');

  function closeServicesDropdown() {
    if (!navDropdown || !navDropdownToggle) {
      return;
    }

    navDropdown.classList.remove('dropdown-open');
    navDropdownToggle.setAttribute('aria-expanded', 'false');
  }

  function openServicesDropdown() {
    if (!navDropdown || !navDropdownToggle) {
      return;
    }

    navDropdown.classList.add('dropdown-open');
    navDropdownToggle.setAttribute('aria-expanded', 'true');
  }

  function closeNavMenu() {
    navLinks.classList.remove('open');
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open navigation menu');
    closeServicesDropdown();
  }

  navToggle.addEventListener('click', function () {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', !expanded);
    navToggle.setAttribute('aria-label', expanded ? 'Open navigation menu' : 'Close navigation menu');
    navLinks.classList.toggle('open');
    navToggle.classList.toggle('open');
    if (expanded) {
      closeServicesDropdown();
    }
  });

  // Keyboard accessibility for hamburger
  navToggle.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      navToggle.click();
    }
  });

  // Close menu with Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') {
      return;
    }

    if (navDropdown?.classList.contains('dropdown-open')) {
      closeServicesDropdown();
      navDropdownToggle.focus();
      return;
    }

    if (navLinks.classList.contains('open')) {
      closeNavMenu();
      navToggle.focus();
    }
  });

  if (navDropdown && navDropdownToggle && navDropdownMenu) {
    navDropdownToggle.addEventListener('click', function () {
      const isOpen = navDropdown.classList.contains('dropdown-open');
      if (isOpen) {
        closeServicesDropdown();
        return;
      }

      openServicesDropdown();
    });

    navDropdownToggle.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        openServicesDropdown();
        navDropdownMenu.querySelector('a')?.focus();
      }
    });

    document.addEventListener('click', function (e) {
      if (!navDropdown.contains(e.target)) {
        closeServicesDropdown();
      }
    });
  }

  function findNavLinkByHash(hash) {
    return document.querySelector('.nav-links a[href="' + hash + '"]') ||
      document.querySelector('.nav-links a[href="index.html' + hash + '"]');
  }

  // Active nav link on scroll
  const sections = document.querySelectorAll('section[id]');
  const navItems = document.querySelectorAll('.nav-links a');
  function setActiveNav() {
    if (!isHomePage || sections.length === 0) {
      return;
    }

    navItems.forEach(link => link.classList.remove('active'));
    if (window.scrollY < 100) {
      const homeLink = document.querySelector('.nav-links a[href="index.html"]');
      if (homeLink) homeLink.classList.add('active');
      return;
    }

    let index = sections.length;
    while (--index && window.scrollY + 80 < sections[index].offsetTop) {}
    if (sections[index]) {
      const id = '#' + sections[index].id;
      const activeLink = findNavLinkByHash(id);
      if (activeLink) activeLink.classList.add('active');
    }
  }
  if (isHomePage && sections.length > 0) {
    setActiveNav();
    window.addEventListener('scroll', setActiveNav);
  }

  // Smooth scroll for nav links
  navItems.forEach(link => {
    link.addEventListener('click', function (e) {
      const href = link.getAttribute('href');
      const hashIndex = href.indexOf('#');
      if (hashIndex !== -1) {
        const hash = href.slice(hashIndex);
        if (hash === '#home' && isHomePage) {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: 'smooth' });
          closeNavMenu();
          navItems.forEach(item => item.classList.remove('active'));
          link.classList.add('active');
          return;
        }
        const target = document.querySelector(hash);
        if (!target) {
          return;
        }
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
        closeNavMenu();
        navItems.forEach(item => item.classList.remove('active'));
        link.classList.add('active');
      } else if (href === 'index.html' && isHomePage) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        closeNavMenu();
        navItems.forEach(item => item.classList.remove('active'));
        link.classList.add('active');
      }
    });
  });

  // Marquee duplication for infinite effect
  function duplicateMarquee(selector) {
    const track = document.querySelector(selector);
    if (track) {
      track.innerHTML += track.innerHTML;
    }
  }
  duplicateMarquee('.marquee-track');
  duplicateMarquee('.testimonials-track');

  // Lightbox functionality
  const lightbox = document.querySelector('.lightbox');
  const lightboxImg = document.querySelector('.lightbox-img');
  const lightboxClose = document.querySelector('.lightbox-close');
  const galleryImgs = document.querySelectorAll('.portfolio-grid img');
  let lastFocusedImg = null;

  function openLightbox(src, alt, imgEl) {
    if (!lightbox || !lightboxImg) {
      return;
    }

    lightbox.classList.add('active');
    lightboxImg.src = src;
    lightboxImg.alt = alt;
    lightbox.setAttribute('aria-hidden', 'false');
    lightbox.focus();
    lastFocusedImg = imgEl;
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox() {
    if (!lightbox || !lightboxImg) {
      return;
    }

    lightbox.classList.remove('active');
    lightboxImg.src = '';
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocusedImg) lastFocusedImg.focus();
  }
  galleryImgs.forEach(img => {
    img.addEventListener('click', () => openLightbox(img.src, img.alt, img));
    img.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(img.src, img.alt, img);
      }
    });
  });
  lightboxClose?.addEventListener('click', closeLightbox);
  lightbox?.addEventListener('click', e => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', e => {
    if (lightbox?.classList.contains('active') && (e.key === 'Escape' || e.key === 'Esc')) {
      closeLightbox();
    }
  });

  // Accessibility: trap focus in lightbox
  lightbox?.addEventListener('keydown', function (e) {
    if (!lightbox.classList.contains('active')) return;
    const focusable = [lightboxClose, lightboxImg];
    let idx = focusable.indexOf(document.activeElement);
    if (e.key === 'Tab') {
      e.preventDefault();
      if (e.shiftKey) {
        idx = (idx - 1 + focusable.length) % focusable.length;
      } else {
        idx = (idx + 1) % focusable.length;
      }
      focusable[idx].focus();
    }
  });

  const contactForm = document.querySelector('[data-formspree-form]');
  const contactFormStatus = contactForm?.querySelector('.contact-form-status');
  const contactSubmitButton = contactForm?.querySelector('button[type="submit"]');

  function setContactFormStatus(state, message) {
    if (!contactFormStatus) {
      return;
    }

    contactFormStatus.hidden = false;
    contactFormStatus.className = 'contact-form-status';

    if (state) {
      contactFormStatus.classList.add('is-' + state);
    }

    contactFormStatus.textContent = message;
  }

  contactForm?.addEventListener('submit', async function (event) {
    event.preventDefault();

    const endpoint = contactForm.getAttribute('action') || '';
    if (!endpoint || endpoint.indexOf('REPLACE_WITH_YOUR_FORM_ID') !== -1) {
      setContactFormStatus('error', 'Replace the Formspree form ID in contact.html before using the contact form.');
      return;
    }

    if (contactSubmitButton) {
      contactSubmitButton.disabled = true;
      contactSubmitButton.textContent = 'Sending...';
    }

    setContactFormStatus('pending', 'Sending your enquiry...');

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: new FormData(contactForm),
        headers: {
          Accept: 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Form submission failed.');
      }

      contactForm.reset();
      setContactFormStatus('success', 'Thanks. Your enquiry has been sent and S&D Photography will get back to you soon.');
    } catch (error) {
      setContactFormStatus('error', 'The message could not be sent right now. Please try again in a moment or email us directly.');
    } finally {
      if (contactSubmitButton) {
        contactSubmitButton.disabled = false;
        contactSubmitButton.textContent = 'Send Message';
      }
    }
  });
});

