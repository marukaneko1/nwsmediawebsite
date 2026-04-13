'use strict';

/* ═══════════════════════════════════════════════════════════════════════════
   NWS MEDIA — SCRIPT.JS
   Lenis | Magnetic | TextReveal | BentoTilt | ColorTransitions | Cursor
   ═══════════════════════════════════════════════════════════════════════════ */

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&!?<>';
const NWS_LETTERS = ['N', 'W', 'S'];
const SCRAMBLE_ROUNDS = 14;
const SCRAMBLE_STEP = 50;
const SCRAMBLE_DELAY = 140;

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const rand = (a, b) => a + Math.random() * (b - a);
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const rChar = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];

// ─── DEVICE DETECTION ────────────────────────────────────────────────────────
const isTouchDevice = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
const isMobileViewport = () => window.innerWidth <= 768;

// ─── STATE ───────────────────────────────────────────────────────────────────
let mouseX = -100, mouseY = -100;
let lenis = null;

/* ═══════════════════════════════════════════════════════════════════════════
   1. LENIS — Smooth inertial scrolling synced with GSAP ScrollTrigger
   ═══════════════════════════════════════════════════════════════════════════ */
function initLenis() {
  if (typeof Lenis === 'undefined') return;

  lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    touchMultiplier: 2,
  });

  // Sync Lenis scroll position with ScrollTrigger on every frame
  lenis.on('scroll', ScrollTrigger.update);

  // Use GSAP ticker as the single RAF loop — prevents jitter
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  // Disable Lenis's own RAF since GSAP ticker drives it
  gsap.ticker.lagSmoothing(0);
}

/* ═══════════════════════════════════════════════════════════════════════════
   2. CURSOR — High-performance via GSAP quickSetter
   ═══════════════════════════════════════════════════════════════════════════ */
function initCursor() {
  if (isTouchDevice || isMobileViewport()) return;
  const dot = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;

  // quickSetter for zero-overhead transform updates
  const setDotX = gsap.quickSetter(dot, 'x', 'px');
  const setDotY = gsap.quickSetter(dot, 'y', 'px');
  const setRingX = gsap.quickSetter(ring, 'x', 'px');
  const setRingY = gsap.quickSetter(ring, 'y', 'px');

  let ringX = -100, ringY = -100;

  // Offset to center the elements (they're positioned at top:0, left:0)
  const dotOff = () => dot.offsetWidth / 2;
  const ringOff = () => ring.offsetWidth / 2;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // Tied to GSAP ticker for sync with Lenis — no separate RAF loop
  gsap.ticker.add(() => {
    setDotX(mouseX - dotOff());
    setDotY(mouseY - dotOff());
    ringX = lerp(ringX, mouseX, 0.12);
    ringY = lerp(ringY, mouseY, 0.12);
    setRingX(ringX - ringOff());
    setRingY(ringY - ringOff());
  });

  // Hover state
  const targets = 'a, button, .btn-primary, .btn-ghost, .cta-btn, .pricing-btn, .pill, .pill-logo, .service-card, [data-cursor-hover]';
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(targets)) document.body.classList.add('cursor-hover');
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(targets)) document.body.classList.remove('cursor-hover');
  });
}

/* ═══════════════════════════════════════════════════════════════════════════
   3. MAGNETIC — Reusable magnetic pull effect for interactive elements
   ═══════════════════════════════════════════════════════════════════════════ */
function initMagnetic() {
  if (isTouchDevice || isMobileViewport()) return;
  const magneticEls = document.querySelectorAll('.btn-primary, .btn-ghost, .pill, .cta-btn, .pricing-btn, .footer-contact-btn');
  const STRENGTH = 0.35;  // How far element pulls (0–1)
  const RADIUS = 30;      // Activation radius beyond bounds in px

  magneticEls.forEach((el) => {
    const inner = el.querySelector('span') || el; // pull inner span if exists

    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxDist = Math.max(rect.width, rect.height) / 2 + RADIUS;

      if (dist < maxDist) {
        const pull = 1 - (dist / maxDist);
        gsap.to(el, {
          x: dx * STRENGTH * pull,
          y: dy * STRENGTH * pull,
          duration: 0.4,
          ease: 'power2.out',
          overwrite: 'auto',
        });
        // Inner element gets extra pull for parallax feel
        if (inner !== el) {
          gsap.to(inner, {
            x: dx * STRENGTH * pull * 0.3,
            y: dy * STRENGTH * pull * 0.3,
            duration: 0.4,
            ease: 'power2.out',
            overwrite: 'auto',
          });
        }
      }
    });

    el.addEventListener('mouseleave', () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.3)', overwrite: 'auto' });
      if (inner !== el) {
        gsap.to(inner, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.3)', overwrite: 'auto' });
      }
    });
  });
}

