/**
 * Scroll-driven presentation for the marketing page, ported from the original
 * page script. These only add classes, inline transforms and aria state to
 * static markup; nothing here owns data. Interactive pieces with state (plan
 * builder, waitlist, ticker, skyline, word splitting) are React components in
 * ./parts.
 *
 * Every setup function returns its cleanup, so React can mount and unmount
 * the page (and Strict Mode can run effects twice) without leaking listeners.
 */
type Cleanup = () => void;

const naira = (n: number) =>
  (n < 0 ? '−' : '') + '₦' + Math.abs(Math.round(n)).toLocaleString('en-NG');
const all = <T extends Element = HTMLElement>(root: ParentNode, selector: string) =>
  Array.from(root.querySelectorAll<T & Element>(selector)) as T[];

function listen(
  target: Window | Element | Document,
  type: string,
  handler: EventListener,
  options?: AddEventListenerOptions
): Cleanup {
  target.addEventListener(type, handler, options);
  return () => target.removeEventListener(type, handler, options);
}

function onScrollFrame(fn: () => void): Cleanup {
  let ticking = false;
  return listen(
    window,
    'scroll',
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        fn();
        ticking = false;
      });
    },
    {passive: true}
  );
}

function observeOnce(
  elements: Element[],
  options: IntersectionObserverInit,
  onEnter: (el: Element) => void
): Cleanup {
  const io = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        onEnter(entry.target);
        io.unobserve(entry.target);
      }
    }
  }, options);
  elements.forEach(el => io.observe(el));
  return () => io.disconnect();
}

/* nav: frost on scroll, active section, theme-color */
function nav(): Cleanup {
  const header = document.getElementById('nav');
  const meta = document.querySelector('meta[name=theme-color]');
  const root = document.documentElement;
  const update = () => {
    const scrolled = window.scrollY > 40;
    header?.classList.toggle('scrolled', scrolled);
    meta?.setAttribute(
      'content',
      scrolled && root.dataset.theme !== 'dark' ? '#F7F5F0' : '#0B0B0B'
    );
  };
  update();
  const cleanups = [listen(window, 'scroll', update, {passive: true})];

  const links = all<HTMLAnchorElement>(document, '.nav-links a');
  const spy = new IntersectionObserver(
    entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        links.forEach(a =>
          a.setAttribute(
            'aria-current',
            a.getAttribute('href') === `#${entry.target.id}` ? 'true' : 'false'
          )
        );
      }
    },
    {rootMargin: '-45% 0px -50% 0px'}
  );
  links.forEach(a => {
    const target = document.querySelector(a.getAttribute('href') ?? '');
    if (target) spy.observe(target);
  });
  cleanups.push(() => spy.disconnect());
  return () => cleanups.forEach(c => c());
}

/* reveal on scroll, staggered children, footer words */
function reveals(reduce: boolean): Cleanup {
  const rv = all(document, '.rv');
  const stg = all(document, '.stg');
  stg.forEach(container =>
    Array.from(container.children).forEach((child, i) =>
      (child as HTMLElement).style.setProperty('--i', String(i))
    )
  );
  const footer = document.querySelector('footer');
  if (reduce) {
    [...rv, ...stg, ...(footer ? [footer] : [])].forEach(el => el.classList.add('in'));
    return () => undefined;
  }
  const cleanups = [
    observeOnce(rv, {rootMargin: '0px 0px -10% 0px', threshold: 0.08}, el =>
      el.classList.add('in')
    ),
    observeOnce(
      stg.filter(el => !el.closest('[hidden]')),
      {rootMargin: '0px 0px -12% 0px', threshold: 0.1},
      el => el.classList.add('in')
    ),
  ];
  if (footer) cleanups.push(observeOnce([footer], {threshold: 0.25}, el => el.classList.add('in')));
  return () => cleanups.forEach(c => c());
}

