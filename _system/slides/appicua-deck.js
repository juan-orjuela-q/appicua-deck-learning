/* APPICUA · DECK RUNTIME
   ----------------------------------------------------------------------------
   Navegación unificada: el runtime GENERA en cada slide interna
     · header  → isotipo · tag @appicua · breadcrumb · botón menú
     · footer  → contador "07 / 19" · regla · ANT / SIG
   a partir de dos atributos en la <section class="ap-slide">:
     data-section="02. Valor agregado"   (capítulo; opcional)
     data-title="Escala y consistencia"  (nombre de la slide; también aparece en el menú)
   Opciones:
     data-chrome="none"    → sin header ni footer (portada, cierre)
     data-chrome="footer"  → solo footer
     data-chrome="header"  → solo header
     data-count="false"    → la slide no cuenta en "NN / TT" ni aparece en el menú (intro)
   Menú: botón ☰ o tecla M → panel con todas las slides agrupadas por sección. Esc cierra.
   Teclado: ← → / PageUp PageDown / Espacio / Home End · F = pantalla completa · G = grid de 12 columnas
   Botones: [data-ap-next] [data-ap-prev] [data-ap-goto="N"] [data-ap-menu] [data-ap-fullscreen]
   Video: los <video> solo se reproducen mientras su slide está activa.
   URL: ?overview (vista general) · ?slide=5 o #5 (abrir en esa slide) · ?static (sin animaciones)
   Movimiento: ver sección "Movimiento" más abajo y DESIGN.md §12.
   ---------------------------------------------------------------------------- */