/* ═══════════════════════════════════════════════════════════════════════════
   4. TEXT REVEAL — Overflow-masked character slide-up (SplitType-style)
   ═══════════════════════════════════════════════════════════════════════════ */

// Split text into lines, then characters, wrapped in overflow:hidden masks
function splitIntoMaskedChars(el) {
  // First pass: split into individual character spans
  const chars = [];
  const fragment = document.createDocumentFragment();

  el.childNodes.forEach(node => {
    if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'BR') {
      fragment.appendChild(document.createElement('br'));
    } else if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent;
      for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (/\s/.test(ch)) {
          fragment.appendChild(document.createTextNode(ch));
        } else {
          const mask = document.createElement('span');
          mask.className = 'line-mask';
          mask.style.display = 'inline-block';
          mask.style.overflow = 'hidden';
          mask.style.verticalAlign = 'top';
          const span = document.createElement('span');
          span.className = 'split-char';
          span.textContent = ch;
          span.style.display = 'inline-block';
          mask.appendChild(span);
          fragment.appendChild(mask);
          chars.push(span);
        }
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const clone = node.cloneNode(true);
      fragment.appendChild(clone);
    }
  });

  el.innerHTML = '';
  el.appendChild(fragment);
  return chars;
}

// Simpler word-level split for hero blur animation
function splitIntoWords(el) {
  const fragment = document.createDocumentFragment();
  const words = [];

  el.childNodes.forEach(node => {
    if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'BR') {
      fragment.appendChild(document.createElement('br'));
    } else if (node.nodeType === Node.TEXT_NODE) {
      const parts = node.textContent.split(/(\s+)/);
      parts.forEach(part => {
        if (/^\s+$/.test(part)) {
          fragment.appendChild(document.createTextNode(' '));
        } else if (part) {
          const span = document.createElement('span');
          span.className = 'blur-word';
          span.textContent = part;
          fragment.appendChild(span);
          words.push(span);
        }
      });
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const clone = node.cloneNode(true);
      fragment.appendChild(clone);
    }
  });

  el.innerHTML = '';
  el.appendChild(fragment);
  return words;
}

function initTextReveal() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  // Character-by-character masked slide-up on section headings
  const headingSelectors = [
    '.value-heading',
    '#infrastructure .section-heading',
    '#media .section-heading',
    '#verticals .section-heading',
    '#process .section-heading',
    '#pricing .section-heading',
    '#difference .section-heading',
    '#faq .section-heading',
    '.cta-heading'
  ];

  headingSelectors.forEach(sel => {
    const el = document.querySelector(sel);
    if (!el) return;
    const chars = splitIntoMaskedChars(el);
    if (chars.length === 0) return;

    // Start each char translated 110% down (hidden inside the mask)
    gsap.set(chars, { yPercent: 110 });
    el.style.visibility = 'visible';

    gsap.to(chars, {
      yPercent: 0,
      duration: 1.0,
      stagger: 0.018,
      ease: 'power4.out',
      scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' }
    });
  });

  // Whole-element blur fade on body text (FOUC-safe with autoAlpha)
  const bodySelectors = ['.section-label', '.value-text', '.section-body', '.cta-sub'];

  bodySelectors.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => {
      gsap.fromTo(el,
        { autoAlpha: 0, y: 20, filter: 'blur(8px)' },
        { autoAlpha: 1, y: 0, filter: 'blur(0px)',
          duration: 0.8, delay: 0.15, ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' } }
      );
    });
  });

  // CTA button — blur fade
  const ctaBtn = document.querySelector('.cta-btn');
  if (ctaBtn) {
    gsap.fromTo(ctaBtn,
      { autoAlpha: 0, y: 16, filter: 'blur(6px)' },
      { autoAlpha: 1, y: 0, filter: 'blur(0px)',
        duration: 0.7, delay: 0.3, ease: 'power2.out',
        scrollTrigger: { trigger: ctaBtn, start: 'top 90%', toggleActions: 'play none none none' } }
    );
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   5. BENTO TILT — 3D tilt + spotlight tracking on magic-bento cards
   ═══════════════════════════════════════════════════════════════════════════ */
function initBentoTilt() {
  if (isTouchDevice || isMobileViewport()) return;
  const cards = document.querySelectorAll('.magic-bento');
  const TILT_MAX = 6; // Max degrees of rotation

  cards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;

      // Normalized -1 to 1
      const nx = (x - cx) / cx;
      const ny = (y - cy) / cy;

      // Set spotlight position (CSS custom properties)
      card.style.setProperty('--mx', x + 'px');
      card.style.setProperty('--my', y + 'px');

      // Apply 3D tilt via GSAP for smooth interpolation
      gsap.to(card, {
        rotateY: nx * TILT_MAX,
        rotateX: -ny * TILT_MAX,
        duration: 0.45,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    });

    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.7,
        ease: 'elastic.out(1, 0.5)',
        overwrite: 'auto',
      });
    });
  });
}

