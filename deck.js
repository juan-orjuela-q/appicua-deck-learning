/* ==========================================================================
   Deck · Universidades — comportamiento local (no forma parte del sistema)
   [data-dk-type]: el texto entra como si se digitara; los caracteres recién
   escritos pasan por números y signos antes de fijarse.
   Solo corre cuando el deck anima (html.ap-animate) y la slide entra en .is-playing.
   Con ?static, reducir movimiento o impresión, el texto queda tal cual.
   ========================================================================== */
(() => {
  const html = document.documentElement;
  if (!html.classList.contains('ap-animate')) return;

  const GLYPHS = '0123456789#%&$@*+=/<>[]{}_';
  const rand = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
  const STEP = 55;      // ms por carácter tecleado
  const SCRAMBLE = 6;   // cuadros de "ruido" por carácter antes de fijarse
  const FRAME = 40;     // ms por cuadro

  function type(el, slide, token) {
    const text = el.dataset.dkText || (el.dataset.dkText = el.textContent);
    const delay = +el.dataset.delay || 0;
    el.textContent = '';
    const t0 = performance.now() + delay;
    const total = text.length * STEP + SCRAMBLE * FRAME;
    const tick = now => {
      if (slide.dataset.dkToken !== token) return;          // la slide se reinició o se fue
      const t = now - t0;
      if (t < 0) { requestAnimationFrame(tick); return; }
      let out = '';
      for (let i = 0; i < text.length; i++) {
        const born = i * STEP;                                // momento en que se "teclea"
        if (t < born) break;
        const settled = t >= born + SCRAMBLE * FRAME || text[i] === ' ';
        out += settled ? text[i] : rand();
      }
      el.textContent = out;
      if (t < total) requestAnimationFrame(tick); else el.textContent = text;
    };
    requestAnimationFrame(tick);
  }

  function run(slide) {
    const token = String(Math.random());
    slide.dataset.dkToken = token;
    slide.querySelectorAll('[data-dk-type]').forEach(el => type(el, slide, token));
  }
  function reset(slide) {
    slide.dataset.dkToken = '';
    slide.querySelectorAll('[data-dk-type]').forEach(el => { if (el.dataset.dkText) el.textContent = el.dataset.dkText; });
  }

  document.querySelectorAll('.ap-slide').forEach(slide => {
    if (!slide.querySelector('[data-dk-type]')) return;
    let playing = slide.classList.contains('is-playing');
    if (playing) run(slide);
    new MutationObserver(() => {
      const now = slide.classList.contains('is-playing');
      if (now && !playing) run(slide);
      if (!now && playing) reset(slide);
      playing = now;
    }).observe(slide, { attributes: true, attributeFilter: ['class'] });
  });
  window.addEventListener('beforeprint', () => document.querySelectorAll('.ap-slide').forEach(reset));
})();

/* ==========================================================================
   s5 · .dk-morph-slide: 3 estados en loop (palabra clave + imagen enmascarada)
   La palabra entra con line reveal y la caja se ajusta a su ancho; la imagen
   sube desde abajo girando. Sin animación (?static, impresión) queda el estado 1.
   ========================================================================== */
(() => {
  const html = document.documentElement;
  if (!html.classList.contains('ap-animate')) return;
  const HOLD = 3200;    // ms que permanece cada estado
  const FIRST = 650;    // ms hasta el primer estado (tras la entrada de las líneas)

  document.querySelectorAll('.dk-morph-slide').forEach(slide => {
    const box = slide.querySelector('.dk-kw');
    const words = [...slide.querySelectorAll('.dk-kw__word')];
    const imgs = [...slide.querySelectorAll('.dk-morph__img')];
    const prog = slide.querySelector('.dk-prog');
    if (prog) prog.style.setProperty('--dk-hold', HOLD + 'ms');
    const runProg = on => { if (!prog) return; prog.classList.remove('is-run'); if (on) { void prog.offsetWidth; prog.classList.add('is-run'); } };
    const PAD = 20;
    let idx = -1, timer = 0;

    const setWidth = i => { box.style.width = (words[i].offsetWidth + PAD) + 'px'; };
    const clear = el => el.classList.remove('is-in', 'is-out', 'is-shown', 'is-on');
    function show(i) {
      if (idx >= 0) {
        [words[idx], imgs[idx]].forEach(el => { clear(el); el.classList.add('is-out'); });
      }
      [words[i], imgs[i]].forEach(el => { clear(el); el.classList.add('is-in'); });
      setWidth(i);
      runProg(true);
      idx = i;
    }
    function rest() {
      clearTimeout(timer); timer = 0; idx = -1;
      runProg(false);
      [...words, ...imgs].forEach(clear);
      words[0].classList.add('is-shown'); imgs[0].classList.add('is-shown');
      setWidth(0);
    }
    function play() {
      rest();
      words[0].classList.remove('is-shown'); imgs[0].classList.remove('is-shown');
      const loop = () => { show((idx + 1) % words.length); timer = setTimeout(loop, HOLD); };
      timer = setTimeout(loop, FIRST);
    }

    rest();
    if (document.fonts) document.fonts.ready.then(() => { if (idx < 0) setWidth(0); });
    let playing = false;
    const sync = () => {
      const now = slide.classList.contains('is-playing');
      if (now && !playing) play();
      if (!now && playing) rest();
      playing = now;
    };
    sync();
    new MutationObserver(sync).observe(slide, { attributes: true, attributeFilter: ['class'] });
    window.addEventListener('beforeprint', rest);
  });
})();

/* ==========================================================================
   Videos: pausar los de una slide en cuanto deja de estar activa
   (el runtime del sistema solo los pausa en la navegación siguiente).
   ========================================================================== */
(() => {
  document.querySelectorAll('.ap-slide').forEach(slide => {
    const vids = slide.querySelectorAll('video');
    if (!vids.length) return;
    new MutationObserver(() => {
      if (!slide.classList.contains('is-active')) vids.forEach(v => v.pause());
    }).observe(slide, { attributes: true, attributeFilter: ['class'] });
  });
})();