/* closing band: the headline assembles and the band settles into a card as you scroll */
function closingBand(reduce: boolean): Cleanup {
  const apps = document.querySelector<HTMLElement>('.apps');
  if (!apps) return () => undefined;
  const words = all(apps, '#apps-title .w');
  const duo = apps.querySelector<HTMLElement>('.duo');
  const boards = all(apps, '.bb');
  if (reduce) {
    boards.forEach(b => b.classList.add('lit'));
    return () => undefined;
  }
  const OFF = [
    [-180, -90, -9],
    [150, -120, 7],
    [-90, 110, 6],
    [200, 60, -8],
    [-140, 40, 5],
    [110, -60, -4],
  ] as const;
  const assemble = () => {
    const r = apps.getBoundingClientRect();
    const vh = window.innerHeight;
    const sc = Math.min(1, window.innerWidth / 1200);
    const p = Math.max(0, Math.min(1, (vh - r.top) / (vh * 0.95)));
    const t = 1 - Math.pow(1 - p, 2.2);
    words.forEach((w, i) => {
      const o = OFF[i % OFF.length] ?? [0, 0, 0];
      w.style.transform = `translate(${(o[0] * sc * (1 - t)).toFixed(1)}px,${(o[1] * sc * (1 - t)).toFixed(1)}px) rotate(${(o[2] * (1 - t)).toFixed(2)}deg)`;
      w.style.opacity = (0.15 + 0.85 * t).toFixed(3);
    });
    apps.style.marginInline = `calc(${t.toFixed(3)} * clamp(8px,1.4vw,20px))`;
    apps.style.borderRadius = `${(36 * t).toFixed(1)}px`;
    if (duo) duo.style.transform = `translateY(${(90 * (1 - t)).toFixed(1)}px)`;
    boards.forEach((bb, i) => {
      if (t >= 0.42 + i * 0.16) bb.classList.add('lit'); // billboards switch on one after another
    });
  };
  assemble();
  const cleanups = [onScrollFrame(assemble), listen(window, 'resize', assemble)];
  return () => cleanups.forEach(c => c());
}

/* vertical journey rail */
function journey(): Cleanup {
  const rail = document.querySelector<HTMLElement>('.journey');
  if (!rail) return () => undefined;
  const fill = rail.querySelector<HTMLElement>('.j-fill');
  const mark = rail.querySelector<HTMLElement>('.j-mark');
  const links = all<HTMLAnchorElement>(rail, '.j-stops a');
  let height = 0;
  let stops: number[] = [];
  const docHeight = () => Math.max(1, document.documentElement.scrollHeight - window.innerHeight);

  const move = () => {
    const f = Math.max(0, Math.min(1, window.scrollY / docHeight()));
    const y = f * height;
    if (mark) mark.style.transform = `translateY(${y.toFixed(1)}px)`;
    if (fill) fill.style.height = `${y.toFixed(1)}px`;
    let current = -1;
    stops.forEach((stop, i) => {
      const past = f >= stop - 0.002;
      links[i]?.classList.toggle('past', past);
      if (past) current = i;
    });
    links.forEach((a, i) =>
      i === current ? a.setAttribute('aria-current', 'step') : a.removeAttribute('aria-current')
    );
    rail.classList.toggle('on', window.scrollY > window.innerHeight * 0.6);
  };
  const layout = () => {
    height = rail.clientHeight;
    const total = docHeight();
    stops = links.map(a => {
      const el = document.querySelector(a.getAttribute('href') ?? '');
      const y = el
        ? el.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.35
        : 0;
      const f = Math.max(0, Math.min(1, y / total));
      (a.parentNode as HTMLElement).style.top = `${(f * height).toFixed(1)}px`;
      return f;
    });
    move();
  };
  layout();
  const cleanups = [
    listen(window, 'scroll', () => requestAnimationFrame(move), {passive: true}),
    listen(window, 'resize', layout),
    listen(window, 'load', layout),
  ];
  return () => cleanups.forEach(c => c());
}