/* ═══════════════════════════════════════════════════════════════════════════
   6. STAGGERED SCROLL REVEALS — Cards unfold with rotation
   ═══════════════════════════════════════════════════════════════════════════ */
function initScrollReveals() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  // Fade out hero scroll hint
  gsap.to('.hero-scroll-hint', {
    opacity: 0,
    scrollTrigger: { trigger: '#hero', start: 'top top', end: '+=100', scrub: true },
  });

  // Service pills — staggered fade
  const servicePills = document.querySelectorAll('.service-pill');
  if (servicePills.length) {
    gsap.fromTo(servicePills,
      { autoAlpha: 0, y: 20, filter: 'blur(4px)' },
      { autoAlpha: 1, y: 0, filter: 'blur(0px)',
        duration: 0.6, stagger: 0.06, ease: 'power3.out',
        scrollTrigger: { trigger: '.service-pills', start: 'top 88%', toggleActions: 'play none none none' } }
    );
  }

  // Vertical cards — staggered unfold
  const verticalCards = document.querySelectorAll('.vertical-card');
  if (verticalCards.length) {
    gsap.fromTo(verticalCards,
      { autoAlpha: 0, y: 80, rotateX: -8, transformOrigin: 'center bottom' },
      { autoAlpha: 1, y: 0, rotateX: 0,
        duration: 1.0, stagger: 0.1, ease: 'power4.out',
        scrollTrigger: { trigger: '.verticals-grid', start: 'top 82%', toggleActions: 'play none none none' } }
    );
  }

  // Process steps — staggered fade
  const processSteps = document.querySelectorAll('.process-step');
  if (processSteps.length) {
    gsap.fromTo(processSteps,
      { autoAlpha: 0, y: 60, rotateX: -6, transformOrigin: 'center bottom' },
      { autoAlpha: 1, y: 0, rotateX: 0,
        duration: 0.9, stagger: 0.12, ease: 'power4.out',
        scrollTrigger: { trigger: '.process-grid', start: 'top 82%', toggleActions: 'play none none none' } }
    );
  }

  // Differentiator items — staggered slide-in
  const diffItems = document.querySelectorAll('.differentiator-item');
  if (diffItems.length) {
    gsap.fromTo(diffItems,
      { autoAlpha: 0, x: -30, filter: 'blur(4px)' },
      { autoAlpha: 1, x: 0, filter: 'blur(0px)',
        duration: 0.7, stagger: 0.08, ease: 'power3.out',
        scrollTrigger: { trigger: '.differentiator-list', start: 'top 85%', toggleActions: 'play none none none' } }
    );
  }

  // Pricing cards — staggered unfold
  const pricingCards = document.querySelectorAll('.pricing-card');
  if (pricingCards.length) {
    gsap.fromTo(pricingCards,
      { autoAlpha: 0, y: 80, rotateX: -8, transformOrigin: 'center bottom' },
      { autoAlpha: 1, y: 0, rotateX: 0,
        duration: 1.0, stagger: 0.15, ease: 'power4.out',
        scrollTrigger: { trigger: '.pricing-grid', start: 'top 82%', toggleActions: 'play none none none' } }
    );
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   7. COLOR TRANSITIONS — Dynamic bg color per section via ScrollTrigger
   ═══════════════════════════════════════════════════════════════════════════ */
function initColorTransitions() {
  // Color transitions disabled — uniform dark background throughout
}

/* ═══════════════════════════════════════════════════════════════════════════
   LOADER / TEXT SCRAMBLE
   ═══════════════════════════════════════════════════════════════════════════ */
function runLoader() {
  return new Promise((resolve) => {
    const overlay = document.getElementById('loader-overlay');
    const chars = document.querySelectorAll('.loader-char');
    const accentLine = document.querySelector('.loader-accent-line');
    const tagline = document.querySelector('.loader-tagline');

    if (!overlay || chars.length === 0) { resolve(); return; }

    let completed = 0;

    chars.forEach((span, i) => {
      let frame = 0;
      setTimeout(() => {
        const iv = setInterval(() => {
          if (frame < SCRAMBLE_ROUNDS) {
            span.textContent = rChar();
            span.classList.add('scrambling');
            frame++;
          } else {
            clearInterval(iv);
            span.textContent = NWS_LETTERS[i];
            span.classList.remove('scrambling');
            completed++;
            if (completed === chars.length) {
              setTimeout(() => {
                if (accentLine) accentLine.classList.add('show');
                if (tagline) tagline.classList.add('show');
                document.querySelectorAll('.corner').forEach(c => c.classList.add('show'));
                setTimeout(() => {
                  overlay.classList.add('hide');
                  const nav = document.getElementById('pill-nav');
                  if (nav) nav.classList.add('show');
                  setTimeout(resolve, 900);
                }, 1200);
              }, 200);
            }
          }
        }, SCRAMBLE_STEP);
      }, i * SCRAMBLE_DELAY);
    });
  });
}

/* ═══════════════════════════════════════════════════════════════════════════
   PILL NAV — Hover circle expand + scroll state
   ═══════════════════════════════════════════════════════════════════════════ */
function initPillNav() {
  const pills = document.querySelectorAll('.pill');

  pills.forEach((pill) => {
    const circle = pill.querySelector('.hover-circle');
    const label = pill.querySelector('.pill-label');
    const hover = pill.querySelector('.pill-label-hover');
    if (!circle) return;

    function layoutCircle() {
      const rect = pill.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      const R = ((w * w) / 4 + h * h) / (2 * h);
      const D = Math.ceil(2 * R) + 2;
      const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;

      circle.style.width = D + 'px';
      circle.style.height = D + 'px';
      circle.style.bottom = -delta + 'px';
      circle.style.left = '50%';

      gsap.set(circle, { xPercent: -50, scale: 0, transformOrigin: `50% ${D - delta}px` });
      if (label) gsap.set(label, { y: 0 });
      if (hover) gsap.set(hover, { y: h + 12, opacity: 0 });
    }

    layoutCircle();
    window.addEventListener('resize', layoutCircle);

    pill.addEventListener('mouseenter', () => {
      const h = pill.getBoundingClientRect().height;
      gsap.to(circle, { scale: 1.2, xPercent: -50, duration: 0.5, ease: 'power3.out', overwrite: true });
      if (label) gsap.to(label, { y: -(h + 8), duration: 0.5, ease: 'power3.out', overwrite: true });
      if (hover) gsap.to(hover, { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out', overwrite: true });
    });

    pill.addEventListener('mouseleave', () => {
      const h = pill.getBoundingClientRect().height;
      gsap.to(circle, { scale: 0, duration: 0.35, ease: 'power3.out', overwrite: true });
      if (label) gsap.to(label, { y: 0, duration: 0.35, ease: 'power3.out', overwrite: true });
      if (hover) gsap.to(hover, { y: h + 12, opacity: 0, duration: 0.35, ease: 'power3.out', overwrite: true });
    });
  });

  // Nav scroll state — morph between expanded bar and floating pill
  function updateNavScroll(scrollY) {
    const nav = document.getElementById('pill-nav');
    if (!nav) return;
    nav.classList.toggle('nav-scrolled', scrollY > 80);
    nav.classList.toggle('nav-deep', scrollY > 300);
  }

  if (lenis) {
    lenis.on('scroll', ({ scroll }) => updateNavScroll(scroll));
  } else {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        updateNavScroll(window.scrollY);
        ticking = false;
      });
    }, { passive: true });
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   SQUARES CANVAS BACKGROUND
   ═══════════════════════════════════════════════════════════════════════════ */
function initSquares() {
  const canvas = document.getElementById('squares-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const mobile = isMobileViewport();
  const squareSize = mobile ? 30 : 40;
  const borderColor = '#222222';
  const hoverFillColor = '#002266';
  const speed = mobile ? 0.5 : 1;

  let numX, numY;
  const gridOffset = { x: 0, y: 0 };
  let hoveredSquare = null;

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    numX = Math.ceil(window.innerWidth / squareSize) + 1;
    numY = Math.ceil(window.innerHeight / squareSize) + 1;
  }

  function drawGrid() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    const startX = Math.floor(gridOffset.x / squareSize) * squareSize;
    const startY = Math.floor(gridOffset.y / squareSize) * squareSize;

    for (let x = startX; x < window.innerWidth + squareSize; x += squareSize) {
      for (let y = startY; y < window.innerHeight + squareSize; y += squareSize) {
        const sqX = x - (gridOffset.x % squareSize);
        const sqY = y - (gridOffset.y % squareSize);

        if (
          hoveredSquare &&
          Math.floor((x - startX) / squareSize) === hoveredSquare.x &&
          Math.floor((y - startY) / squareSize) === hoveredSquare.y
        ) {
          ctx.fillStyle = hoverFillColor;
          ctx.fillRect(sqX, sqY, squareSize, squareSize);
        }

        ctx.strokeStyle = borderColor;
        ctx.strokeRect(sqX, sqY, squareSize, squareSize);
      }
    }
  }

  // Tied to GSAP ticker for frame sync
  gsap.ticker.add(() => {
    const s = Math.max(speed, 0.1);
    gridOffset.x = (gridOffset.x - s + squareSize) % squareSize;
    gridOffset.y = (gridOffset.y - s + squareSize) % squareSize;
    drawGrid();
  });

  document.addEventListener('mousemove', (e) => {
    const startX = Math.floor(gridOffset.x / squareSize) * squareSize;
    const startY = Math.floor(gridOffset.y / squareSize) * squareSize;
    const hx = Math.floor((e.clientX + gridOffset.x - startX) / squareSize);
    const hy = Math.floor((e.clientY + gridOffset.y - startY) / squareSize);
    if (!hoveredSquare || hoveredSquare.x !== hx || hoveredSquare.y !== hy) {
      hoveredSquare = { x: hx, y: hy };
    }
  });

  window.addEventListener('resize', resize);
  resize();
}

