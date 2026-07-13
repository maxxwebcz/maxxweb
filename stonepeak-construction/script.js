/* ================================================================
   STONEPEAK CONSTRUCTION — Demo prezentační web
   Vanilla JS — žádné externí knihovny
   ================================================================ */
(() => {
  'use strict';

  const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* -------------------------------------------------------------
     PRELOADER
     ------------------------------------------------------------- */
  window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    setTimeout(() => {
      preloader.classList.add('loaded');
      document.body.classList.add('is-loaded');
      startHeroTitleReveal();
    }, 900);
  });

  /* -------------------------------------------------------------
     HERO TITLE REVEAL
     ------------------------------------------------------------- */
  function startHeroTitleReveal(){
    const title = document.querySelector('.hero-title');
    if (title) title.classList.add('reveal');
  }

  /* -------------------------------------------------------------
     CURSOR GLOW + DOT (desktop only)
     ------------------------------------------------------------- */
  if (!isTouch){
    const glow = document.getElementById('cursorGlow');
    const dot = document.getElementById('cursorDot');
    let mouseX = 0, mouseY = 0;
    let glowX = 0, glowY = 0;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX; mouseY = e.clientY;
      dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%,-50%)`;
      document.body.classList.add('cursor-active');
    });

    function animateGlow(){
      glowX += (mouseX - glowX) * 0.12;
      glowY += (mouseY - glowY) * 0.12;
      glow.style.transform = `translate(${glowX}px, ${glowY}px) translate(-50%,-50%)`;
      requestAnimationFrame(animateGlow);
    }
    animateGlow();

    document.querySelectorAll('a, button, [data-magnetic], input, textarea, select').forEach(el => {
      el.addEventListener('mouseenter', () => dot.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => dot.classList.remove('cursor-hover'));
    });
  }

  /* -------------------------------------------------------------
     MAGNETIC BUTTONS
     ------------------------------------------------------------- */
  if (!isTouch){
    document.querySelectorAll('[data-magnetic]').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = 'translate(0,0)'; });
    });
  }

  /* -------------------------------------------------------------
     BUTTON RIPPLE EFFECT
     ------------------------------------------------------------- */
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function (e) {
      const rect = this.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size = Math.max(rect.width, rect.height);
      ripple.className = 'ripple';
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
      ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 700);
    });
  });

  /* -------------------------------------------------------------
     SCROLL PROGRESS BAR
     ------------------------------------------------------------- */
  const progressBar = document.getElementById('scrollProgress');
  function updateScrollProgress(){
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = progress + '%';
  }

  /* -------------------------------------------------------------
     NAVBAR: scroll state + hide on scroll down / show on scroll up
     ------------------------------------------------------------- */
  const navbar = document.getElementById('navbar');
  let lastScroll = 0;

  function updateNavbar(){
    const current = window.scrollY;
    navbar.classList.toggle('scrolled', current > 40);

    if (current > lastScroll && current > 200){
      navbar.classList.add('nav-hidden');
    } else {
      navbar.classList.remove('nav-hidden');
    }
    lastScroll = current;
  }

  /* -------------------------------------------------------------
     COMBINED SCROLL HANDLER (rAF throttled)
     ------------------------------------------------------------- */
  let ticking = false;
  function onScroll(){
    if (!ticking){
      requestAnimationFrame(() => {
        updateScrollProgress();
        updateNavbar();
        updateTimelineFill();
        updateHeroParallax();
        ticking = false;
      });
      ticking = true;
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* -------------------------------------------------------------
     MOBILE MENU
     ------------------------------------------------------------- */
  const navToggle = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileMenu');

  navToggle.addEventListener('click', () => {
    const active = navToggle.classList.toggle('active');
    mobileMenu.classList.toggle('active', active);
    navToggle.setAttribute('aria-expanded', active);
    document.body.style.overflow = active ? 'hidden' : '';
  });

  document.querySelectorAll('.mobile-menu-links a').forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('active');
      mobileMenu.classList.remove('active');
      document.body.style.overflow = '';
    });
  });

  /* -------------------------------------------------------------
     SCROLL REVEAL (IntersectionObserver)
     ------------------------------------------------------------- */
  const revealEls = document.querySelectorAll('[data-reveal]');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting){
        const el = entry.target;
        const siblingDelay = Array.from(el.parentElement?.children || [])
          .filter(c => c.hasAttribute && c.hasAttribute('data-reveal'))
          .indexOf(el);
        el.style.setProperty('--reveal-delay', `${Math.min(siblingDelay, 6) * 0.08}s`);
        el.classList.add('in-view');
        revealObserver.unobserve(el);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

  revealEls.forEach(el => revealObserver.observe(el));

  /* -------------------------------------------------------------
     ANIMATED COUNTERS
     ------------------------------------------------------------- */
  const counters = document.querySelectorAll('[data-counter]');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => counterObserver.observe(c));

  function animateCounter(el){
    const target = parseInt(el.getAttribute('data-target'), 10) || 0;
    const duration = 2000;
    const start = performance.now();

    function tick(now){
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      el.textContent = Math.floor(eased * target);
      if (progress < 1){
        requestAnimationFrame(tick);
      } else {
        el.textContent = target;
      }
    }
    requestAnimationFrame(tick);
  }

  /* -------------------------------------------------------------
     TIMELINE PROGRESS FILL + ACTIVE DOTS
     ------------------------------------------------------------- */
  const timelineSection = document.getElementById('timeline');
  const timelineFill = document.getElementById('timelineFill');
  const timelineSteps = document.querySelectorAll('.timeline-step');

  function updateTimelineFill(){
    if (!timelineSection) return;
    const rect = timelineSection.getBoundingClientRect();
    const viewportH = window.innerHeight;
    const start = viewportH * 0.85;
    const end = viewportH * 0.25;
    const total = rect.top - end;
    const range = start - end;
    let progress = 1 - (rect.top - end) / range;
    progress = Math.max(0, Math.min(1, progress));

    timelineFill.style.width = (progress * 100) + '%';

    const activeCount = Math.round(progress * timelineSteps.length);
    timelineSteps.forEach((step, i) => {
      step.classList.toggle('active', i < activeCount);
    });
  }

  /* -------------------------------------------------------------
     HERO PARALLAX (scroll-based) + MOUSE-FOLLOW GRADIENT
     ------------------------------------------------------------- */
  const heroBg = document.getElementById('heroBg');
  const heroSection = document.getElementById('hero');

  function updateHeroParallax(){
    if (!heroSection) return;
    const rect = heroSection.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) return;
    const offset = window.scrollY;
    heroBg.style.transform = `translateY(${offset * 0.35}px)`;
  }

  const heroMouseGradient = document.getElementById('heroMouseGradient');
  if (!isTouch && heroSection && heroMouseGradient){
    heroSection.addEventListener('mousemove', (e) => {
      const rect = heroSection.getBoundingClientRect();
      heroMouseGradient.style.transform = `translate(${e.clientX - rect.left}px, ${e.clientY - rect.top}px) translate(-50%,-50%)`;
    });
  }

  /* -------------------------------------------------------------
     HERO FLOATING PARTICLES (generated once)
     ------------------------------------------------------------- */
  const particlesContainer = document.getElementById('heroParticles');
  if (particlesContainer && !prefersReducedMotion){
    const count = 28;
    for (let i = 0; i < count; i++){
      const p = document.createElement('span');
      p.className = 'particle';
      const left = Math.random() * 100;
      const delay = Math.random() * 12;
      const duration = 10 + Math.random() * 10;
      const scale = 0.5 + Math.random() * 1.4;
      p.style.left = left + '%';
      p.style.bottom = '-10px';
      p.style.animationDelay = delay + 's';
      p.style.animationDuration = duration + 's';
      p.style.transform = `scale(${scale})`;
      particlesContainer.appendChild(p);
    }
  }

  /* -------------------------------------------------------------
     SERVICE CARD TILT / GLOW FOLLOW
     ------------------------------------------------------------- */
  if (!isTouch){
    document.querySelectorAll('[data-tilt]').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty('--mx', x + '%');
        card.style.setProperty('--my', y + '%');

        const rotateX = ((y / 100) - 0.5) * -6;
        const rotateY = ((x / 100) - 0.5) * 6;
        card.style.transform = `translateY(-8px) perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  /* -------------------------------------------------------------
     TESTIMONIAL CAROUSEL
     ------------------------------------------------------------- */
  const track = document.getElementById('carouselTrack');
  const prevBtn = document.getElementById('carouselPrev');
  const nextBtn = document.getElementById('carouselNext');
  const dotsContainer = document.getElementById('carouselDots');

  if (track){
    const cards = track.children.length;
    let perView = getPerView();
    let index = 0;
    let autoplayTimer = null;

    function getPerView(){
      if (window.innerWidth <= 860) return 1;
      if (window.innerWidth <= 1100) return 2;
      return 3;
    }

    function maxIndex(){
      return Math.max(0, cards - perView);
    }

    function renderDots(){
      dotsContainer.innerHTML = '';
      const totalDots = maxIndex() + 1;
      for (let i = 0; i < totalDots; i++){
        const dot = document.createElement('span');
        if (i === index) dot.classList.add('active');
        dot.addEventListener('click', () => { index = i; update(); resetAutoplay(); });
        dotsContainer.appendChild(dot);
      }
    }

    function update(){
      const cardWidth = track.children[0].getBoundingClientRect().width;
      const gap = 24;
      track.style.transform = `translateX(-${index * (cardWidth + gap)}px)`;
      Array.from(dotsContainer.children).forEach((d, i) => d.classList.toggle('active', i === index));
    }

    function next(){ index = index >= maxIndex() ? 0 : index + 1; update(); }
    function prev(){ index = index <= 0 ? maxIndex() : index - 1; update(); }

    function resetAutoplay(){
      clearInterval(autoplayTimer);
      if (!prefersReducedMotion){
        autoplayTimer = setInterval(next, 5500);
      }
    }

    nextBtn.addEventListener('click', () => { next(); resetAutoplay(); });
    prevBtn.addEventListener('click', () => { prev(); resetAutoplay(); });

    window.addEventListener('resize', () => {
      perView = getPerView();
      index = Math.min(index, maxIndex());
      renderDots();
      update();
    });

    renderDots();
    update();
    resetAutoplay();
  }

  /* -------------------------------------------------------------
     SMOOTH ANCHOR SCROLL (offset for fixed navbar)
     ------------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId.length < 2) return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      const navHeight = navbar.offsetHeight;
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight + 1;
      window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  });

  /* -------------------------------------------------------------
     CONTACT FORM (demo submission — no backend)
     ------------------------------------------------------------- */
  const contactForm = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');

  if (contactForm){
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!contactForm.checkValidity()){
        contactForm.reportValidity();
        return;
      }
      formSuccess.classList.add('show');
      setTimeout(() => {
        contactForm.reset();
        formSuccess.classList.remove('show');
      }, 3200);
    });
  }

  /* -------------------------------------------------------------
     GALLERY LIGHTBOX (single-image preview — no next/prev browsing)
     ------------------------------------------------------------- */
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose = document.getElementById('lightboxClose');

  if (lightbox && lightboxImg){
    let lastFocused = null;

    function openLightbox(item){
      const img = item.querySelector('.portfolio-media img');
      if (!img) return;
      const cat = item.querySelector('.portfolio-cat')?.textContent.trim() || '';
      const title = item.querySelector('.portfolio-title')?.textContent.trim() || '';
      lastFocused = document.activeElement;
      lightboxImg.src = img.currentSrc || img.src;
      lightboxImg.alt = img.alt;
      lightboxCaption.textContent = [cat, title].filter(Boolean).join(' — ');
      lightbox.classList.add('active');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      lightboxClose.focus();
    }

    function closeLightbox(){
      lightbox.classList.remove('active');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (lastFocused) lastFocused.focus();
    }

    document.querySelectorAll('.portfolio-item').forEach(item => {
      item.addEventListener('click', () => openLightbox(item));
      item.setAttribute('tabindex', '0');
      item.setAttribute('role', 'button');
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' '){
          e.preventDefault();
          openLightbox(item);
        }
      });
    });

    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightbox.classList.contains('active')) closeLightbox();
    });
  }

})();
