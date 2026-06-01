/* =============================================
   BONAFINA BURGUER — SCRIPT PREMIUM
   ============================================= */

/* ---- LOADING SCREEN ---- */
window.addEventListener('load', () => {
  setTimeout(() => {
    const loading = document.getElementById('loading');
    if (loading) {
      loading.classList.add('hidden');
      setTimeout(() => loading.remove(), 800);
    }
  }, 2000);
});

/* ---- CUSTOM CURSOR ---- */
(function initCursor() {
  const cursor = document.querySelector('.cursor');
  const ring   = document.querySelector('.cursor-ring');
  if (!cursor || !ring) return;
  if (window.matchMedia('(pointer: coarse)').matches) {
    cursor.style.display = 'none';
    ring.style.display   = 'none';
    return;
  }
  let mx = 0, my = 0;
  let rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top  = my + 'px';
  });

  function animRing() {
    rx += (mx - rx) * 0.14;
    ry += (my - ry) * 0.14;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(animRing);
  }
  animRing();

  document.querySelectorAll('a, button, .integration-card, .app-feat-card, .kpi-card, .finance-card').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.style.width = '20px';
      cursor.style.height = '20px';
      ring.style.width = '64px';
      ring.style.height = '64px';
    });
    el.addEventListener('mouseleave', () => {
      cursor.style.width = '10px';
      cursor.style.height = '10px';
      ring.style.width = '40px';
      ring.style.height = '40px';
    });
  });
})();

/* ---- NAVBAR SCROLL ---- */
(function initNavbar() {
  const nav = document.getElementById('navbar');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
})();

/* ---- SMOOTH SCROLL ---- */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