/* ═══════════════════════════════════════════════════════════════════════════
   HERO WORD ROTATION — Infinite vertical slide cycle
   ═══════════════════════════════════════════════════════════════════════════ */
function initHeroRotate() {
  const container = document.querySelector('.hero-rotate');
  if (!container) return;

  const words = [...container.querySelectorAll('.hero-rotate-word')];
  if (words.length < 2) return;

  // Measure natural container width (= widest word) before repositioning
  const containerW = container.offsetWidth;
  const lineH = words[0].offsetHeight;

  // Lock container dimensions for layout stability
  container.style.width = containerW + 'px';
  container.style.height = lineH + 'px';

  // Stack all words absolutely inside the container
  words.forEach((w, i) => {
    w.style.position = 'absolute';
    w.style.top = '0';
    w.style.left = '0';
    gsap.set(w, i === 0
      ? { yPercent: 0, opacity: 1 }
      : { yPercent: 110, opacity: 0 }
    );
  });

  // Build infinite rotation timeline
  const HOLD = 1.4;   // Seconds each word pauses on screen
  const SLIDE = 0.35;  // Transition duration

  const tl = gsap.timeline({ repeat: -1, delay: 2.5 });

  for (let i = 0; i < words.length; i++) {
    const cur = words[i];
    const nxt = words[(i + 1) % words.length];

    // Current word slides up & fades out
    tl.to(cur, {
      yPercent: -110, opacity: 0,
      duration: SLIDE, ease: 'power3.inOut',
    });

    // Next word enters from below & fades in
    tl.fromTo(nxt,
      { yPercent: 110, opacity: 0 },
      { yPercent: 0, opacity: 1, duration: SLIDE, ease: 'power3.out' },
      `-=${SLIDE * 0.55}`
    );

    // Pause so the user can read
    tl.to({}, { duration: HOLD });
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   SHOWREEL — Infinite marquee with drag + scroll interactivity
   ═══════════════════════════════════════════════════════════════════════════ */
function initShowreel() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  const wrapper = document.querySelector('.showreel-track-wrapper');
  const track = document.querySelector('.showreel-track');
  if (!wrapper || !track) return;

  // Heading char-reveal (same pattern as other headings)
  const heading = document.querySelector('.showreel-heading');
  if (heading) {
    const chars = splitIntoMaskedChars(heading);
    if (chars.length) {
      gsap.set(chars, { yPercent: 110 });
      heading.style.visibility = 'visible';
      gsap.to(chars, {
        yPercent: 0,
        duration: 1.0,
        stagger: 0.018,
        ease: 'power4.out',
        scrollTrigger: { trigger: heading, start: 'top 88%', toggleActions: 'play none none none' }
      });
    }
  }

  // Entrance animation — fade in + slide up
  gsap.fromTo(wrapper,
    { autoAlpha: 0, y: 40 },
    {
      autoAlpha: 1, y: 0,
      duration: 1.0,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: wrapper,
        start: 'top 88%',
        toggleActions: 'play none none none'
      }
    }
  );

  // ─── Infinite loop engine ─────────────────────────────────────────────
  const slides = track.querySelectorAll('.showreel-slide');
  const halfCount = slides.length / 2;
  const GAP = 20;

  function getHalfWidth() {
    let w = 0;
    for (let i = 0; i < halfCount; i++) {
      w += slides[i].offsetWidth + GAP;
    }
    return w;
  }

  let halfWidth = getHalfWidth();

  // Current x position — single source of truth
  let xPos = 0;
  const AUTO_SPEED = -1.45; // px per frame (negative = left)
  let currentSpeed = AUTO_SPEED;
  let targetSpeed = AUTO_SPEED;
  let resumeTimer = null;

  // Wrap x into [0, -halfWidth) range for seamless loop
  function wrapX(x) {
    const mod = ((x % halfWidth) + halfWidth) % halfWidth;
    return mod === 0 ? 0 : mod - halfWidth;
  }

  // Set transform directly — no tween overhead
  const setX = gsap.quickSetter(track, 'x', 'px');

  // ─── Animation loop — tied to GSAP ticker ─────────────────────────────
  gsap.ticker.add(() => {
    // Always interpolate toward target speed (auto-play resumes smoothly)
    currentSpeed = lerp(currentSpeed, targetSpeed, 0.06);
    xPos += currentSpeed;
    xPos = wrapX(xPos);
    setX(xPos);
  });

  // ─── Drag interactivity ───────────────────────────────────────────────
  let dragStartX = 0;
  let dragLastX = 0;
  let isDragging = false;

  wrapper.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return; // left click only
    isDragging = true;
    dragStartX = e.clientX;
    dragLastX = e.clientX;
    currentSpeed = 0;
    clearTimeout(resumeTimer);
    wrapper.setPointerCapture(e.pointerId);
    e.preventDefault();
  });

  window.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragLastX;
    dragLastX = e.clientX;
    // Dampen drag — heavy, controlled feel
    const dampedDx = dx * 0.5;
    xPos += dampedDx;
    xPos = wrapX(xPos);
    setX(xPos);
    currentSpeed = dampedDx;
  });

  function endDrag(e) {
    if (!isDragging) return;
    isDragging = false;

    // Clamp flick velocity and let the main loop decay it via lerp
    targetSpeed = clamp(currentSpeed * 0.3, -6, 6);
    scheduleResume();
  }

  window.addEventListener('pointerup', endDrag);
  window.addEventListener('pointercancel', endDrag);

  // Prevent click events after drag
  wrapper.addEventListener('click', (e) => {
    if (Math.abs(dragLastX - dragStartX) > 5) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, true);

  // ─── Wheel / trackpad interactivity ───────────────────────────────────
  wrapper.addEventListener('wheel', (e) => {
    e.preventDefault();
    clearTimeout(resumeTimer);

    // Use deltaX for horizontal scroll, deltaY as fallback — heavily dampened
    const raw = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    const dampedDelta = raw * 0.3;
    xPos -= dampedDelta;
    xPos = wrapX(xPos);
    setX(xPos);
    // Nudge current speed toward scroll direction, clamped
    targetSpeed = clamp(-dampedDelta, -4, 4);

    scheduleResume();
  }, { passive: false });

  // ─── Resume auto-play after interaction ────────────────────────────────
  function scheduleResume() {
    clearTimeout(resumeTimer);
    resumeTimer = setTimeout(() => {
      targetSpeed = AUTO_SPEED;
    }, 800);
  }

  // ─── Touch support (mobile drag) ──────────────────────────────────────
  wrapper.style.touchAction = 'pan-y'; // allow vertical scroll, capture horizontal

  // ─── Resize ───────────────────────────────────────────────────────────
  window.addEventListener('resize', () => {
    halfWidth = getHalfWidth();
    xPos = wrapX(xPos);
  });

  // ─── Ensure all videos play ───────────────────────────────────────────
  const videos = wrapper.querySelectorAll('video');
  const playObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.play().catch(() => {});
      }
    });
  }, { threshold: 0.1 });

  videos.forEach(v => playObserver.observe(v));
}

