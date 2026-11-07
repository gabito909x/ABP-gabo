/**
 * PROYECTO DE VIDA — INTERACCIONES (páginas carrera y por-que)
 * Unificado con la estética de index.html.
 */

// Fondo: partículas magnéticas
(function initParticulas() {
  const canvas = document.querySelector("#fondo-particulas");
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext("2d");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  function esTemaClaro() { return document.body.classList.contains("tema-claro"); }
  const particulas = [];
  let ancho = 0, alto = 0, escala = 1, cursor = null, marco = 0, visible = !document.hidden, ultimoTiempo = 0;
  const NUM = 120;
  const RADIO_ATRACCION = 180;
  const RADIO_REPULSION = 60;

  function crearParticula() {
    return { x: Math.random() * ancho, y: Math.random() * alto, vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3, radio: Math.random() * 1.5 + 0.5, intensidad: 0 };
  }
  function redimensionar() {
    escala = Math.min(window.devicePixelRatio || 1, 2);
    ancho = window.innerWidth; alto = window.innerHeight;
    canvas.width = Math.round(ancho * escala); canvas.height = Math.round(alto * escala);
    ctx.setTransform(escala, 0, 0, escala, 0, 0);
    particulas.length = 0;
    for (let i = 0; i < NUM; i++) particulas.push(crearParticula());
  }
  function dibujar(tiempo) {
    marco = 0;
    if (!visible) return;
    const factor = ultimoTiempo ? 1 - Math.exp(-(tiempo - ultimoTiempo) / 120) : 1;
    ultimoTiempo = tiempo;
    ctx.clearRect(0, 0, ancho, alto);
    let sigueAnimando = false;
    particulas.forEach(function (p) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > ancho) p.vx *= -1;
      if (p.y < 0 || p.y > alto) p.vy *= -1;
      p.x = Math.max(0, Math.min(ancho, p.x)); p.y = Math.max(0, Math.min(alto, p.y));
      let objetivo = 0;
      if (cursor && !reduceMotion.matches && finePointer.matches) {
        const dx = cursor.x - p.x, dy = cursor.y - p.y;
        const dist = Math.hypot(dx, dy);
        if (dist < RADIO_ATRACCION) {
          objetivo = 1 - dist / RADIO_ATRACCION;
          if (dist > RADIO_REPULSION) { p.vx += dx * 0.00008; p.vy += dy * 0.00008; }
          else { p.vx -= dx * 0.0003; p.vy -= dy * 0.0003; }
        }
      }
      p.vx *= 0.99; p.vy *= 0.99;
      const vel = Math.hypot(p.vx, p.vy);
      if (vel > 1.5) { p.vx = (p.vx / vel) * 1.5; p.vy = (p.vy / vel) * 1.5; }
      p.intensidad += (objetivo - p.intensidad) * factor;
      if (Math.abs(objetivo - p.intensidad) > 0.003) sigueAnimando = true;
      const radio = p.radio + p.intensidad * 3.5;
      const alpha = 0.25 + p.intensidad * 0.7;
      let baseR, baseG, baseB, activoR, activoG, activoB;
      if (esTemaClaro()) {
        baseR = 28; baseG = 23; baseB = 18; activoR = 184; activoG = 92; activoB = 42;
      } else {
        baseR = 100; baseG = 116; baseB = 139; activoR = 59; activoG = 130; activoB = 246;
      }
      const r = Math.round(baseR + (activoR - baseR) * p.intensidad);
      const g = Math.round(baseG + (activoG - baseG) * p.intensidad);
      const b = Math.round(baseB + (activoB - baseB) * p.intensidad);
      ctx.beginPath();
      ctx.arc(p.x, p.y, radio, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
      ctx.fill();
    });
    if (sigueAnimando || (cursor && !reduceMotion.matches && finePointer.matches)) {
      marco = window.requestAnimationFrame(dibujar);
    } else {
      ultimoTiempo = 0;
    }
  }
  function solicitarDibujo() { if (visible && !marco) marco = window.requestAnimationFrame(dibujar); }
  window.addEventListener("pointermove", function (e) {
    if (e.pointerType !== "mouse" || reduceMotion.matches || !finePointer.matches) return;
    cursor = { x: e.clientX, y: e.clientY }; solicitarDibujo();
  });
  window.addEventListener("pointerleave", function () { cursor = null; solicitarDibujo(); });
  window.addEventListener("resize", redimensionar);
  document.addEventListener("visibilitychange", function () {
    visible = !document.hidden;
    if (!visible && marco) { window.cancelAnimationFrame(marco); marco = 0; }
    else { solicitarDibujo(); }
  });
  redimensionar(); solicitarDibujo();
})();

// Theme toggle
(function initThemeToggle() {
  const themeToggle = document.querySelector(".theme-toggle");
  if (!themeToggle) return;
  const temaGuardado = localStorage.getItem("tema");
  if (temaGuardado === "claro") {
    document.body.classList.add("tema-claro");
    themeToggle.textContent = "○";
  }
  themeToggle.addEventListener("click", function () {
    const esClaro = document.body.classList.toggle("tema-claro");
    themeToggle.textContent = esClaro ? "○" : "◐";
    localStorage.setItem("tema", esClaro ? "claro" : "oscuro");
  });
})();

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initPage1Drag3D();
  initPage2HorizontalScroll();
  initPage3CardFlip();
  initReveal();
});

