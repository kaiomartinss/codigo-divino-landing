/* ==========================================================================
   CÓDIGO DIVINO - INTERACTIVE SCRIPTS (GSAP + LENIS + INTERSECTION OBSERVER)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ── 1. Lucide Icons ──────────────────────────────────────────────────────
  if (window.lucide) {
    lucide.createIcons();
  }

  // ── 2. Lenis Smooth Scroll ───────────────────────────────────────────────
  let lenis = null;

  if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true
    });

    // Loop de animação do Lenis via GSAP ticker (se disponível) ou rAF
    if (typeof gsap !== 'undefined') {
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0, 0);
    } else {
      (function rafLoop(time) {
        lenis.raf(time);
        requestAnimationFrame(rafLoop);
      })(0);
    }

    // Scroll suave para âncoras do menu
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = this.getAttribute('href');
        if (target && target !== '#') {
          lenis.scrollTo(target, { offset: -100 });
        }
      });
    });
  }

  // ── 3. Animação Hero (GSAP simples, sem ScrollTrigger) ───────────────────
  if (typeof gsap !== 'undefined') {
    const heroTl = gsap.timeline({ delay: 0.1 });
    heroTl
      .from('.hero-badge',                   { opacity: 0, y: -20, duration: 0.6, ease: 'power2.out' })
      .from('.hero-title',                   { opacity: 0, y: 30,  duration: 0.8, ease: 'power2.out' }, '-=0.3')
      .from('.hero-description',             { opacity: 0, y: 20,  duration: 0.6, ease: 'power2.out' }, '-=0.4')
      .from('.hero-features .feature-pill',  { opacity: 0, y: 15,  stagger: 0.1, duration: 0.5      }, '-=0.3')
      .from('.hero-content .btn-primary',    { opacity: 0, scale: 0.9, duration: 0.6                 }, '-=0.2')
      .from('.product-mockup-frame',         { opacity: 0, scale: 0.95, duration: 0.8               }, '-=0.6');
  }

  // ── 4. Animações de Entrada via IntersectionObserver ─────────────────────
  //
  // Estratégia: os elementos partem visíveis no HTML (sem opacity:0 inline).
  // A classe CSS ".animate-hidden" os torna invisíveis.
  // O IntersectionObserver adiciona ".animate-visible" quando entram na tela,
  // disparando a transição CSS. Assim nenhum bug do ScrollTrigger pode
  // deixar o conteúdo escondido para sempre.

  const animatableGroups = [
    { selector: '.pain-card',     delay: 100 },
    { selector: '.audience-card', delay: 80  },
    { selector: '.content-card',  delay: 100 },
    { selector: '.bonus-card',    delay: 80  },
    { selector: '.guarantee-box', delay: 0   },
    { selector: '.offer-card',    delay: 0   },
    { selector: '.solution-banner', delay: 0 },
    { selector: '.faq-item',      delay: 60  },
  ];

  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -60px 0px', // dispara 60px antes do elemento sair do fundo da tela
    threshold: 0.05
  };

  animatableGroups.forEach(({ selector, delay }) => {
    document.querySelectorAll(selector).forEach((el, index) => {
      el.classList.add('animate-hidden');

      const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.remove('animate-hidden');
              entry.target.classList.add('animate-visible');
            }, index * delay);
            obs.unobserve(entry.target); // executa só uma vez
          }
        });
      }, observerOptions);

      observer.observe(el);
    });
  });

  // ── 5. Contador Regressivo de Urgência ───────────────────────────────────
  function startCountdown() {
    const timerEl = document.getElementById('top-timer');
    if (!timerEl) return;
    let total = 14 * 60 + 59;
    setInterval(() => {
      const m = String(Math.floor(total / 60)).padStart(2, '0');
      const s = String(total % 60).padStart(2, '0');
      timerEl.textContent = `${m}:${s}`;
      total = total <= 0 ? 14 * 60 + 59 : total - 1;
    }, 1000);
  }
  startCountdown();

  // ── 6. FAQ Accordion ─────────────────────────────────────────────────────
  document.querySelectorAll('.faq-item').forEach(item => {
    item.querySelector('.faq-question').addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
      if (!isActive) item.classList.add('active');
    });
  });

  // ── 7. Toast de Prova Social ─────────────────────────────────────────────
  const buyers = [
    { name: 'Carlos M. de México',              time: 'hace 2 minutos' },
    { name: 'María R. de Colombia',             time: 'hace 4 minutos' },
    { name: 'Pastor David G. de Perú',          time: 'hace 7 minutos' },
    { name: 'Ana L. de Argentina',              time: 'hace 1 minuto'  },
    { name: 'Hermana Sofía P. de Guatemala',    time: 'hace 5 minutos' },
    { name: 'Prof. Roberto V. de Estados Unidos', time: 'hace 3 minutos' }
  ];

  const toast = document.getElementById('toast');
  const toastName = document.getElementById('toast-name');

  function showToast() {
    if (!toast || !toastName) return;
    const b = buyers[Math.floor(Math.random() * buyers.length)];
    toastName.textContent = b.name;
    toast.querySelector('.toast-content span').textContent =
      `Acaba de adquirir Código Divino ${b.time} 🔥`;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 4500);
  }

  setTimeout(showToast, 4000);
  setInterval(showToast, 14000);
});

// ── 8. Kiwify Checkout Redirect ───────────────────────────────────────────
function triggerCheckoutRedirect() {
  const emailInput = document.getElementById('user-email');
  const email = emailInput ? emailInput.value.trim() : '';
  const baseUrl = 'https://pay.kiwify.com/qBrAINL';
  
  if (email) {
    window.location.href = `${baseUrl}?email=${encodeURIComponent(email)}`;
  } else {
    window.location.href = baseUrl;
  }
}