/* ═══════════════════════════════════════════════════════════════════════════
   HERO ANIMATION — Word blur + eyebrow + CTA
   ═══════════════════════════════════════════════════════════════════════════ */
function animateHero() {
  if (typeof gsap === 'undefined') return;

  const headline = document.querySelector('.hero-headline');
  if (headline) headline.style.visibility = 'visible';
  const heroWords = headline ? splitIntoWords(headline) : [];

  // Include the rotating text container in the entrance stagger
  const rotateEl = headline ? headline.querySelector('.hero-rotate') : null;
  if (rotateEl) heroWords.splice(1, 0, rotateEl);

  const tl = gsap.timeline({ delay: 0.1 });

  // 1. Eyebrow — blur fade in
  tl.fromTo('.hero-eyebrow',
    { opacity: 0, y: -20, filter: 'blur(8px)' },
    { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.7, ease: 'power2.out' }
  );

  // 2. Headline — word-by-word blur (staggered)
  if (heroWords.length) {
    gsap.set(heroWords, { opacity: 0, y: -30, filter: 'blur(10px)' });
    tl.to(heroWords, {
      opacity: 1, y: 0, filter: 'blur(0px)',
      duration: 0.7, stagger: 0.04, ease: 'power2.out'
    }, '-=0.3');
  }

  // 3. Sub text
  tl.fromTo('.hero-sub',
    { opacity: 0, y: 20, filter: 'blur(8px)' },
    { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.8, ease: 'power2.out' },
    '-=0.15'
  );

  // 4. CTA buttons
  tl.fromTo('.hero-cta-row',
    { opacity: 0, y: 20, filter: 'blur(6px)' },
    { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.7, ease: 'power2.out' },
    '-=0.3'
  );

  // 5. Scroll hint
  tl.to('.hero-scroll-hint', { opacity: 1, duration: 0.8, ease: 'power2.out' }, '-=0.3');

  // 6. Start infinite word rotation cycle
  initHeroRotate();
}