/* ---- REVEAL ON SCROLL ---- */
(function initReveal() {
  const els = document.querySelectorAll('.reveal, .reveal-scale, .reveal-left, .reveal-right');
  if (!els.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
  els.forEach(el => io.observe(el));
})();

/* ---- HERO COUNTER ---- */
(function initCounters() {
  function animCount(el, from, to, suffix, duration) {
    const start = performance.now();
    function step(now) {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(from + (to - from) * ease) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const to  = +el.dataset.to;
      const suf = el.dataset.suffix || '';
      animCount(el, 0, to, suf, 1800);
      io.unobserve(el);
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('[data-counter]').forEach(el => io.observe(el));
})();

/* ---- HERO PARTICLES ---- */
(function initParticles() {
  const container = document.querySelector('.hero-particles');
  if (!container) return;
  const count = window.innerWidth < 600 ? 20 : 50;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.left     = Math.random() * 100 + '%';
    p.style.bottom   = '-10px';
    p.style.width    = (Math.random() * 3 + 1.5) + 'px';
    p.style.height   = p.style.width;
    p.style.animationDuration = (Math.random() * 8 + 6) + 's';
    p.style.animationDelay   = (Math.random() * 10) + 's';
    container.appendChild(p);
  }
})();

/* ---- MOUSE PARALLAX (hero) ---- */
(function initParallax() {
  const hero = document.getElementById('hero');
  if (!hero) return;
  hero.addEventListener('mousemove', e => {
    const cx = window.innerWidth  / 2;
    const cy = window.innerHeight / 2;
    const dx = (e.clientX - cx) / cx;
    const dy = (e.clientY - cy) / cy;
    const logo = hero.querySelector('.hero-logo-img');
    if (logo) logo.style.transform = `translate(${dx * 12}px, ${dy * 8}px) scale(1)`;
  });
})();

/* ---- CHART.JS INIT ---- */
(function initCharts() {
  if (typeof Chart === 'undefined') return;

  Chart.defaults.color = 'rgba(255,255,255,0.4)';
  Chart.defaults.font.family = "'Inter', sans-serif";
  Chart.defaults.borderColor = 'rgba(255,255,255,0.05)';

  const gold     = '#F6B223';
  const goldFade = 'rgba(246,178,35,0.08)';

  /* Vendas line */
  const ctxLine = document.getElementById('chartVendas');
  if (ctxLine) {
    new Chart(ctxLine, {
      type: 'line',
      data: {
        labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
        datasets: [{
          label: 'Vendas (R$)',
          data: [820, 1250, 980, 1480, 1820, 2600, 2200],
          borderColor: gold,
          backgroundColor: function(context) {
            const chart = context.chart;
            const {ctx: c, chartArea} = chart;
            if (!chartArea) return goldFade;
            const gradient = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            gradient.addColorStop(0, 'rgba(246,178,35,0.25)');
            gradient.addColorStop(1, 'rgba(246,178,35,0)');
            return gradient;
          },
          borderWidth: 2.5,
          pointRadius: 4,
          pointBackgroundColor: gold,
          pointBorderColor: '#0B0B0B',
          pointBorderWidth: 2,
          tension: 0.45,
          fill: true,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.04)' } },
          y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { callback: v => 'R$' + v } }
        },
        animation: { duration: 1200, easing: 'easeInOutQuart' },
        interaction: { intersect: false, mode: 'index' }
      }
    });
  }

  /* Pedidos bar */
  const ctxBar = document.getElementById('chartPedidos');
  if (ctxBar) {
    new Chart(ctxBar, {
      type: 'bar',
      data: {
        labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
        datasets: [{
          label: 'Pedidos',
          data: [34, 52, 41, 61, 78, 108, 92],
          backgroundColor: [
            'rgba(246,178,35,0.7)',
            'rgba(246,178,35,0.65)',
            'rgba(246,178,35,0.6)',
            'rgba(246,178,35,0.75)',
            'rgba(246,178,35,0.8)',
            'rgba(246,178,35,1)',
            'rgba(246,178,35,0.85)',
          ],
          borderRadius: 8,
          borderSkipped: false,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false } },
          y: { grid: { color: 'rgba(255,255,255,0.04)' } }
        },
        animation: { duration: 1200, easing: 'easeInOutQuart' }
      }
    });
  }

  /* Categorias doughnut */
  const ctxDough = document.getElementById('chartCategorias');
  if (ctxDough) {
    new Chart(ctxDough, {
      type: 'doughnut',
      data: {
        labels: ['Combos', 'Burgers', 'Bebidas', 'Sobremesas'],
        datasets: [{
          data: [40, 30, 18, 12],
          backgroundColor: ['#F6B223','#FFCC00','rgba(246,178,35,0.45)','rgba(246,178,35,0.2)'],
          borderColor: '#1A1A1A',
          borderWidth: 3,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: { padding: 14, usePointStyle: true, pointStyleWidth: 8 }
          }
        },
        animation: { animateRotate: true, duration: 1200 }
      }
    });
  }

  /* Financeiro line */
  const ctxFin = document.getElementById('chartFinanceiro');
  if (ctxFin) {
    new Chart(ctxFin, {
      type: 'line',
      data: {
        labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
        datasets: [
          {
            label: 'Receita',
            data: [18000, 21000, 19500, 25000, 28000, 32000],
            borderColor: '#34D399',
            backgroundColor: 'rgba(52,211,153,0.08)',
            borderWidth: 2.5,
            tension: 0.4,
            fill: true,
            pointRadius: 4,
            pointBackgroundColor: '#34D399',
          },
          {
            label: 'Despesas',
            data: [12000, 13500, 11800, 15000, 16500, 18000],
            borderColor: '#F87171',
            backgroundColor: 'rgba(248,113,113,0.06)',
            borderWidth: 2.5,
            tension: 0.4,
            fill: true,
            pointRadius: 4,
            pointBackgroundColor: '#F87171',
          },
          {
            label: 'Lucro',
            data: [6000, 7500, 7700, 10000, 11500, 14000],
            borderColor: '#F6B223',
            backgroundColor: 'rgba(246,178,35,0.06)',
            borderWidth: 2.5,
            tension: 0.4,
            fill: true,
            pointRadius: 4,
            pointBackgroundColor: '#F6B223',
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { padding: 16, usePointStyle: true } } },
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.04)' } },
          y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { callback: v => 'R$' + (v/1000).toFixed(0) + 'k' } }
        },
        animation: { duration: 1400 },
        interaction: { intersect: false, mode: 'index' }
      }
    });
  }

  /* Trigger charts on scroll */
  const chartSections = document.querySelectorAll('.chart-container, .finance-big-chart');
  const chartIO = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const canvas = entry.target.querySelector('canvas') || entry.target;
        if (canvas && canvas.chart) canvas.chart.update();
      }
    });
  }, { threshold: 0.3 });
  chartSections.forEach(s => chartIO.observe(s));
})();