/* ==========================================================================
   1. MENÚ MÓVIL
   ========================================================================== */
function initMobileMenu() {
  const toggle = document.querySelector('.mobile-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      navLinks.classList.toggle('is-open');
      const isOpen = navLinks.classList.contains('is-open');
      toggle.setAttribute('aria-expanded', isOpen);
      toggle.textContent = isOpen ? '[ CERRAR ✕ ]' : '[ MENÚ ☰ ]';
    });
    // Cerrar al hacer clic en un enlace
    navLinks.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => {
        navLinks.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.textContent = '[ MENÚ ☰ ]';
      });
    });
  }
}

/* ==========================================================================
   2. TARJETA 3D INTERACTIVA (página carrera, si existe)
   ========================================================================== */
function initPage1Drag3D() {
  const card = document.getElementById('interactive-profile-card');
  const container = document.getElementById('interactive-card-wrapper');
  if (!card || !container) return;

  let isDragging = false;
  let startX = 0, startY = 0;
  let currentRotX = 0, currentRotY = 0, currentTransX = 0, currentTransY = 0;

  container.style.perspective = '1200px';
  card.style.transformStyle = 'preserve-3d';
  card.style.willChange = 'transform';
  card.style.cursor = 'grab';

  function onPointerDown(e) {
    isDragging = true;
    card.style.cursor = 'grabbing';
    card.style.transition = 'none';
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    startX = clientX; startY = clientY;
  }
  function onPointerMove(e) {
    if (!isDragging) return;
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    const deltaX = clientX - startX;
    const deltaY = clientY - startY;
    currentRotY = Math.max(-35, Math.min(35, deltaX * 0.18));
    currentRotX = Math.max(-35, Math.min(35, -deltaY * 0.18));
    currentTransX = Math.max(-40, Math.min(40, deltaX * 0.15));
    currentTransY = Math.max(-40, Math.min(40, deltaY * 0.15));
    card.style.transform = `translate3d(${currentTransX}px, ${currentTransY}px, 30px) rotateX(${currentRotX}deg) rotateY(${currentRotY}deg)`;
  }
  function onPointerUp() {
    if (!isDragging) return;
    isDragging = false;
    card.style.cursor = 'grab';
    card.style.transition = 'transform 0.65s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    card.style.transform = 'translate3d(0, 0, 0) rotateX(0deg) rotateY(0deg)';
  }

  container.addEventListener('mousedown', onPointerDown);
  window.addEventListener('mousemove', onPointerMove);
  window.addEventListener('mouseup', onPointerUp);
  container.addEventListener('touchstart', onPointerDown, { passive: true });
  window.addEventListener('touchmove', onPointerMove, { passive: true });
  window.addEventListener('touchend', onPointerUp);
  window.addEventListener('touchcancel', onPointerUp);
}

/* ==========================================================================
   3. CARRUSEL HORIZONTAL (página carrera)
   ========================================================================== */
function initPage2HorizontalScroll() {
  const slider = document.getElementById('career-slider');
  const btnPrev = document.getElementById('slide-prev');
  const btnNext = document.getElementById('slide-next');
  if (!slider) return;

  let isDown = false, startX, scrollLeft;
  slider.addEventListener('mousedown', (e) => {
    isDown = true; slider.classList.add('is-dragging');
    startX = e.pageX - slider.offsetLeft; scrollLeft = slider.scrollLeft;
  });
  slider.addEventListener('mouseleave', () => { isDown = false; slider.classList.remove('is-dragging'); });
  slider.addEventListener('mouseup', () => { isDown = false; slider.classList.remove('is-dragging'); });
  slider.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - slider.offsetLeft;
    const walk = (x - startX) * 1.6;
    slider.scrollLeft = scrollLeft - walk;
  });
  if (btnNext) btnNext.addEventListener('click', () => slider.scrollBy({ left: 380, behavior: 'smooth' }));
  if (btnPrev) btnPrev.addEventListener('click', () => slider.scrollBy({ left: -380, behavior: 'smooth' }));
}

/* ==========================================================================
   4. FLIP CARDS (página por-que)
   ========================================================================== */
function initPage3CardFlip() {
  const flipCards = document.querySelectorAll('.flip-card');
  flipCards.forEach((card) => {
    card.addEventListener('click', (e) => {
      if (e.target.tagName.toLowerCase() === 'a') return;
      card.classList.toggle('is-flipped');
    });
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', 'Haz clic o presiona Enter para voltear la tarjeta y ver más detalles');
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.classList.toggle('is-flipped');
      }
    });
  });
}

/* ==========================================================================
   5. REVEAL AL SCROLL (sutil)
   ========================================================================== */
function initReveal() {
  if (!('IntersectionObserver' in window)) return;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduceMotion.matches) return;
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('section, .career-card-item, .flip-card, .plan-block').forEach((el) => {
    el.classList.add('revelar');
    observer.observe(el);
  });
}

// Inyectar estilos de reveal si no existen
(function injectRevealStyles() {
  if (document.getElementById('reveal-styles')) return;
  const style = document.createElement('style');
  style.id = 'reveal-styles';
  style.textContent = '.js-activo .revelar{opacity:0;transform:translateY(20px);transition:opacity .5s ease,transform .5s cubic-bezier(.16,1,.3,1)}.js-activo .revelar.visible{opacity:1;transform:translateY(0)}';
  document.head.appendChild(style);
  document.documentElement.classList.add('js-activo');
})();