/* ═══════════════════════════════════════════════════════════════════════════
   MARQUEE
   ═══════════════════════════════════════════════════════════════════════════ */
function initMarquee() {
  if (typeof gsap === 'undefined') return;
  const tracks = document.querySelectorAll('.marquee-track');
  tracks.forEach((track, i) => {
    const clone = track.innerHTML;
    const wrapper = document.createElement('div');
    wrapper.setAttribute('aria-hidden', 'true');
    wrapper.style.display = 'contents';
    wrapper.innerHTML = clone;
    track.appendChild(wrapper);
    const totalWidth = track.scrollWidth / 2;
    const direction = i % 2 === 0 ? -1 : 1;
    gsap.to(track, { x: direction * -totalWidth, duration: 80 + i * 15, ease: 'none', repeat: -1 });
  });
}

/* ═══════════════════════════════════════════════════════════════════════════
   REVEALS — IntersectionObserver fallback
   ═══════════════════════════════════════════════════════════════════════════ */
function initReveals() {
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('revealed'); obs.unobserve(e.target); } });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );
  document.querySelectorAll('.reveal').forEach((el) => obs.observe(el));
}

/* ═══════════════════════════════════════════════════════════════════════════
   BOOK PAGE
   ═══════════════════════════════════════════════════════════════════════════ */