(function () {
  const deck = document.querySelector('.ap-deck');
  if (!deck) return;
  const NS = 'http://www.w3.org/2000/svg';
  const params = new URLSearchParams(location.search);
  const pad = n => String(n).padStart(2, '0');

  /* ---- Sprite de iconos (se inyecta si el documento no lo trae) ---- */
  const SPRITE = `<svg width="0" height="0" style="position:absolute" aria-hidden="true" data-ap-sprite>
  <symbol id="ap-icon" viewBox="0 0 149 286"><path fill="currentColor" d="M84.0582 145.655H61.6676C50.4723 145.655 39.2396 156.848 39.2396 168.078V224.116C39.2396 236.432 49.8733 246.539 61.6676 246.539C73.462 246.539 84.0582 236.47 84.0582 224.116V145.693V145.655ZM120.49 282.888L104.801 267.203C93.606 278.396 78.4793 285.695 61.6676 285.695C28.0444 285.695 0 257.695 0 224.079V168.041C0 134.425 28.0069 106.424 61.6676 106.424H84.0582V61.6161C84.0582 50.4234 72.8629 39.1932 61.6676 39.1932H33.6233V0H61.6676C95.2909 0 123.298 28.0005 123.298 61.6161V229.694L148.534 254.925L120.527 282.925L120.49 282.888Z"/></symbol>
  <symbol id="ap-arrow-r" viewBox="0 0 24 24"><path d="M4 12h15M13 5.5 19.5 12 13 18.5" stroke-linecap="square"/></symbol>
  <symbol id="ap-arrow-l" viewBox="0 0 24 24"><path d="M20 12H5M11 5.5 4.5 12 11 18.5" stroke-linecap="square"/></symbol>
  <symbol id="ap-menu" viewBox="0 0 24 24"><path d="M5 7h14M5 12h14M5 17h14"/></symbol>
  <symbol id="ap-close" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></symbol>
  <symbol id="ap-expand" viewBox="0 0 24 24"><path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5"/></symbol></svg>`;
  if (!document.getElementById('ap-icon')) document.body.insertAdjacentHTML('afterbegin', SPRITE);

  const el = (tag, cls, attrs = {}) => { const e = document.createElement(tag); if (cls) e.className = cls; for (const k in attrs) e.setAttribute(k, attrs[k]); return e; };
  const icon = (id, cls) => { const s = document.createElementNS(NS, 'svg'); if (cls) s.setAttribute('class', cls); s.setAttribute('aria-hidden', 'true'); const u = document.createElementNS(NS, 'use'); u.setAttribute('href', '#' + id); s.appendChild(u); return s; };

  const slides = Array.from(deck.querySelectorAll(':scope > .ap-slide'));
  const counted = slides.filter(s => s.dataset.count !== 'false');
  const total = counted.length;
  const numOf = s => counted.indexOf(s) + 1;   // 0 si la slide no cuenta

  /* ---- Chrome unificado ---- */
  function buildHeader(s) {
    const frag = document.createDocumentFragment();
    frag.appendChild(icon('ap-icon', 'ap-mark'));
    const header = el('header', 'ap-header');
    header.appendChild(Object.assign(el('span', 'ap-tag'), { textContent: '@appicua' }));
    const crumb = el('nav', 'ap-crumb', { 'aria-label': 'Ubicación' });
    if (s.dataset.section) {
      crumb.appendChild(Object.assign(el('span'), { textContent: s.dataset.section }));
      crumb.appendChild(el('i', 'sep'));
    }
    crumb.appendChild(Object.assign(el('span', 'is-current'), { textContent: s.dataset.title || '' }));
    header.appendChild(crumb);
    frag.appendChild(header);
    const menu = el('button', 'ap-btn ap-btn--neutral ap-btn--icon ap-menu ap-no-print', { type: 'button', 'data-ap-menu': '', 'aria-label': 'Menú' });
    menu.appendChild(icon('ap-menu'));
    frag.appendChild(menu);
    s.prepend(frag);
  }
  function buildFooter(s, k) {
    const f = el('div', 'ap-footer');
    f.appendChild(Object.assign(el('span', 'ap-counter'), { textContent: `${pad(numOf(s))} / ${pad(total)}` }));
    f.appendChild(el('span', 'ap-rule'));
    const nav = el('nav', 'ap-nav ap-no-print');
    const prev = el('button', 'ap-btn ap-btn--neutral ap-btn--nav', { type: 'button', 'data-ap-prev': '' });
    prev.append(icon('ap-arrow-l'), 'Ant');
    const next = el('button', 'ap-btn ap-btn--nav', { type: 'button', 'data-ap-next': '' });
    next.append('Sig', icon('ap-arrow-r'));
    if (k === 0) prev.disabled = true;
    if (k === slides.length - 1) next.disabled = true;
    nav.append(prev, next);
    f.appendChild(nav);
    s.appendChild(f);
  }
  slides.forEach((s, k) => {
    const mode = s.dataset.chrome || 'full';
    if ((mode === 'full' || mode === 'header') && !s.querySelector('.ap-header')) buildHeader(s);
    if ((mode === 'full' || mode === 'footer') && !s.querySelector('.ap-footer')) buildFooter(s, k);
    s.querySelectorAll('[data-ap-counter]').forEach(c => { c.textContent = `${pad(numOf(s))} / ${pad(total)}`; });
  });

  /* ---- Menú: panel con todas las slides por sección ---- */
  const menu = el('section', 'ap-slide theme-dark ap-bg-dots ap-menu-panel ap-no-print', { 'aria-label': 'Menú de la presentación', 'data-chrome': 'none' });
  const close = el('button', 'ap-btn ap-btn--secondary ap-btn--icon ap-menu', { type: 'button', 'data-ap-menu': '', 'aria-label': 'Cerrar menú' });
  close.appendChild(icon('ap-close'));
  menu.appendChild(icon('ap-icon', 'ap-mark'));
  const mh = el('header', 'ap-header');
  mh.appendChild(Object.assign(el('span', 'ap-tag'), { textContent: '@appicua' }));
  mh.appendChild(Object.assign(el('span', 'ap-crumb'), { innerHTML: '<span class="is-current">Menú</span>' }));
  menu.append(mh, close);
  /* agrupa slides consecutivas por data-section; las que no tienen sección van a "Inicio" (al principio) o "Final" */
  const groups = [];
  slides.forEach((s, k) => {
    if (s.dataset.count === 'false') return;
    const sec = s.dataset.section || '';
    const last = groups[groups.length - 1];
    const item = { k, title: s.dataset.title || `Slide ${k + 1}` };
    if (last && last.sec === sec) last.items.push(item);
    else groups.push({ sec, label: sec || (groups.length === 0 ? 'Inicio' : 'Final'), items: [item] });
  });
  if (groups.length > 1 && !groups[0].sec && !groups[1].sec) { groups[0].items.push(...groups[1].items); groups.splice(1, 1); }
  const cols = el('div', 'ap-menu-panel__grid');
  groups.forEach(g => {
    const col = el('div', 'ap-menu-panel__group');
    col.appendChild(Object.assign(el('p', 'ap-menu-panel__section'), { textContent: g.label }));
    g.items.forEach(it => {
      const b = el('button', 'ap-menu-panel__item', { type: 'button', 'data-ap-goto': String(it.k + 1) });
      b.append(Object.assign(el('span', 'n'), { textContent: pad(numOf(slides[it.k])) }), Object.assign(el('span'), { textContent: it.title }));
      col.appendChild(b);
    });
    cols.appendChild(col);
  });
  cols.querySelectorAll('.ap-menu-panel__section, .ap-menu-panel__item').forEach((e, k) => e.style.setProperty('--o', k));
  menu.appendChild(cols);
  deck.appendChild(menu);

  /* ---- Navegación ---- */
  let i = 0;
  function fit() {
    const scale = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    document.documentElement.style.setProperty('--ap-scale', scale);
    const n = 3, gap = 24;
    document.documentElement.style.setProperty('--ap-overview-zoom', ((window.innerWidth - gap * (n + 1)) / n) / 1920);
  }
  function toggleFullscreen() {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen?.().catch(() => {});
  }
  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    menu.querySelectorAll('.ap-menu-panel__item').forEach(b => b.classList.toggle('is-current', +b.dataset.apGoto === i + 1));
  }

  /* ---- Movimiento ---------------------------------------------------------
     Auto-etiqueta el contenido de cada slide (en orden de lectura) con data-ap-a y --o.
     Tipos: words (titulares, palabra por palabra) · rise (por defecto) · focus (cards, logos)
            reveal (imágenes) · draw / drawY (reglas) · pop (rombos) · fade (marcas de agua)
     Control manual: data-ap-a="<tipo>" en un elemento la fija; data-ap-a="none" la excluye;
     data-anim="none" en la <section> deja la slide estática. */
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const animOK = !reduced && !params.has('overview') && !params.has('static');
  const CHROME = '.ap-mark, .ap-header, .ap-menu, .ap-footer';
  const KINDS = [
    ['.ap-display-xl, .ap-display, .ap-h1, .ap-h2, .ap-contact__name', 'words'],
    ['.ap-media', 'reveal'],
    ['hr.ap-divider, .ap-hline', 'draw'],
    ['.ap-vline', 'drawY'],
    ['.ap-node', 'pop'],
    ['.ap-watermark', 'fade'],
    ['.ap-stat-card, .ap-kpi-card, .ap-card, .ap-logos > *, img.ap-wordmark, .ap-quote', 'focus'],
    ['.ap-eyebrow, .ap-h3, .ap-h4, .ap-lead, .ap-body, .ap-caption, .ap-mono, .ap-tag, .ap-pill, .ap-list > li, .ap-index > li, .ap-phase, .ap-table tr, .ap-meta > div, .ap-btn, .ap-contact > :not(.ap-contact__name), img', 'rise'],
  ];
  const ALL = KINDS.map(k => k[0]).join(', ');
  function splitWords(elm) {
    let w = 0;
    const walk = node => {
      Array.from(node.childNodes).forEach(c => {
        if (c.nodeType === 3) {
          const parts = c.textContent.split(/(\s+)/);
          if (parts.every(p => !p.trim())) return;
          const frag = document.createDocumentFragment();
          parts.forEach(p => {
            if (!p) return;
            if (!p.trim()) { frag.appendChild(document.createTextNode(p)); return; }
            const sp = el('span', 'ap-w'); sp.textContent = p; sp.style.setProperty('--w', w++); frag.appendChild(sp);
          });
          c.replaceWith(frag);
        } else if (c.nodeType === 1 && c.tagName !== 'BR') walk(c);
      });
    };
    walk(elm);
  }
  function prepare(s) {
    if (s.dataset.anim === 'none' || s.classList.contains('ap-intro')) return;
    let o = 0;
    s.querySelectorAll(ALL).forEach(e => {
      if (e.closest(CHROME)) return;
      if (e.parentElement.closest('[data-ap-a]') && e.parentElement.closest('[data-ap-a]') !== e) {
        const host = e.parentElement.closest('[data-ap-a]');
        if (host.dataset.apA !== 'none' && s.contains(host)) return;   // ya lo anima su contenedor
      }
      if (e.dataset.apA === 'none') return;
      if (!e.dataset.apA) e.dataset.apA = (KINDS.find(([sel]) => e.matches(sel)) || [, 'rise'])[1];
      e.style.setProperty('--o', Math.min(o++, 16));
      if (e.dataset.apA === 'words') splitWords(e);
    });
  }
  function countUp(s) {
    s.querySelectorAll('.ap-kpi, .ap-stat-card__value').forEach(n => {
      const src = n.dataset.apValue || (n.dataset.apValue = n.textContent.trim());
      const m = src.match(/^(\D*)(\d{1,3}(?:[.,]\d{3})+|\d+)(.*)$/);
      if (!m) return;
      const target = parseInt(m[2].replace(/[.,]/g, ''), 10);
      const sep = (m[2].match(/[.,]/) || ['.'])[0];
      const fmt = v => String(v).replace(/\B(?=(\d{3})+(?!\d))/g, sep);
      const host = n.closest('[data-ap-a]');
      const delay = host ? parseFloat(getComputedStyle(host).animationDelay) * 1000 || 0 : 0;
      const dur = 1400, t0 = performance.now() + delay;
      n.textContent = m[1] + fmt(0) + m[3];
      const tick = t => {
        const p = Math.min(1, Math.max(0, (t - t0) / dur));
        const e = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);          // expo out
        n.textContent = m[1] + fmt(Math.round(target * e)) + m[3];
        if (p < 1 && n.closest('.ap-slide').classList.contains('is-playing')) requestAnimationFrame(tick);
        else n.textContent = src;
      };
      requestAnimationFrame(tick);
    });
  }
  function play(s) {
    s.classList.remove('is-playing'); void s.offsetWidth;
    if (!animOK) return;
    s.classList.add('is-playing');
    requestAnimationFrame(() => countUp(s));
  }
  if (animOK) { document.documentElement.classList.add('ap-animate'); slides.forEach(prepare); }

  let busy = null, started = false;
  function finish() {
    if (!busy) return;
    const { from, to, timer } = busy; clearTimeout(timer); busy = null;
    from.classList.remove('is-leaving', 'is-active', 'is-playing');
    to.classList.remove('is-entering');
  }
  function go(n) {
    n = Math.max(0, Math.min(slides.length - 1, n));
    if (started && n === i) return setMenu(false);
    finish();
    const from = slides[i], to = slides[n], dir = n > i ? 1 : -1;
    i = n;
    slides.forEach(s => { if (s !== from && s !== to) s.classList.remove('is-active', 'is-playing', 'is-entering', 'is-leaving'); });
    to.classList.add('is-active');
    if (started && animOK && from !== to) {
      document.documentElement.style.setProperty('--ap-dir', dir);
      from.classList.add('is-leaving'); to.classList.add('is-entering');
      const ms = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--ap-dur-slide')) || 1100;
      busy = { from, to, timer: setTimeout(finish, ms + 60) };
    } else if (from !== to) {
      from.classList.remove('is-active', 'is-playing');
    }
    play(to);
    slides.forEach(s => s.querySelectorAll('video').forEach(v => { if (s === to) { v.muted = true; v.play().catch(() => {}); } else if (s !== from) v.pause(); }));
    started = true;
    setMenu(false);
    history.replaceState(null, '', `${location.pathname}${location.search}#${i + 1}`);
  }

  if (params.has('overview')) {
    deck.classList.add('is-overview');
    slides.forEach((s, k) => s.addEventListener('click', () => { location.href = `${location.pathname}#${k + 1}`; }));
  } else {
    const start = parseInt(params.get('slide') || location.hash.slice(1) || '1', 10) - 1;
    go(isNaN(start) ? 0 : start);
    window.addEventListener('hashchange', () => { const h = parseInt(location.hash.slice(1), 10) - 1; if (!isNaN(h) && h !== i) go(h); });
    document.addEventListener('keydown', e => {
      const open = menu.classList.contains('is-open');
      if (e.key === 'Escape' && open) return setMenu(false);
      if (e.key.toLowerCase() === 'm') return setMenu(!open);
      if (open) return;
      if (['ArrowRight', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); go(i + 1); }
      if (['ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); go(i - 1); }
      if (e.key === 'Home') go(0);
      if (e.key === 'End') go(slides.length - 1);
      if (e.key.toLowerCase() === 'f') toggleFullscreen();
      if (e.key.toLowerCase() === 'g') slides[i].classList.toggle('show-grid');
    });
    document.addEventListener('click', e => {
      const t = e.target.closest('[data-ap-next],[data-ap-prev],[data-ap-goto],[data-ap-menu],[data-ap-fullscreen]');
      if (!t) return;
      e.preventDefault();
      if (t.hasAttribute('data-ap-fullscreen')) toggleFullscreen();
      else if (t.hasAttribute('data-ap-menu')) setMenu(!menu.classList.contains('is-open'));
      else if (t.hasAttribute('data-ap-next')) go(i + 1);
      else if (t.hasAttribute('data-ap-prev')) go(i - 1);
      else go(parseInt(t.getAttribute('data-ap-goto'), 10) - 1);
    });
  }
  fit();
  window.addEventListener('resize', fit);
})();