/* hero: screens play like billboard ads; pause off screen; gentle pull-back */
function hero(reduce: boolean): Cleanup {
  const stage = document.getElementById('stage');
  const screen = document.getElementById('home-screen');
  const heroEl = document.querySelector<HTMLElement>('.hero');
  if (!stage || !screen || !heroEl) return () => undefined;
  const scenes = all(screen, '.scene');
  const sweep = screen.querySelector<HTMLElement>('.sweep');
  const dots = all<HTMLButtonElement>(stage, '.scene-dots button');
  const callouts = all(stage, '.callout');
  let current = 0;
  let held = false;
  let visible = true;
  let autoTimer: number | undefined;
  let chopTimer: number | undefined;
  const timeouts = new Set<number>();
  const later = (fn: () => void, ms: number) => {
    const id = window.setTimeout(() => {
      timeouts.delete(id);
      fn();
    }, ms);
    timeouts.add(id);
  };

  const setCallouts = (name?: string) =>
    callouts.forEach(c => c.classList.toggle('show', c.dataset.scene === name));
  const chop = (on: boolean) => {
    window.clearInterval(chopTimer);
    const shop = screen.querySelector('[data-scene=shop]');
    if (!shop) return;
    const qs = all(shop, '.c-q span');
    const ds = all(shop, '.dish');
    let k = 0;
    qs.forEach((q, i) => (q.className = i === 0 ? 'on' : ''));
    ds.forEach((d, i) => (d.className = `dish${i === 0 ? ' on' : ''}`));
    if (!on || reduce || qs.length === 0) return;
    chopTimer = window.setInterval(() => {
      const n = (k + 1) % qs.length;
      const from = qs[k];
      const to = qs[n];
      if (from) from.className = 'out';
      if (to) to.className = 'on';
      const dk = k % ds.length;
      const dn = n % ds.length;
      if (dk !== dn) {
        const a = ds[dk];
        const b = ds[dn];
        if (a) a.className = 'dish out';
        if (b) b.className = 'dish on';
      }
      later(() => qs.forEach((q, i) => i !== n && (q.className = '')), 600);
      k = n;
    }, 1700);
  };
  const show = (n: number) => {
    if (n === current) return;
    const a = scenes[current];
    const b = scenes[n];
    if (!a || !b) return;
    dots.forEach((dot, i) => dot.setAttribute('aria-pressed', String(i === n)));
    setCallouts(b.dataset.scene);
    chop(b.dataset.scene === 'shop');
    if (reduce) {
      a.classList.remove('on');
      b.classList.add('on');
      current = n;
      return;
    }
    b.classList.remove('in');
    void b.offsetWidth;
    b.classList.add('in');
    if (sweep) {
      sweep.classList.remove('go');
      void sweep.offsetWidth;
      sweep.classList.add('go');
    }
    current = n;
    later(() => {
      a.classList.remove('on');
      b.classList.remove('in');
      b.classList.add('on');
    }, 800);
  };
  const tick = () => {
    window.clearTimeout(autoTimer);
    if (reduce) return;
    autoTimer = window.setTimeout(
      () => {
        if (!held && visible && !document.hidden) show((current + 1) % scenes.length);
        tick();
      },
      scenes[current]?.dataset.scene === 'shop' ? 7600 : 5600
    );
  };

  const cleanups: Cleanup[] = dots.map(dot =>
    listen(dot, 'click', () => {
      show(Number(dot.dataset.go));
      tick();
    })
  );
  cleanups.push(
    listen(stage, 'mouseenter', () => (held = true)),
    listen(stage, 'mouseleave', () => (held = false)),
    listen(stage, 'focusin', () => (held = true)),
    listen(stage, 'focusout', () => (held = false))
  );
  tick();

  const io = new IntersectionObserver(
    entries => {
      visible = Boolean(entries[0]?.isIntersecting);
      heroEl.classList.toggle('is-off', !visible);
    },
    {threshold: 0}
  );
  io.observe(heroEl);

  const grid = heroEl.querySelector<HTMLElement>('.hero-grid');
  const sticky = window.matchMedia('(min-width:1000px) and (min-height:700px)');
  const pull = () => {
    if (!grid) return;
    if (reduce || !sticky.matches) {
      grid.style.transform = '';
      grid.style.opacity = '';
      return;
    }
    const t = Math.max(0, Math.min(1, window.scrollY / window.innerHeight));
    grid.style.transform = `translateY(${(-50 * t).toFixed(1)}px) scale(${(1 - 0.05 * t).toFixed(4)})`;
    grid.style.opacity = (1 - 0.55 * t).toFixed(3);
  };
  pull();
  cleanups.push(listen(window, 'scroll', () => requestAnimationFrame(pull), {passive: true}));

  return () => {
    cleanups.forEach(c => c());
    io.disconnect();
    window.clearTimeout(autoTimer);
    window.clearInterval(chopTimer);
    timeouts.forEach(id => window.clearTimeout(id));
  };
}