/* ---- STOCK BARS ANIMATION ---- */
(function initStockBars() {
  const bars = document.querySelectorAll('.stock-bar-fill');
  if (!bars.length) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animationPlayState = 'running';
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  bars.forEach(b => {
    b.style.animationPlayState = 'paused';
    io.observe(b);
  });
})();

/* ---- MOBILE MENU ---- */
(function initMobileMenu() {
  const btn = document.querySelector('.nav-hamburger');
  const links = document.querySelector('.nav-links');
  if (!btn || !links) return;
  btn.addEventListener('click', () => {
    const open = links.style.display === 'flex';
    links.style.display = open ? 'none' : 'flex';
    links.style.flexDirection = 'column';
    links.style.position = 'absolute';
    links.style.top = '100%';
    links.style.left = '0';
    links.style.right = '0';
    links.style.background = 'rgba(11,11,11,0.97)';
    links.style.padding = '1.5rem 2rem';
    links.style.backdropFilter = 'blur(20px)';
  });
})();

/* ---- PHONE SCREEN CAROUSEL ---- */
(function initPhoneCarousel() {
  const screens = [
    'Início',
    'Cardápio',
    'Combos',
    'Carrinho',
    'Pagamento'
  ];
  const label = document.querySelector('.phone-screen-label');
  if (!label) return;
  let idx = 0;
  setInterval(() => {
    idx = (idx + 1) % screens.length;
    label.style.opacity = '0';
    setTimeout(() => {
      label.textContent = screens[idx];
      label.style.opacity = '1';
    }, 300);
  }, 2200);
})();

/* ---- KPI LIVE UPDATE SIMULATION ---- */
(function initLiveKpi() {
  const vals = document.querySelectorAll('.kpi-value[data-live]');
  if (!vals.length) return;
  setInterval(() => {
    vals.forEach(el => {
      const base = +el.dataset.base;
      const rand = base + Math.floor(Math.random() * base * 0.04 - base * 0.02);
      const fmt  = el.dataset.format || 'number';
      if (fmt === 'currency') {
        el.textContent = 'R$' + rand.toLocaleString('pt-BR', {minimumFractionDigits:0});
      } else {
        el.textContent = rand.toLocaleString('pt-BR');
      }
      el.style.transition = 'color 0.4s';
      el.style.color = '#F6B223';
      setTimeout(() => { el.style.color = ''; }, 600);
    });
  }, 3500);
})();

/* ---- SCROLL PROGRESS ---- */
(function initScrollProgress() {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = (window.scrollY / max) * 100;
    bar.style.width = pct + '%';
  }, { passive: true });
})();

/* ---- VIDEO DO APP — autoplay na viewport + play/pause ---- */
(function initAppVideo() {
  const video = document.getElementById('videoApp');
  const btn   = document.getElementById('appVideoBtn');
  const icon  = document.getElementById('appVideoIcon');
  if (!video) return;

  /* Autoplay ao entrar na viewport */
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        video.play().catch(() => {});
        if (icon) icon.textContent = '⏸';
      } else {
        video.pause();
        if (icon) icon.textContent = '▶';
      }
    });
  }, { threshold: 0.4 });
  io.observe(video);

  /* Botão play/pause */
  if (btn) {
    btn.addEventListener('click', () => {
      if (video.paused) {
        video.play();
        icon.textContent = '⏸';
      } else {
        video.pause();
        icon.textContent = '▶';
      }
    });
  }
})();
