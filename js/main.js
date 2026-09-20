/* ==========================================================================
   FORZA GAMING — main.js
   Site-wide behaviour: shared header/footer, search, theme, toasts,
   scroll effects, and the home page rendering.

   Load order on every page:
     data.js -> auth.js -> favorites.js -> main.js -> [page script]
   ========================================================================== */

const FG = (function () {
  'use strict';

  /* --- Small helpers ------------------------------------------------------ */
  const qs = (sel, root) => (root || document).querySelector(sel);
  const qsa = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  /** Escape user-supplied strings before injecting them into HTML. */
  function esc(str) {
    return String(str == null ? '' : str).replace(/[&<>"']/g, c => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));
  }

  /** 2026-03-19 -> 19 Mar 2026 */
  function fmtDate(iso) {
    const d = new Date(iso);
    if (isNaN(d)) return iso || '';
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  /** Relative-ish label used on news cards. */
  function timeAgo(iso) {
    const days = Math.round((Date.now() - new Date(iso).getTime()) / 86400000);
    if (days <= 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return days + ' days ago';
    return fmtDate(iso);
  }

  const scoreClass = n => (n >= 8.5 ? 's-high' : n >= 7 ? 's-mid' : 's-low');
  const param = name => new URLSearchParams(location.search).get(name);

  const gameById = id => FG_DATA.games.find(g => g.id === id);
  const newsById = id => FG_DATA.news.find(n => n.id === id);
  const platformName = id => (FG_DATA.platforms.find(p => p.id === id) || {}).name || id;
  const categoryName = id => (FG_DATA.categories.find(c => c.id === id) || {}).name || id;

  /* --- Toast notifications ------------------------------------------------ */
  const TOAST_ICONS = { ok: 'bi-check-circle-fill', info: 'bi-info-circle-fill', warn: 'bi-exclamation-triangle-fill', err: 'bi-x-octagon-fill' };

  function toast(message, type) {
    type = type || 'ok';
    let stack = qs('.toast-stack');
    if (!stack) {
      stack = document.createElement('div');
      stack.className = 'toast-stack';
      stack.setAttribute('role', 'status');
      stack.setAttribute('aria-live', 'polite');
      document.body.appendChild(stack);
    }
    const el = document.createElement('div');
    el.className = 'fg-toast ' + type;
    el.innerHTML = '<i class="bi ' + TOAST_ICONS[type] + '" aria-hidden="true"></i><div>' + esc(message) + '</div>';
    stack.appendChild(el);
    setTimeout(() => {
      el.classList.add('leaving');
      setTimeout(() => el.remove(), 260);
    }, 3200);
  }

  /* --- Shared markup ------------------------------------------------------ */
  const NAV_LINKS = [
    { href: 'index.html', label: 'Home', key: 'home' },
    { href: 'games.html', label: 'Games', key: 'games' },
    { href: 'news.html', label: 'News', key: 'news' },
    { href: 'reviews.html', label: 'Reviews', key: 'reviews' },
    { href: 'platforms.html', label: 'Platforms', key: 'platforms' },
    { href: 'community.html', label: 'Community', key: 'community' },
    { href: 'hardware.html', label: 'Hardware', key: 'hardware' },
    { href: 'esports.html', label: 'Esports', key: 'esports' },
    { href: 'about.html', label: 'About', key: 'about' }
  ];

  function navMarkup(active) {
    const user = FGAuth.current();
    const links = NAV_LINKS.map(l =>
      `<li class="nav-item"><a class="nav-link${l.key === active ? ' active" aria-current="page' : ''}" href="${l.href}">${l.label}</a></li>`
    ).join('');

    const account = user
      ? `<div class="dropdown">
           <button class="btn btn-ghost btn-sm d-flex align-items-center gap-2 dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
             <img src="${esc(user.avatar)}" alt="" class="avatar avatar-sm" width="30" height="30">
             <span class="d-none d-sm-inline">${esc(user.username)}</span>
           </button>
           <ul class="dropdown-menu dropdown-menu-end dropdown-menu-dark">
             <li><a class="dropdown-item" href="profile.html"><i class="bi bi-person me-2"></i>Profile</a></li>
             <li><a class="dropdown-item" href="dashboard.html"><i class="bi bi-speedometer2 me-2"></i>Dashboard</a></li>
             <li><a class="dropdown-item" href="dashboard.html#favorites"><i class="bi bi-heart me-2"></i>Favorites</a></li>
             ${user.role === 'admin' ? '<li><a class="dropdown-item" href="admin.html"><i class="bi bi-shield-lock me-2"></i>Admin panel</a></li>' : ''}
             <li><hr class="dropdown-divider"></li>
             <li><button class="dropdown-item text-danger" data-action="logout"><i class="bi bi-box-arrow-right me-2"></i>Sign out</button></li>
           </ul>
         </div>`
      : `<a class="btn btn-neon btn-sm" href="login.html"><i class="bi bi-person-fill me-1"></i>Sign in</a>`;

    return `
    <nav class="fg-nav" id="fgNav">
      <div class="container d-flex align-items-center gap-3">
        <a class="fg-logo" href="index.html" aria-label="Forza Gaming home">
          <span class="mark" aria-hidden="true"><i class="bi bi-controller"></i></span>
          <span class="word">FORZA<span>GAMING</span></span>
        </a>

        <ul class="navbar-nav flex-row ms-auto d-none d-xl-flex">${links}</ul>

        <div class="d-flex align-items-center gap-2 ms-auto ms-xl-0">
          <button class="icon-btn" type="button" data-bs-toggle="modal" data-bs-target="#searchModal" aria-label="Search the site">
            <i class="bi bi-search" aria-hidden="true"></i>
          </button>
          <a class="icon-btn position-relative d-none d-sm-inline-grid" href="dashboard.html#favorites" aria-label="Your favorites">
            <i class="bi bi-heart" aria-hidden="true"></i>
            <span class="count" data-fav-count hidden>0</span>
          </a>
          <button class="icon-btn" type="button" data-action="theme" aria-label="Switch colour theme">
            <i class="bi bi-moon-stars" aria-hidden="true"></i>
          </button>
          <div class="d-none d-sm-block">${account}</div>
          <button class="navbar-toggler d-xl-none" type="button" data-bs-toggle="offcanvas" data-bs-target="#fgDrawer" aria-controls="fgDrawer" aria-label="Open menu">
            <i class="bi bi-list fs-5" aria-hidden="true"></i>
          </button>
        </div>
      </div>
    </nav>

    <div class="offcanvas offcanvas-end fg-drawer" tabindex="-1" id="fgDrawer" aria-label="Site menu">
      <div class="offcanvas-header">
        <span class="fg-logo"><span class="mark" aria-hidden="true"><i class="bi bi-controller"></i></span><span class="word">FORZA<span>GAMING</span></span></span>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close menu"></button>
      </div>
      <div class="offcanvas-body d-flex flex-column">
        <ul class="navbar-nav mb-3">${links}</ul>
        <div class="mt-auto d-grid gap-2">
          ${user
            ? `<a class="btn btn-ghost" href="dashboard.html"><i class="bi bi-speedometer2 me-1"></i>Dashboard</a>
               <button class="btn btn-danger-soft" data-action="logout">Sign out</button>`
            : `<a class="btn btn-neon" href="login.html">Sign in</a>
               <a class="btn btn-ghost" href="register.html">Create account</a>`}
        </div>
      </div>
    </div>`;
  }

  function footerMarkup() {
    const platformLinks = FG_DATA.platforms.slice(0, 6)
      .map(p => `<a class="f-link" href="platforms.html#${p.id}">${p.name}</a>`).join('');
    return `
    <footer class="fg-footer">
      <div class="container">
        <div class="row g-4">
          <div class="col-lg-4">
            <a class="fg-logo mb-3" href="index.html">
              <span class="mark" aria-hidden="true"><i class="bi bi-controller"></i></span>
              <span class="word">FORZA<span>GAMING</span></span>
            </a>
            <p class="mb-3">Reviews, news and community for people who finish the games they start. Independent since 2019.</p>
            <div class="d-flex gap-2">
              <a class="social" href="#" aria-label="Forza Gaming on X"><i class="bi bi-twitter-x"></i></a>
              <a class="social" href="#" aria-label="Forza Gaming on Discord"><i class="bi bi-discord"></i></a>
              <a class="social" href="#" aria-label="Forza Gaming on YouTube"><i class="bi bi-youtube"></i></a>
              <a class="social" href="#" aria-label="Forza Gaming on Twitch"><i class="bi bi-twitch"></i></a>
              <a class="social" href="#" aria-label="Forza Gaming on Reddit"><i class="bi bi-reddit"></i></a>
            </div>
          </div>

          <div class="col-6 col-md-3 col-lg-2">
            <h4>Explore</h4>
            <a class="f-link" href="games.html">Games</a>
            <a class="f-link" href="news.html">News</a>
            <a class="f-link" href="reviews.html">Reviews</a>
            <a class="f-link" href="esports.html">Esports</a>
            <a class="f-link" href="hardware.html">Hardware</a>
          </div>

          <div class="col-6 col-md-3 col-lg-2">
            <h4>Platforms</h4>
            ${platformLinks}
          </div>

          <div class="col-md-6 col-lg-4">
            <h4>Get the Friday roundup</h4>
            <p class="mb-3">One email a week: the reviews that matter and the releases worth your time.</p>
            <form class="d-flex gap-2 flex-wrap" id="newsletterForm" novalidate>
              <label class="visually-hidden" for="newsletterEmail">Email address</label>
              <input type="email" class="form-control flex-grow-1" id="newsletterEmail" placeholder="you@example.com" required style="min-width:180px">
              <button class="btn btn-neon" type="submit">Subscribe</button>
              <div class="invalid-feedback d-block" id="newsletterMsg" role="alert"></div>
            </form>
          </div>
        </div>

        <div class="footer-bottom d-flex flex-wrap justify-content-between gap-2">
          <span>&copy; ${new Date().getFullYear()} Forza Gaming. A demo project — all content is fictional.</span>
          <span class="d-flex gap-3">
            <a class="link-quiet" href="about.html#privacy">Privacy policy</a>
            <a class="link-quiet" href="about.html#terms">Terms</a>
            <a class="link-quiet" href="about.html#contact">Contact</a>
          </span>
        </div>
      </div>
    </footer>
    <button class="to-top" id="toTop" aria-label="Back to top"><i class="bi bi-arrow-up"></i></button>`;
  }

  function searchModalMarkup() {
    return `
    <div class="modal fade search-panel" id="searchModal" tabindex="-1" aria-labelledby="searchModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-body p-3 p-md-4">
            <h2 class="visually-hidden" id="searchModalLabel">Search Forza Gaming</h2>
            <div class="d-flex align-items-center gap-2 mb-2">
              <i class="bi bi-search text-dim"></i>
              <input type="search" class="search-input" id="searchInput" placeholder="Search games, news, platforms and hardware" aria-label="Search" autocomplete="off">
              <button class="btn btn-ghost btn-sm" data-bs-dismiss="modal">Esc</button>
            </div>
            <div class="search-results mt-3" id="searchResults" role="listbox" aria-label="Search results"></div>
          </div>
        </div>
      </div>
    </div>`;
  }

  /* --- Card builders (reused across pages) -------------------------------- */
  function gameCard(g) {
    const fav = FGFav.has(g.id);
    return `
    <article class="card-fg reveal" data-game="${g.id}">
      <div class="thumb">
        <img src="${g.cover}" alt="${esc(g.title)} cover art" loading="lazy">
        <div class="thumb-top">
          <span class="chip chip-violet">${esc(categoryName(g.genre))}</span>
          <button class="fav-btn${fav ? ' is-active' : ''}" data-fav="${g.id}" aria-pressed="${fav}" aria-label="${fav ? 'Remove' : 'Add'} ${esc(g.title)} ${fav ? 'from' : 'to'} favorites">
            <i class="bi ${fav ? 'bi-heart-fill' : 'bi-heart'}" aria-hidden="true"></i>
          </button>
        </div>
        <div class="thumb-bottom">
          <span class="score ${scoreClass(g.rating)}">${g.rating.toFixed(1)}<small>score</small></span>
          <span class="chip">${g.platforms.map(p => platformShort(p)).join(' · ')}</span>
        </div>
      </div>
      <div class="body">
        <a class="title" href="game-details.html?id=${g.id}">${esc(g.title)}</a>
        <p class="excerpt">${esc(g.short)}</p>
        <div class="meta">
          <span><i class="bi bi-calendar3 me-1"></i>${fmtDate(g.released)}</span>
          <span><i class="bi bi-tag me-1"></i>${esc(g.genres.join(', '))}</span>
        </div>
        <a class="btn btn-ghost btn-sm mt-1" href="game-details.html?id=${g.id}">View details</a>
      </div>
    </article>`;
  }

  function platformShort(id) {
    return { pc: 'PC', ps5: 'PS5', ps4: 'PS4', xsx: 'XSX', xone: 'XB1', switch: 'NSW', android: 'AND', ios: 'iOS' }[id] || id;
  }

  function newsCard(n) {
    return `
    <article class="card-fg reveal">
      <div class="thumb">
        <img src="${n.image}" alt="" loading="lazy">
        <div class="thumb-top"><span class="chip chip-cyan">${esc(n.category)}</span></div>
      </div>
      <div class="body">
        <a class="title" href="news-details.html?id=${n.id}">${esc(n.title)}</a>
        <p class="excerpt">${esc(n.excerpt)}</p>
        <div class="meta">
          <span><i class="bi bi-person me-1"></i>${esc(n.author)}</span>
          <span><i class="bi bi-clock me-1"></i>${timeAgo(n.date)}</span>
        </div>
        <a class="btn btn-ghost btn-sm mt-1" href="news-details.html?id=${n.id}">Read more</a>
      </div>
    </article>`;
  }

  function reviewCard(r) {
    return `
    <article class="card-fg reveal">
      <div class="thumb">
        <img src="${r.image}" alt="${esc(r.title)}" loading="lazy">
        <div class="thumb-bottom">
          <span class="score ${scoreClass(r.score)}">${r.score.toFixed(1)}<small>/ 10</small></span>
          <span class="chip">${esc(r.platform)}</span>
        </div>
      </div>
      <div class="body">
        <a class="title" href="game-details.html?id=${r.gameId}">${esc(r.title)}</a>
        <p class="excerpt">${esc(r.verdict)}</p>
        <div class="score-bar mb-2"><span style="width:${r.score * 10}%"></span></div>
        <div class="row g-2 small">
          <div class="col-6">
            <div class="text-dim mb-1"><i class="bi bi-plus-circle text-success"></i> Strengths</div>
            <ul class="ps-3 mb-0 text-muted-fg">${r.pros.slice(0, 2).map(p => '<li>' + esc(p) + '</li>').join('')}</ul>
          </div>
          <div class="col-6">
            <div class="text-dim mb-1"><i class="bi bi-dash-circle text-danger"></i> Drawbacks</div>
            <ul class="ps-3 mb-0 text-muted-fg">${r.cons.slice(0, 2).map(c => '<li>' + esc(c) + '</li>').join('')}</ul>
          </div>
        </div>
        <div class="meta">
          <span><i class="bi bi-pen me-1"></i>${esc(r.reviewer)}</span>
          <span><i class="bi bi-calendar3 me-1"></i>${fmtDate(r.date)}</span>
        </div>
        <a class="btn btn-ghost btn-sm" href="game-details.html?id=${r.gameId}#review">Read full review</a>
      </div>
    </article>`;
  }

  /* --- Scroll reveal ------------------------------------------------------- */
  function observeReveal(root) {
    const items = qsa('.reveal:not(.in)', root || document);
    if (!('IntersectionObserver' in window)) { items.forEach(i => i.classList.add('in')); return; }
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((e, idx) => {
        if (!e.isIntersecting) return;
        // Slight stagger keeps a group of cards from snapping in all at once.
        setTimeout(() => e.target.classList.add('in'), Math.min(idx * 60, 240));
        obs.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -60px 0px', threshold: .08 });
    items.forEach(i => io.observe(i));
  }

  /* --- Animated counters --------------------------------------------------- */
  function runCounters(root) {
    qsa('[data-count]', root || document).forEach(el => {
      if (el.dataset.counted) return;
      const target = parseFloat(el.dataset.count);
      const io = new IntersectionObserver(entries => {
        if (!entries[0].isIntersecting) return;
        io.disconnect();
        el.dataset.counted = '1';
        const dur = 1200, start = performance.now();
        const decimals = (el.dataset.count.split('.')[1] || '').length;
        (function step(now) {
          const p = Math.min((now - start) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          const val = target * eased;
          el.textContent = decimals ? val.toFixed(decimals) : Math.round(val).toLocaleString();
          if (p < 1) requestAnimationFrame(step);
        })(start);
      }, { threshold: .4 });
      io.observe(el);
    });
  }

  /* --- Search -------------------------------------------------------------- */
  function buildIndex() {
    const idx = [];
    FG_DATA.games.forEach(g => idx.push({ type: 'Game', label: g.title, sub: g.genres.join(', ') + ' · ' + fmtDate(g.released), img: g.cover, url: 'game-details.html?id=' + g.id, hay: (g.title + ' ' + g.genres.join(' ') + ' ' + g.developer + ' ' + g.short).toLowerCase() }));
    FG_DATA.news.forEach(n => idx.push({ type: 'News', label: n.title, sub: n.category + ' · ' + fmtDate(n.date), img: n.image, url: 'news-details.html?id=' + n.id, hay: (n.title + ' ' + n.category + ' ' + n.excerpt).toLowerCase() }));
    FG_DATA.platforms.forEach(p => idx.push({ type: 'Platform', label: p.name, sub: p.tagline, img: '', url: 'platforms.html#' + p.id, hay: (p.name + ' ' + p.tagline).toLowerCase() }));
    FG_DATA.hardware.forEach(h => idx.push({ type: 'Hardware', label: h.name, sub: h.type + ' · ' + h.price, img: h.image, url: 'hardware.html#' + h.id, hay: (h.name + ' ' + h.type + ' ' + h.blurb).toLowerCase() }));
    return idx;
  }

  let SEARCH_INDEX = null;

  function search(term) {
    SEARCH_INDEX = SEARCH_INDEX || buildIndex();
    const q = term.trim().toLowerCase();
    if (!q) return [];
    return SEARCH_INDEX.filter(i => i.hay.indexOf(q) > -1).slice(0, 12);
  }

  function initSearch() {
    const input = qs('#searchInput');
    const out = qs('#searchResults');
    if (!input || !out) return;

    const placeholder = `<p class="text-dim small mb-2">Try “Kingdom of Glass”, “Xbox”, “OLED” or a genre.</p>
      <div class="pill-row">${['RPG', 'Horror', 'Esports', 'Racing', 'Hardware'].map(t => `<button class="pill" data-suggest="${t}">${t}</button>`).join('')}</div>`;
    out.innerHTML = placeholder;

    function render(term) {
      if (!term.trim()) { out.innerHTML = placeholder; return; }
      const results = search(term);
      if (!results.length) {
        out.innerHTML = `<div class="empty py-4"><i class="bi bi-binoculars"></i><h3 class="h6 mt-2">No matches for “${esc(term)}”</h3><p class="small mb-0">Check the spelling, or browse the <a href="games.html">games library</a>.</p></div>`;
        return;
      }
      out.innerHTML = results.map(r => `
        <a class="search-result" href="${r.url}" role="option">
          ${r.img ? `<img src="${r.img}" alt="" loading="lazy">` : `<span class="search-result-ico chip chip-cyan">${r.type}</span>`}
          <span class="flex-grow-1">
            <span class="r-title d-block">${esc(r.label)}</span>
            <span class="r-sub">${r.img ? r.type + ' · ' : ''}${esc(r.sub)}</span>
          </span>
          <i class="bi bi-arrow-right-short fs-5 text-dim"></i>
        </a>`).join('');
    }

    let t;
    input.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => render(input.value), 140); });
    out.addEventListener('click', e => {
      const s = e.target.closest('[data-suggest]');
      if (!s) return;
      input.value = s.dataset.suggest;
      render(input.value);
      input.focus();
    });

    const modal = qs('#searchModal');
    modal.addEventListener('shown.bs.modal', () => input.focus());

    // Keyboard shortcut: "/" or Ctrl/Cmd+K opens search
    document.addEventListener('keydown', e => {
      const typing = /^(input|textarea|select)$/i.test(document.activeElement.tagName);
      if ((e.key === '/' && !typing) || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k')) {
        e.preventDefault();
        bootstrap.Modal.getOrCreateInstance(modal).show();
      }
    });
  }

  /* --- Theme --------------------------------------------------------------- */
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    qsa('[data-action="theme"] i').forEach(i => {
      i.className = theme === 'light' ? 'bi bi-sun-fill' : 'bi bi-moon-stars';
    });
  }

  function initTheme() {
    applyTheme(localStorage.getItem('fg-theme') || 'dark');
    document.addEventListener('click', e => {
      if (!e.target.closest('[data-action="theme"]')) return;
      const next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      localStorage.setItem('fg-theme', next);
      applyTheme(next);
      toast(next === 'light' ? 'Light theme on' : 'Dark theme on', 'info');
    });
  }

  /* --- Particles ------------------------------------------------------------ */
  function initParticles(host) {
    if (!host || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const count = window.innerWidth < 768 ? 14 : 30;
    let html = '';
    for (let i = 0; i < count; i++) {
      const left = Math.random() * 100;
      const dur = 9 + Math.random() * 14;
      const delay = Math.random() * 12;
      const size = 2 + Math.random() * 3;
      html += `<span class="particle" style="left:${left}%;animation-duration:${dur}s;animation-delay:-${delay}s;width:${size}px;height:${size}px"></span>`;
    }
    host.innerHTML = html;
  }

  /* --- Chrome bootstrap ----------------------------------------------------- */
  function mountChrome() {
    const page = document.body.dataset.page || '';
    const navHost = qs('#siteNav');
    const footHost = qs('#siteFooter');
    if (navHost) navHost.innerHTML = navMarkup(page);
    if (footHost) footHost.innerHTML = footerMarkup();
    document.body.insertAdjacentHTML('beforeend', searchModalMarkup());

    // Sticky navbar state
    const nav = qs('#fgNav');
    const onScroll = () => {
      if (nav) nav.classList.toggle('is-stuck', window.scrollY > 24);
      const top = qs('#toTop');
      if (top) top.classList.toggle('show', window.scrollY > 600);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    const top = qs('#toTop');
    if (top) top.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

    // Newsletter (demo only — nothing is sent anywhere)
    const nl = qs('#newsletterForm');
    if (nl) {
      nl.addEventListener('submit', e => {
        e.preventDefault();
        const field = qs('#newsletterEmail');
        const msg = qs('#newsletterMsg');
        const ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(field.value.trim());
        field.classList.toggle('is-invalid', !ok);
        msg.textContent = ok ? '' : 'Enter a valid email address, for example you@example.com';
        if (ok) { toast('Subscribed. Check your inbox on Friday.', 'ok'); nl.reset(); }
      });
    }

    initSearch();
    initTheme();
    FGFav.refreshBadges();
  }

  /* --- Broken image fallback ------------------------------------------------ */
  function initImageFallback() {
    document.addEventListener('error', e => {
      const el = e.target;
      if (el.tagName !== 'IMG' || el.dataset.fallbackApplied) return;
      el.dataset.fallbackApplied = '1';
      el.src = 'assets/images/placeholder.svg';
    }, true);
  }

  /* --- Home page ------------------------------------------------------------ */
  const HomePage = {
    init() {
      this.heroGames = FG_DATA.games.filter(g => g.featured).slice(0, 4);
      this.index = 0;
      this.renderHero();
      this.bindHero();
      this.renderFeatured();
      this.renderCategories();
      this.renderNews();
      this.renderReviews();
      this.renderPlatformStrip();
      initParticles(qs('#particles'));
      observeReveal();
      runCounters();
    },

    renderHero() {
      const g = this.heroGames[this.index];
      const host = qs('#heroContent');
      const media = qs('#heroMedia');
      if (!host || !g) return;
      media.innerHTML = `<img src="${g.banner}" alt="" fetchpriority="high">`;
      host.innerHTML = `
        <span class="hero-eyebrow"><i class="bi bi-stars"></i>Featured this week</span>
        <h1>${esc(g.title)}</h1>
        <p class="hero-copy">${esc(g.description.split('. ')[0])}.</p>
        <div class="hero-meta">
          <span class="chip chip-violet"><i class="bi bi-tag-fill"></i>${esc(g.genres.join(' · '))}</span>
          <span class="chip chip-cyan"><i class="bi bi-star-fill"></i>${g.rating.toFixed(1)} / 10</span>
          <span class="chip"><i class="bi bi-calendar3"></i>${fmtDate(g.released)}</span>
          <span class="chip"><i class="bi bi-people-fill"></i>${esc(g.players)}</span>
        </div>
        <div class="d-flex flex-wrap gap-2 hero-actions">
          <a class="btn btn-neon" href="game-details.html?id=${g.id}"><i class="bi bi-book me-1"></i>Read more</a>
          <button class="btn btn-ghost" data-trailer="${g.id}"><i class="bi bi-play-circle me-1"></i>Watch trailer</button>
        </div>`;
      qsa('#heroDots button').forEach((b, i) => b.classList.toggle('active', i === this.index));
    },

    bindHero() {
      const dots = qs('#heroDots');
      if (dots) {
        dots.innerHTML = this.heroGames.map((g, i) =>
          `<button type="button" class="${i === 0 ? 'active' : ''}" aria-label="Show ${esc(g.title)}"></button>`).join('');
        dots.addEventListener('click', e => {
          const btn = e.target.closest('button');
          if (!btn) return;
          this.index = Array.from(dots.children).indexOf(btn);
          this.renderHero();
        });
      }
      // Auto-advance, paused when the tab is hidden or the user prefers less motion
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        setInterval(() => {
          if (document.hidden) return;
          this.index = (this.index + 1) % this.heroGames.length;
          this.renderHero();
        }, 7000);
      }
      // Parallax on the hero image
      const media = qs('#heroMedia img');
      window.addEventListener('scroll', () => {
        const img = qs('#heroMedia img');
        if (!img || window.scrollY > 900) return;
        img.style.transform = 'scale(1.06) translateY(' + (window.scrollY * 0.18) + 'px)';
      }, { passive: true });
    },

    renderFeatured() {
      const host = qs('#featuredGames');
      if (!host) return;
      host.innerHTML = FG_DATA.games.filter(g => g.featured).slice(0, 8)
        .map(g => `<div class="col-6 col-lg-4 col-xxl-3">${gameCard(g)}</div>`).join('');
    },

    renderCategories() {
      const host = qs('#categoryGrid');
      if (!host) return;
      host.innerHTML = FG_DATA.categories.map(c => {
        const count = FG_DATA.games.filter(g => g.genres.map(x => x.toLowerCase().replace(' ', '')).includes(c.id) || g.genre === c.id).length;
        return `<div class="col-6 col-md-4 col-xl-3 reveal">
          <a class="cat-tile h-100" href="games.html?genre=${c.id}">
            <i class="bi ${c.icon}" aria-hidden="true"></i>
            <strong>${c.name}</strong>
            <span>${c.blurb}</span>
            <span class="mt-2 text-dim small">${count} title${count === 1 ? '' : 's'}</span>
          </a>
        </div>`;
      }).join('');
    },

    renderNews() {
      const lead = qs('#newsLead');
      const rest = qs('#newsRest');
      if (!lead) return;
      const items = FG_DATA.news.slice(0, 5);
      const n = items[0];
      lead.innerHTML = `
        <article class="card-fg reveal h-100">
          <div class="thumb" style="aspect-ratio:16/9">
            <img src="${n.image}" alt="" loading="lazy">
            <div class="thumb-top"><span class="chip chip-cyan">${esc(n.category)}</span></div>
          </div>
          <div class="body">
            <a class="title" href="news-details.html?id=${n.id}" style="font-size:1.4rem">${esc(n.title)}</a>
            <p class="excerpt" style="-webkit-line-clamp:4">${esc(n.excerpt)}</p>
            <div class="meta">
              <span><i class="bi bi-person me-1"></i>${esc(n.author)}</span>
              <span><i class="bi bi-clock me-1"></i>${timeAgo(n.date)}</span>
            </div>
            <a class="btn btn-neon btn-sm mt-1" href="news-details.html?id=${n.id}">Read the story</a>
          </div>
        </article>`;
      rest.innerHTML = items.slice(1).map(item => `
        <a class="row-item reveal mb-2 text-decoration-none" href="news-details.html?id=${item.id}">
          <img src="${item.image}" alt="" width="84" height="58" style="object-fit:cover;border-radius:8px" loading="lazy">
          <span>
            <span class="d-block text-dim small mb-1">${esc(item.category)} · ${timeAgo(item.date)}</span>
            <span class="d-block fw-semibold line-clamp-2" style="color:var(--fg-text)">${esc(item.title)}</span>
          </span>
        </a>`).join('');
    },

    renderReviews() {
      const host = qs('#latestReviews');
      if (!host) return;
      host.innerHTML = FG_DATA.reviews.slice(0, 3)
        .map(r => `<div class="col-md-6 col-xl-4">${reviewCard(r)}</div>`).join('');
    },

    renderPlatformStrip() {
      const host = qs('#platformStrip');
      if (!host) return;
      host.innerHTML = FG_DATA.platforms.map(p => `
        <a class="col-6 col-md-3 col-xl-2 text-decoration-none reveal" href="platforms.html#${p.id}">
          <div class="glass p-3 text-center h-100">
            <i class="bi ${p.icon} fs-3" style="color:${p.accent}"></i>
            <div class="fw-semibold mt-2" style="color:var(--fg-text)">${p.name}</div>
            <div class="small text-dim">${p.library.toLocaleString()} titles</div>
          </div>
        </a>`).join('');
    }
  };

  /* --- Trailer modal (shared) ---------------------------------------------- */
  function initTrailerHandler() {
    document.addEventListener('click', e => {
      const btn = e.target.closest('[data-trailer]');
      if (!btn) return;
      const g = gameById(btn.dataset.trailer);
      if (!g) return;
      let modal = qs('#trailerModal');
      if (!modal) {
        document.body.insertAdjacentHTML('beforeend', `
          <div class="modal fade" id="trailerModal" tabindex="-1" aria-labelledby="trailerTitle" aria-hidden="true">
            <div class="modal-dialog modal-lg modal-dialog-centered">
              <div class="modal-content">
                <div class="modal-header">
                  <h3 class="modal-title h5" id="trailerTitle">Trailer</h3>
                  <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                  <div class="media-frame"><img id="trailerImg" src="" alt=""><button class="play-btn" aria-label="Play trailer"><i class="bi bi-play-fill"></i></button></div>
                  <p class="small text-dim mt-3 mb-0">Video playback is not wired up in this demo build — the trailer frame is a placeholder.</p>
                </div>
              </div>
            </div>
          </div>`);
        modal = qs('#trailerModal');
      }
      qs('#trailerTitle').textContent = g.title + ' — official trailer';
      qs('#trailerImg').src = g.banner;
      bootstrap.Modal.getOrCreateInstance(modal).show();
    });
  }

  /* --- Public API ----------------------------------------------------------- */
  return {
    qs, qsa, esc, fmtDate, timeAgo, scoreClass, param,
    gameById, newsById, platformName, platformShort, categoryName,
    toast, gameCard, newsCard, reviewCard,
    observeReveal, runCounters, initParticles, search,
    HomePage,
    boot() {
      initImageFallback();
      mountChrome();
      initTrailerHandler();
      document.body.classList.add('page-fade');
      if (document.body.dataset.page === 'home') HomePage.init();
      else { observeReveal(); runCounters(); }
    }
  };
})();

document.addEventListener('DOMContentLoaded', () => FG.boot());
