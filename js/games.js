/* ==========================================================================
   FORZA GAMING — games.js
   Powers two pages:
     games.html        — library with search, filters, sorting, pagination
     game-details.html — single game view driven by ?id=<game-id>
   ========================================================================== */

(function () {
  'use strict';

  const PAGE_SIZE = 8;

  /* ======================================================================
     GAMES LIBRARY
     ====================================================================== */
  const Library = {
    state: { q: '', genre: 'all', platform: 'all', minRating: 0, year: 'all', sort: 'rating', shown: PAGE_SIZE },

    init() {
      this.grid = FG.qs('#gameGrid');
      if (!this.grid) return;

      this.buildControls();
      this.readUrl();
      this.bind();
      this.render();
    },

    /* Populate the filter controls from the data rather than hard-coding them */
    buildControls() {
      const genreHost = FG.qs('#genreFilters');
      if (genreHost) {
        genreHost.innerHTML = '<button class="pill active" data-genre="all">All genres</button>' +
          FG_DATA.categories.map(c => `<button class="pill" data-genre="${c.id}">${c.name}</button>`).join('');
      }

      const platformSel = FG.qs('#platformFilter');
      if (platformSel) {
        platformSel.innerHTML = '<option value="all">All platforms</option>' +
          FG_DATA.platforms.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
      }

      const yearSel = FG.qs('#yearFilter');
      if (yearSel) {
        const years = Array.from(new Set(FG_DATA.games.map(g => g.released.slice(0, 4)))).sort().reverse();
        yearSel.innerHTML = '<option value="all">Any year</option>' +
          years.map(y => `<option value="${y}">${y}</option>`).join('');
      }
    },

    /* games.html?genre=rpg&platform=ps5 deep links from the home page */
    readUrl() {
      const g = FG.param('genre'), p = FG.param('platform'), q = FG.param('q');
      if (g) {
        this.state.genre = g;
        FG.qsa('#genreFilters .pill').forEach(b => b.classList.toggle('active', b.dataset.genre === g));
      }
      if (p) {
        this.state.platform = p;
        const sel = FG.qs('#platformFilter');
        if (sel) sel.value = p;
      }
      if (q) {
        this.state.q = q;
        const input = FG.qs('#searchGames');
        if (input) input.value = q;
      }
    },

    bind() {
      const genreHost = FG.qs('#genreFilters');
      if (genreHost) {
        genreHost.addEventListener('click', e => {
          const btn = e.target.closest('[data-genre]');
          if (!btn) return;
          FG.qsa('.pill', genreHost).forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.state.genre = btn.dataset.genre;
          this.state.shown = PAGE_SIZE;
          this.render();
        });
      }

      const on = (sel, evt, fn) => { const el = FG.qs(sel); if (el) el.addEventListener(evt, fn); };

      let t;
      on('#searchGames', 'input', e => {
        clearTimeout(t);
        t = setTimeout(() => { this.state.q = e.target.value; this.state.shown = PAGE_SIZE; this.render(); }, 160);
      });
      on('#platformFilter', 'change', e => { this.state.platform = e.target.value; this.state.shown = PAGE_SIZE; this.render(); });
      on('#ratingFilter', 'change', e => { this.state.minRating = parseFloat(e.target.value) || 0; this.state.shown = PAGE_SIZE; this.render(); });
      on('#yearFilter', 'change', e => { this.state.year = e.target.value; this.state.shown = PAGE_SIZE; this.render(); });
      on('#sortSelect', 'change', e => { this.state.sort = e.target.value; this.render(); });
      on('#loadMore', 'click', () => { this.state.shown += PAGE_SIZE; this.render(); });
      on('#clearFilters', 'click', () => this.reset());
      FG.qs('#gameGrid').addEventListener('click', e => {
        if (e.target.closest('[data-clear]')) this.reset();
      });
    },

    reset() {
      this.state = { q: '', genre: 'all', platform: 'all', minRating: 0, year: 'all', sort: 'rating', shown: PAGE_SIZE };
      const q = FG.qs('#searchGames'); if (q) q.value = '';
      const p = FG.qs('#platformFilter'); if (p) p.value = 'all';
      const r = FG.qs('#ratingFilter'); if (r) r.value = '0';
      const y = FG.qs('#yearFilter'); if (y) y.value = 'all';
      const s = FG.qs('#sortSelect'); if (s) s.value = 'rating';
      FG.qsa('#genreFilters .pill').forEach(b => b.classList.toggle('active', b.dataset.genre === 'all'));
      this.render();
      FG.toast('Filters cleared', 'info');
    },

    filtered() {
      const s = this.state;
      const q = s.q.trim().toLowerCase();

      let list = FG_DATA.games.filter(g => {
        if (s.genre !== 'all') {
          const genreIds = g.genres.map(x => x.toLowerCase().replace(/\s/g, ''));
          if (g.genre !== s.genre && genreIds.indexOf(s.genre) === -1) return false;
        }
        if (s.platform !== 'all' && g.platforms.indexOf(s.platform) === -1) return false;
        if (s.minRating && g.rating < s.minRating) return false;
        if (s.year !== 'all' && g.released.slice(0, 4) !== s.year) return false;
        if (q) {
          const hay = (g.title + ' ' + g.genres.join(' ') + ' ' + g.developer + ' ' + g.publisher + ' ' + g.short).toLowerCase();
          if (hay.indexOf(q) === -1) return false;
        }
        return true;
      });

      const sorters = {
        rating: (a, b) => b.rating - a.rating,
        newest: (a, b) => b.released.localeCompare(a.released),
        oldest: (a, b) => a.released.localeCompare(b.released),
        az: (a, b) => a.title.localeCompare(b.title),
        za: (a, b) => b.title.localeCompare(a.title)
      };
      return list.sort(sorters[s.sort] || sorters.rating);
    },

    render() {
      const all = this.filtered();
      const visible = all.slice(0, this.state.shown);

      const count = FG.qs('#resultCount');
      if (count) {
        count.textContent = all.length === 0
          ? 'No games match these filters'
          : 'Showing ' + visible.length + ' of ' + all.length + ' game' + (all.length === 1 ? '' : 's');
      }

      if (!all.length) {
        this.grid.innerHTML = `
          <div class="col-12">
            <div class="empty">
              <i class="bi bi-joystick"></i>
              <h3>Nothing matches that combination</h3>
              <p>Loosen one of the filters — the rating threshold is usually the culprit.</p>
              <button class="btn btn-neon" data-clear>Clear all filters</button>
            </div>
          </div>`;
      } else {
        this.grid.innerHTML = visible.map(g => `<div class="col-6 col-lg-4 col-xxl-3">${FG.gameCard(g)}</div>`).join('');
      }

      const more = FG.qs('#loadMore');
      if (more) more.hidden = visible.length >= all.length;

      FG.observeReveal(this.grid);
      FGFav.refreshBadges();
    }
  };

  /* ======================================================================
     GAME DETAILS
     ====================================================================== */
  const Details = {
    init() {
      const host = FG.qs('#gameDetails');
      if (!host) return;

      const id = FG.param('id') || FG_DATA.games[0].id;
      const g = FG.gameById(id);

      if (!g) {
        host.innerHTML = `
          <div class="container py-5">
            <div class="empty">
              <i class="bi bi-question-circle"></i>
              <h3>That game is not in the library</h3>
              <p>The link may be out of date. Browse everything we cover instead.</p>
              <a class="btn btn-neon" href="games.html">Open the games library</a>
            </div>
          </div>`;
        return;
      }

      FGFav.pushRecent(g.id);
      document.title = g.title + ' — Forza Gaming';
      const desc = document.querySelector('meta[name="description"]');
      if (desc) desc.setAttribute('content', g.short);

      this.render(g, host);
      FG.observeReveal(host);
      FGFav.refreshBadges();
      this.bindGallery();
    },

    render(g, host) {
      const review = FG_DATA.reviews.find(r => r.gameId === g.id);
      const related = FG_DATA.games
        .filter(x => x.id !== g.id && x.genres.some(t => g.genres.indexOf(t) > -1))
        .slice(0, 4);
      const fav = FGFav.has(g.id);

      host.innerHTML = `
      <header class="page-banner" style="background:linear-gradient(to bottom, rgba(7,7,12,.35), var(--fg-bg)), url('${g.banner}') center/cover no-repeat">
        <div class="container">
          <nav class="crumbs mb-3" aria-label="Breadcrumb">
            <a href="index.html">Home</a> / <a href="games.html">Games</a> / <span>${FG.esc(g.title)}</span>
          </nav>
          <div class="row g-4 align-items-end">
            <div class="col-6 col-md-4 col-lg-3">
              <img src="${g.poster}" alt="${FG.esc(g.title)} cover" class="aspect-poster rounded-fg border-fg" style="box-shadow:var(--fg-shadow)">
            </div>
            <div class="col-lg-9">
              <h1 class="mb-2">${FG.esc(g.title)}</h1>
              <p class="mb-3" style="max-width:62ch">${FG.esc(g.short)}</p>
              <div class="d-flex flex-wrap gap-2 mb-3">
                <span class="score ${FG.scoreClass(g.rating)}">${g.rating.toFixed(1)}<small>score</small></span>
                ${g.genres.map(t => `<span class="chip chip-violet">${FG.esc(t)}</span>`).join('')}
                <span class="chip"><i class="bi bi-calendar3"></i>${FG.fmtDate(g.released)}</span>
                <span class="chip"><i class="bi bi-cash-coin"></i>${FG.esc(g.price)}</span>
              </div>
              <div class="d-flex flex-wrap gap-2">
                <button class="btn btn-neon" data-trailer="${g.id}"><i class="bi bi-play-circle me-1"></i>Watch trailer</button>
                <button class="btn ${fav ? 'btn-danger-soft' : 'btn-ghost'}" data-fav="${g.id}" aria-pressed="${fav}">
                  <i class="bi ${fav ? 'bi-heart-fill' : 'bi-heart'} me-1"></i><span>Favorite</span>
                </button>
                <a class="btn btn-ghost" href="#requirements"><i class="bi bi-pc-display me-1"></i>System requirements</a>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div class="container section">
        <div class="row g-4 g-xl-5">
          <div class="col-lg-8">
            <section class="reveal">
              <div class="rule"></div>
              <h2 class="mb-3">About this game</h2>
              <p>${FG.esc(g.description)}</p>
              <p>${FG.esc(g.title)} is developed by ${FG.esc(g.developer)} and published by ${FG.esc(g.publisher)}. It supports ${FG.esc(g.players.toLowerCase())} and is available on ${g.platforms.map(p => FG.platformName(p)).join(', ')}.</p>
            </section>

            <section class="mt-5 reveal">
              <div class="rule"></div>
              <h2 class="mb-3">Screenshots</h2>
              <div class="media-frame mb-3">
                <img id="galleryMain" src="${g.shots[0]}" alt="${FG.esc(g.title)} screenshot">
              </div>
              <div class="gallery" id="gallery">
                ${g.shots.map((s, i) => `<button type="button" class="${i === 0 ? 'active' : ''}" data-shot="${s}" aria-label="Show screenshot ${i + 1}"><img src="${s}" alt="" loading="lazy"></button>`).join('')}
              </div>
            </section>

            <section class="mt-5 reveal">
              <div class="rule"></div>
              <h2 class="mb-3">Trailer</h2>
              <div class="media-frame">
                <img src="${g.banner}" alt="">
                <button class="play-btn" data-trailer="${g.id}" aria-label="Play the ${FG.esc(g.title)} trailer"><i class="bi bi-play-fill"></i></button>
              </div>
            </section>

            ${review ? `
            <section class="mt-5 reveal" id="review">
              <div class="rule"></div>
              <h2 class="mb-3">Our review</h2>
              <div class="glass p-4">
                <div class="d-flex flex-wrap align-items-center gap-3 mb-3">
                  <span class="score ${FG.scoreClass(review.score)}" style="font-size:1.6rem;min-width:76px">${review.score.toFixed(1)}<small>/ 10</small></span>
                  <div>
                    <p class="mb-1" style="color:var(--fg-text);font-size:1.05rem">${FG.esc(review.verdict)}</p>
                    <span class="small text-dim">Reviewed by ${FG.esc(review.reviewer)} on ${FG.esc(review.platform)} · ${FG.fmtDate(review.date)}</span>
                  </div>
                </div>
                <div class="score-bar mb-4"><span style="width:${review.score * 10}%"></span></div>
                <div class="row g-4">
                  <div class="col-md-6">
                    <h3 class="h6 mb-2"><i class="bi bi-plus-circle text-success me-1"></i>What works</h3>
                    <ul class="ps-3 mb-0 text-muted-fg">${review.pros.map(p => '<li>' + FG.esc(p) + '</li>').join('')}</ul>
                  </div>
                  <div class="col-md-6">
                    <h3 class="h6 mb-2"><i class="bi bi-dash-circle text-danger me-1"></i>What does not</h3>
                    <ul class="ps-3 mb-0 text-muted-fg">${review.cons.map(c => '<li>' + FG.esc(c) + '</li>').join('')}</ul>
                  </div>
                </div>
              </div>
            </section>` : ''}

            <section class="mt-5 reveal" id="requirements">
              <div class="rule"></div>
              <h2 class="mb-3">PC system requirements</h2>
              <div class="row g-3">
                ${['min', 'rec'].map(k => `
                  <div class="col-md-6">
                    <div class="glass p-3 h-100">
                      <h3 class="h6 mb-3">${k === 'min' ? 'Minimum' : 'Recommended'}</h3>
                      <table class="spec-table">
                        <tbody>
                          <tr><th scope="row">OS</th><td>${g.requirements[k].os}</td></tr>
                          <tr><th scope="row">Processor</th><td>${g.requirements[k].cpu}</td></tr>
                          <tr><th scope="row">Memory</th><td>${g.requirements[k].ram}</td></tr>
                          <tr><th scope="row">Graphics</th><td>${g.requirements[k].gpu}</td></tr>
                          <tr><th scope="row">Storage</th><td>${g.requirements[k].storage}</td></tr>
                        </tbody>
                      </table>
                    </div>
                  </div>`).join('')}
              </div>
            </section>
          </div>

          <aside class="col-lg-4">
            <div class="glass p-4 reveal" style="position:sticky;top:6rem">
              <h2 class="h5 mb-3">Game information</h2>
              <table class="spec-table">
                <tbody>
                  <tr><th scope="row">Developer</th><td>${FG.esc(g.developer)}</td></tr>
                  <tr><th scope="row">Publisher</th><td>${FG.esc(g.publisher)}</td></tr>
                  <tr><th scope="row">Release date</th><td>${FG.fmtDate(g.released)}</td></tr>
                  <tr><th scope="row">Genres</th><td>${FG.esc(g.genres.join(', '))}</td></tr>
                  <tr><th scope="row">Players</th><td>${FG.esc(g.players)}</td></tr>
                  <tr><th scope="row">Price</th><td>${FG.esc(g.price)}</td></tr>
                  <tr><th scope="row">Platforms</th><td>${g.platforms.map(p => FG.platformName(p)).join('<br>')}</td></tr>
                </tbody>
              </table>
            </div>
          </aside>
        </div>

        ${related.length ? `
        <section class="mt-5">
          <div class="section-head">
            <div>
              <div class="rule"></div>
              <h2>More like ${FG.esc(g.title)}</h2>
            </div>
            <a class="btn btn-ghost btn-sm" href="games.html">Browse all games</a>
          </div>
          <div class="row g-3 g-lg-4">
            ${related.map(r => `<div class="col-6 col-lg-3">${FG.gameCard(r)}</div>`).join('')}
          </div>
        </section>` : ''}
      </div>`;
    },

    bindGallery() {
      const gallery = FG.qs('#gallery');
      if (!gallery) return;
      gallery.addEventListener('click', e => {
        const btn = e.target.closest('[data-shot]');
        if (!btn) return;
        FG.qsa('button', gallery).forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const main = FG.qs('#galleryMain');
        main.style.opacity = '0';
        setTimeout(() => { main.src = btn.dataset.shot; main.style.opacity = '1'; }, 140);
      });
      FG.qs('#galleryMain').style.transition = 'opacity .2s ease';
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    Library.init();
    Details.init();
  });

  /* Keep the details-page favorite button label in sync */
  document.addEventListener('fg:favorites-changed', () => {
    const btn = document.querySelector('#gameDetails [data-fav]');
    if (!btn) return;
    const active = btn.classList.contains('is-active');
    btn.classList.toggle('btn-danger-soft', active);
    btn.classList.toggle('btn-ghost', !active);
  });
})();