/* how it works: the sticky phone follows the step in view */
function steps(): Cleanup {
  const stepEls = all(document, '.step');
  const shots = all(document, '#shots .shot');
  const set = (n: number) => {
    stepEls.forEach(s => s.classList.toggle('on', Number(s.dataset.step) === n));
    shots.forEach(s => s.classList.toggle('on', Number(s.dataset.s) === n));
  };
  const io = new IntersectionObserver(
    entries =>
      entries.forEach(e => e.isIntersecting && set(Number((e.target as HTMLElement).dataset.step))),
    {rootMargin: '-45% 0px -45% 0px'}
  );
  stepEls.forEach(s => io.observe(s));
  return () => io.disconnect();
}

/* families / students switch (WAI-ARIA tabs) */
function audienceSwitch(): Cleanup {
  const tabs = all<HTMLButtonElement>(document, '.switch [role=tab]');
  const thumb = document.querySelector<HTMLElement>('.switch .thumb');
  if (tabs.length === 0) return () => undefined;
  const place = (btn: HTMLElement) => {
    if (!thumb) return;
    thumb.style.width = `${btn.offsetWidth}px`;
    thumb.style.transform = `translateX(${btn.offsetLeft - 5}px)`;
  };
  const select = (btn: HTMLButtonElement) => {
    tabs.forEach(b => {
      const on = b === btn;
      b.setAttribute('aria-selected', String(on));
      b.tabIndex = on ? 0 : -1;
      const panel = document.getElementById(b.getAttribute('aria-controls') ?? '');
      if (!panel) return;
      if (on) {
        panel.hidden = false;
        panel.classList.remove('enter');
        void panel.offsetWidth;
        panel.classList.add('enter');
        all(panel, '.rv,.stg').forEach(x => x.classList.add('in'));
      } else panel.hidden = true;
    });
    place(btn);
  };
  const initial = () => {
    const selected = tabs.find(b => b.getAttribute('aria-selected') === 'true');
    if (selected) place(selected);
  };
  const cleanups = tabs.flatMap((b, i) => [
    listen(b, 'click', () => select(b)),
    listen(b, 'keydown', event => {
      const key = (event as KeyboardEvent).key;
      if (key !== 'ArrowRight' && key !== 'ArrowLeft') return;
      const next = tabs[(i + (key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
      if (!next) return;
      select(next);
      next.focus();
      event.preventDefault();
    }),
  ]);
  void document.fonts?.ready.then(initial);
  initial();
  cleanups.push(listen(window, 'resize', initial));
  return () => cleanups.forEach(c => c());
}

/* count-ups and one-time fills */
function countUps(reduce: boolean): Cleanup {
  const targets = ['timeline', 'budget-card', 'goal', 'drops-art']
    .map(id => document.getElementById(id))
    .filter((el): el is HTMLElement => el !== null);
  let frame = 0;
  const countUp = (el: HTMLElement) => {
    const to = Number(el.dataset.count);
    if (reduce || !Number.isFinite(to)) return;
    let start: number | null = null;
    const step = (ts: number) => {
      start ??= ts;
      const p = Math.min(1, (ts - start) / 1400);
      el.textContent = naira(to * (1 - Math.pow(1 - p, 4)));
      if (p < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
  };
  const stop = observeOnce(targets, {threshold: 0.35}, el => {
    el.classList.add('go');
    const counter = el.querySelector<HTMLElement>('[data-count]');
    if (counter) countUp(counter);
  });
  return () => {
    stop();
    cancelAnimationFrame(frame);
  };
}

export function setupSiteBehaviour(): Cleanup {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cleanups = [
    nav(),
    reveals(reduce),
    closingBand(reduce),
    journey(),
    hero(reduce),
    steps(),
    audienceSwitch(),
    countUps(reduce),
  ];
  return () => cleanups.forEach(c => c());
}