function initAuditCounters() {
  const counters = document.querySelectorAll('.audit-value[data-count]');
  if (counters.length === 0) return;
  const obs = new IntersectionObserver(
    (entries) => { entries.forEach((e) => { if (e.isIntersecting) { animC(e.target); obs.unobserve(e.target); } }); },
    { threshold: 0.5 }
  );
  counters.forEach((c) => obs.observe(c));
  function animC(el) {
    const target = parseInt(el.getAttribute('data-count'));
    const suffix = el.getAttribute('data-suffix') || '';
    const prefix = el.getAttribute('data-prefix') || '';
    const dur = 1500; const start = performance.now();
    function step(now) {
      const p = Math.min((now - start) / dur, 1);
      el.textContent = prefix + Math.round((1 - Math.pow(1 - p, 3)) * target) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
}

function animateBookPage() {
  if (typeof gsap === 'undefined') return;
  const tl = gsap.timeline({ delay: 0.3 });
  tl.from('.book-back', { opacity: 0, x: -20, duration: 0.6, ease: 'power3.out' });
  tl.from('.book-eyebrow', { opacity: 0, y: 15, duration: 0.7, ease: 'power3.out' }, '-=0.3');
  tl.from('.book-heading', { opacity: 0, y: 30, duration: 0.9, ease: 'power4.out' }, '-=0.4');
  tl.from('.book-body', { opacity: 0, y: 20, duration: 0.7, ease: 'power3.out' }, '-=0.4');
  tl.from('.audit-card', { opacity: 0, y: 30, stagger: 0.1, duration: 0.7, ease: 'power3.out' }, '-=0.3');
  tl.from('.book-step', { opacity: 0, x: -20, stagger: 0.08, duration: 0.6, ease: 'power3.out' }, '-=0.3');
  tl.from('.book-right-heading', { opacity: 0, y: 20, duration: 0.7, ease: 'power3.out' }, '-=0.6');
  tl.from('.book-right-sub', { opacity: 0, y: 15, duration: 0.6, ease: 'power3.out' }, '-=0.4');
  tl.from('.calendly-placeholder', { opacity: 0, scale: 0.97, duration: 0.8, ease: 'power3.out' }, '-=0.3');
}

/* ═══════════════════════════════════════════════════════════════════════════
   INIT — Orchestrate all modules
   ═══════════════════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', async () => {
  // Register GSAP plugins first
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    if (typeof Draggable !== 'undefined') gsap.registerPlugin(Draggable);
    if (typeof Observer !== 'undefined') gsap.registerPlugin(Observer);
  }

  initCursor();

  const isBookPage = document.body.classList.contains('page-book');
  if (isBookPage) {
    animateBookPage();
    initAuditCounters();
    initReveals();
    return;
  }

  // Home page flow
  await runLoader();

  // 1. Lenis smooth scroll (must come after loader so page is scrollable)
  initLenis();

  // 2. Core UI
  initSquares();
  initPillNav();

  // 3. Animations
  animateHero();
  initTextReveal();
  initScrollReveals();

  // 4. Showreel
  initShowreel();

  // 5. Interactivity
  initBentoTilt();
  initMagnetic();

  // 5. Ambient
  initColorTransitions();
  initMarquee();
  initReveals();

  // 6. Newsletter form → Formspree
  const nlForm = document.getElementById('newsletter-form');
  if (nlForm) {
    nlForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = nlForm.querySelector('input[name="email"]');
      if (!emailInput || !emailInput.value) return;

      fetch('https://formspree.io/f/mojkjqoe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          _subject: 'New Newsletter Signup — NWS Media',
          email: emailInput.value,
          source: 'newsletter'
        })
      }).then(res => {
        if (res.ok) {
          emailInput.value = '';
          emailInput.placeholder = 'Subscribed ✓';
          setTimeout(() => { emailInput.placeholder = 'you@company.com'; }, 3000);
        }
      }).catch(() => {});
    });
  }
});
