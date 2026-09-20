/* ==========================================================================
   FORZA GAMING — pages.js
   Smaller page controllers: reviews, platforms, community, hardware, esports.
   Each one exits immediately if its host element is not on the page.
   ========================================================================== */

(function () {
  'use strict';

  /* ======================================================================
     REVIEWS
     ====================================================================== */
  const Reviews = {
    state: { platform: 'all', sort: 'score' },

    init() {
      this.grid = FG.qs('#reviewGrid');
      if (!this.grid) return;

      const host = FG.qs('#reviewFilters');
      if (host) {
        const platforms = Array.from(new Set(FG_DATA.reviews.map(r => r.platform)));
        host.innerHTML = '<button class="pill active" data-rp="all">All platforms</button>' +
          platforms.map(p => `<button class="pill" data-rp="${p}">${p}</button>`).join('');
        host.addEventListener('click', e => {
          const btn = e.target.closest('[data-rp]');
          if (!btn) return;
          FG.qsa('.pill', host).forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.state.platform = btn.dataset.rp;
          this.render();
        });
      }

      const sort = FG.qs('#reviewSort');
      if (sort) sort.addEventListener('change', e => { this.state.sort = e.target.value; this.render(); });

      this.renderSpotlight();
      this.render();
    },

    renderSpotlight() {
      const host = FG.qs('#reviewSpotlight');
      if (!host) return;
      const r = FG_DATA.reviews.slice().sort((a, b) => b.score - a.score)[0];
      host.innerHTML = `
        <div class="glass overflow-hidden reveal">
          <div class="row g-0 align-items-stretch">
            <div class="col-lg-6">
              <img src="${r.image}" alt="${FG.esc(r.title)}" style="width:100%;height:100%;min-height:260px;object-fit:cover">
            </div>
            <div class="col-lg-6 p-4 p-xl-5">
              <span class="chip chip-green mb-3 d-inline-flex"><i class="bi bi-award-fill"></i>Highest rated this season</span>
              <h2 class="mb-2">${FG.esc(r.title)}</h2>
              <p class="mb-3">${FG.esc(r.verdict)}</p>
              <div class="d-flex align-items-center gap-3 mb-3">
                <span class="score ${FG.scoreClass(r.score)}" style="font-size:1.6rem;min-width:78px">${r.score.toFixed(1)}<small>/ 10</small></span>
                <div class="flex-grow-1">
                  <div class="score-bar"><span style="width:${r.score * 10}%"></span></div>
                  <span class="small text-dim">Reviewed by ${FG.esc(r.reviewer)} on ${FG.esc(r.platform)}</span>
                </div>
              </div>
              <a class="btn btn-neon" href="game-details.html?id=${r.gameId}#review">Read the full review</a>
            </div>
          </div>
        </div>`;
      FG.observeReveal(host);
    },

    render() {
      let list = FG_DATA.reviews.slice();
      if (this.state.platform !== 'all') list = list.filter(r => r.platform === this.state.platform);
      const sorters = {
        score: (a, b) => b.score - a.score,
        low: (a, b) => a.score - b.score,
        newest: (a, b) => b.date.localeCompare(a.date),
        az: (a, b) => a.title.localeCompare(b.title)
      };
      list.sort(sorters[this.state.sort] || sorters.score);

      this.grid.innerHTML = list.length
        ? list.map(r => `<div class="col-md-6 col-xl-4">${FG.reviewCard(r)}</div>`).join('')
        : `<div class="col-12"><div class="empty"><i class="bi bi-star"></i><h3>No reviews on that platform yet</h3><p>We publish two to three reviews a week. Check the other platforms in the meantime.</p></div></div>`;
      FG.observeReveal(this.grid);
    }
  };

  /* ======================================================================
     PLATFORMS
     ====================================================================== */
  const Platforms = {
    init() {
      const host = FG.qs('#platformList');
      if (!host) return;

      host.innerHTML = FG_DATA.platforms.map(p => {
        const games = FG_DATA.games.filter(g => g.platforms.indexOf(p.id) > -1)
          .sort((a, b) => b.rating - a.rating).slice(0, 4);
        return `
        <section class="mb-5 reveal" id="${p.id}">
          <div class="glass p-4 p-lg-5" style="border-left:3px solid ${p.accent}">
            <div class="row g-4 align-items-center">
              <div class="col-lg-5">
                <div class="d-flex align-items-center gap-3 mb-3">
                  <span style="width:56px;height:56px;border-radius:14px;display:grid;place-items:center;font-size:1.6rem;color:#fff;background:linear-gradient(140deg, ${p.accent}, rgba(139,92,246,.7))">
                    <i class="bi ${p.icon}" aria-hidden="true"></i>
                  </span>
                  <div>
                    <h2 class="mb-0">${p.name}</h2>
                    <span class="small text-dim">${FG.esc(p.tagline)}</span>
                  </div>
                </div>
                <p>${FG.esc(p.blurb)}</p>
                <div class="d-flex flex-wrap gap-3 mt-3">
                  <div>
                    <div class="h4 mb-0" style="color:${p.accent};font-family:var(--fg-display)">${p.library.toLocaleString()}</div>
                    <div class="small text-dim">titles tracked</div>
                  </div>
                  <div>
                    <div class="h4 mb-0" style="color:${p.accent};font-family:var(--fg-display)">${games.length ? (games.reduce((s, g) => s + g.rating, 0) / games.length).toFixed(1) : '—'}</div>
                    <div class="small text-dim">avg. top score</div>
                  </div>
                </div>
                <a class="btn btn-ghost btn-sm mt-3" href="games.html?platform=${p.id}">Browse ${p.name} games</a>
              </div>
              <div class="col-lg-7">
                <h3 class="h6 mb-3">Best rated on ${p.name}</h3>
                <div class="d-flex flex-column gap-2">
                  ${games.map(g => `
                    <a class="row-item text-decoration-none" href="game-details.html?id=${g.id}">
                      <img src="${g.cover}" alt="" width="70" height="48" style="object-fit:cover;border-radius:8px" loading="lazy">
                      <span class="flex-grow-1">
                        <span class="d-block fw-semibold" style="color:var(--fg-text)">${FG.esc(g.title)}</span>
                        <span class="small text-dim">${FG.esc(g.genres.join(' · '))}</span>
                      </span>
                      <span class="score ${FG.scoreClass(g.rating)}" style="font-size:.95rem;min-width:44px">${g.rating.toFixed(1)}</span>
                    </a>`).join('')}
                </div>
              </div>
            </div>
          </div>
        </section>`;
      }).join('');

      FG.observeReveal(host);

      // Jump to a platform if the URL carries a hash (#ps5 etc.)
      if (location.hash) {
        const target = document.getElementById(location.hash.slice(1));
        if (target) setTimeout(() => target.scrollIntoView({ behavior: 'smooth', block: 'start' }), 260);
      }
    }
  };

  /* ======================================================================
     COMMUNITY
     ====================================================================== */
  const Community = {
    KEY: 'fg-community-posts',

    init() {
      this.host = FG.qs('#threadList');
      if (!this.host) return;
      this.renderThreads();
      this.renderTrending();
      this.renderMembers();
      this.bind();
    },

    posts() {
      try { return JSON.parse(localStorage.getItem(this.KEY)) || []; }
      catch (e) { return []; }
    },

    all() {
      return this.posts().concat(FG_DATA.community.threads);
    },

    renderThreads() {
      const list = this.all();
      this.host.innerHTML = list.map(t => `
        <article class="row-item reveal mb-3" data-thread="${t.id}">
          <img src="${t.avatarUrl || FGAuth.avatarFor(t.author)}" alt="" class="avatar" loading="lazy">
          <div class="flex-grow-1">
            <div class="d-flex flex-wrap align-items-center gap-2 mb-1">
              ${t.pinned ? '<span class="chip chip-amber"><i class="bi bi-pin-angle-fill"></i>Pinned</span>' : ''}
              <span class="chip chip-violet">${FG.esc(t.board)}</span>
              <span class="small text-dim">by ${FG.esc(t.author)} · ${FG.esc(t.last)}</span>
            </div>
            <h3 class="h6 mb-1" style="color:var(--fg-text)">${FG.esc(t.title)}</h3>
            <p class="small mb-2">${FG.esc(t.preview)}</p>
            <div class="d-flex flex-wrap gap-3 small text-dim">
              <button class="btn btn-ghost btn-sm" data-like="${t.id}">
                <i class="bi bi-heart me-1"></i><span>${t.likes}</span>
              </button>
              <span class="d-flex align-items-center"><i class="bi bi-chat-dots me-1"></i>${t.replies} replies</span>
              <span class="d-flex align-items-center"><i class="bi bi-eye me-1"></i>${(t.likes * 7).toLocaleString()} views</span>
            </div>
          </div>
        </article>`).join('');
      FG.observeReveal(this.host);
    },

    renderTrending() {
      const host = FG.qs('#trendingTopics');
      if (!host) return;
      host.innerHTML = FG_DATA.community.trending
        .map(t => `<button class="pill" data-topic="${FG.esc(t)}"><i class="bi bi-fire me-1"></i>${FG.esc(t)}</button>`).join('');
    },

    renderMembers() {
      const host = FG.qs('#topMembers');
      if (!host) return;
      host.innerHTML = FG_DATA.community.members.map((m, i) => `
        <div class="d-flex align-items-center gap-3 py-2">
          <span class="text-dim" style="width:1.2rem;font-family:var(--fg-display)">${i + 1}</span>
          <img src="${m.avatarUrl}" alt="" class="avatar avatar-sm" loading="lazy">
          <div class="flex-grow-1">
            <div class="fw-semibold" style="color:var(--fg-text);font-size:.92rem">${FG.esc(m.handle)}</div>
            <div class="small text-dim">${m.posts.toLocaleString()} posts</div>
          </div>
          <span class="chip chip-cyan">${FG.esc(m.badge)}</span>
        </div>`).join('');
    },

    bind() {
      // Likes are per-browser and reset with localStorage.
      this.host.addEventListener('click', e => {
        const like = e.target.closest('[data-like]');
        if (!like) return;
        const span = like.querySelector('span');
        const active = like.classList.toggle('btn-danger-soft');
        like.querySelector('i').className = 'bi ' + (active ? 'bi-heart-fill' : 'bi-heart') + ' me-1';
        span.textContent = parseInt(span.textContent, 10) + (active ? 1 : -1);
      });

      const trending = FG.qs('#trendingTopics');
      if (trending) {
        trending.addEventListener('click', e => {
          const btn = e.target.closest('[data-topic]');
          if (btn) FG.toast('Topic feeds are not wired up in this demo build', 'info');
        });
      }

      const form = FG.qs('#newPostForm');
      if (form) {
        form.addEventListener('submit', e => {
          e.preventDefault();
          const user = FGAuth.current();
          if (!user) {
            FG.toast('Sign in to post — try the demo account on the login page', 'warn');
            setTimeout(() => { location.href = 'login.html?next=community.html'; }, 900);
            return;
          }
          const title = form.title.value.trim();
          const body = form.body.value.trim();
          if (title.length < 6) { FGAuth.setError(form.title, 'Give the thread a clearer title.'); return; }
          FGAuth.setError(form.title, '');
          if (body.length < 12) { FGAuth.setError(form.body, 'Add a little more detail so people can reply.'); return; }
          FGAuth.setError(form.body, '');

          const post = {
            id: 'p' + Date.now(),
            title, preview: body,
            author: user.username,
            avatarUrl: user.avatar,
            board: form.board.value,
            replies: 0, likes: 0,
            last: 'just now'
          };
          const posts = this.posts();
          posts.unshift(post);
          try { localStorage.setItem(this.KEY, JSON.stringify(posts)); } catch (err) {}
          form.reset();
          this.renderThreads();
          FG.toast('Thread posted to the demo board', 'ok');
          bootstrap.Modal.getInstance(FG.qs('#newPostModal')).hide();
        });
      }
    }
  };

  /* ======================================================================
     HARDWARE
     ====================================================================== */
  const Hardware = {
    init() {
      this.grid = FG.qs('#hardwareGrid');
      if (!this.grid) return;

      const host = FG.qs('#hardwareFilters');
      const types = Array.from(new Set(FG_DATA.hardware.map(h => h.type)));
      if (host) {
        host.innerHTML = '<button class="pill active" data-ht="all">Everything</button>' +
          types.map(t => `<button class="pill" data-ht="${t}">${t}</button>`).join('');
        host.addEventListener('click', e => {
          const btn = e.target.closest('[data-ht]');
          if (!btn) return;
          FG.qsa('.pill', host).forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.render(btn.dataset.ht);
        });
      }
      this.render('all');
    },

    render(type) {
      const list = type === 'all' ? FG_DATA.hardware : FG_DATA.hardware.filter(h => h.type === type);
      this.grid.innerHTML = list.map(h => `
        <div class="col-md-6 col-xl-4" id="${h.id}">
          <article class="card-fg reveal">
            <div class="thumb" style="aspect-ratio:16/10">
              <img src="${h.image}" alt="${FG.esc(h.name)}" loading="lazy">
              <div class="thumb-top"><span class="chip chip-violet">${FG.esc(h.type)}</span></div>
              <div class="thumb-bottom">
                <span class="score ${FG.scoreClass(h.rating)}">${h.rating.toFixed(1)}<small>/ 10</small></span>
                <span class="chip chip-green">${FG.esc(h.price)}</span>
              </div>
            </div>
            <div class="body">
              <h3 class="title">${FG.esc(h.name)}</h3>
              <p class="excerpt">${FG.esc(h.blurb)}</p>
              <ul class="list-unstyled small mb-0 text-muted-fg">
                ${h.specs.map(s => `<li class="d-flex gap-2"><i class="bi bi-check2 text-success"></i>${FG.esc(s)}</li>`).join('')}
              </ul>
              <div class="meta"><span><i class="bi bi-box-seam me-1"></i>In stock at partner retailers</span></div>
            </div>
          </article>
        </div>`).join('');
      FG.observeReveal(this.grid);
    }
  };

  /* ======================================================================
     ESPORTS
     ====================================================================== */
  const Esports = {
    init() {
      if (!FG.qs('#tournamentGrid')) return;
      this.renderTournaments();
      this.renderMatches('all');
      this.renderTeams();
      this.renderPlayers();

      const tabs = FG.qs('#matchTabs');
      if (tabs) {
        tabs.addEventListener('click', e => {
          const btn = e.target.closest('[data-match-tab]');
          if (!btn) return;
          FG.qsa('.nav-link', tabs).forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.renderMatches(btn.dataset.matchTab);
        });
      }
    },

    renderTournaments() {
      const host = FG.qs('#tournamentGrid');
      const statusChip = { Live: 'chip-red', Upcoming: 'chip-cyan', Finished: 'chip' };
      host.innerHTML = FG_DATA.esports.tournaments.map(t => `
        <div class="col-md-6 col-xl-3">
          <article class="card-fg reveal">
            <div class="thumb" style="aspect-ratio:16/10">
              <img src="${t.image}" alt="" loading="lazy">
              <div class="thumb-top">
                <span class="chip ${statusChip[t.status]}">${t.status === 'Live' ? '<i class="bi bi-broadcast"></i>' : ''}${t.status}</span>
              </div>
              <div class="thumb-bottom"><span class="chip chip-green">${t.prize}</span></div>
            </div>
            <div class="body">
              <h3 class="title">${FG.esc(t.name)}</h3>
              <p class="excerpt">${FG.esc(t.game)} · ${t.teams} teams</p>
              <div class="meta">
                <span><i class="bi bi-geo-alt me-1"></i>${FG.esc(t.location)}</span>
                <span><i class="bi bi-calendar3 me-1"></i>${FG.esc(t.dates)}</span>
              </div>
            </div>
          </article>
        </div>`).join('');
      FG.observeReveal(host);
    },

    renderMatches(filter) {
      const host = FG.qs('#matchList');
      if (!host) return;
      const list = filter === 'all' ? FG_DATA.esports.matches : FG_DATA.esports.matches.filter(m => m.status === filter);
      host.innerHTML = list.length ? list.map(m => `
        <div class="row-item mb-2 reveal">
          <span class="text-end flex-grow-1 fw-semibold" style="color:var(--fg-text)">${FG.esc(m.home)}</span>
          <span class="score ${m.status === 'live' ? 's-low' : m.status === 'finished' ? 's-high' : 's-mid'}" style="font-size:1rem;min-width:66px">
            ${m.status === 'live' ? '<i class="bi bi-broadcast"></i> LIVE' : FG.esc(m.score)}
          </span>
          <span class="flex-grow-1 fw-semibold" style="color:var(--fg-text)">${FG.esc(m.away)}</span>
          <span class="small text-dim d-none d-md-block text-end" style="min-width:180px">${FG.esc(m.event)}<br>${FG.esc(m.when)}</span>
        </div>`).join('')
        : '<div class="empty"><i class="bi bi-calendar-x"></i><h3>Nothing scheduled here</h3><p>Check the other tabs — the season calendar runs through December.</p></div>';
      FG.observeReveal(host);
    },

    renderTeams() {
      const host = FG.qs('#teamGrid');
      if (!host) return;
      host.innerHTML = FG_DATA.esports.teams.map(t => `
        <div class="col-6 col-lg-4 col-xl-2">
          <div class="glass p-3 text-center h-100 reveal">
            <div style="width:52px;height:52px;margin:0 auto .6rem;border-radius:14px;display:grid;place-items:center;background:linear-gradient(140deg,var(--fg-violet),var(--fg-cyan));color:#fff;font-family:var(--fg-display);font-weight:700">
              ${FG.esc(t.name.split(' ').map(w => w[0]).join('').slice(0, 2))}
            </div>
            <div class="fw-semibold" style="color:var(--fg-text);font-size:.95rem">${FG.esc(t.name)}</div>
            <div class="small text-dim mb-2">${t.region} · ${t.titles} titles</div>
            <div class="d-flex justify-content-center gap-1">
              ${t.form.split(' ').map(f => `<span class="chip ${f === 'W' ? 'chip-green' : 'chip-red'}" style="padding:.1rem .4rem;font-size:.7rem">${f}</span>`).join('')}
            </div>
          </div>
        </div>`).join('');
      FG.observeReveal(host);
    },

    renderPlayers() {
      const host = FG.qs('#playerTable');
      if (!host) return;
      host.innerHTML = FG_DATA.esports.players
        .sort((a, b) => b.rating - a.rating)
        .map((p, i) => `
        <tr>
          <td data-label="Rank">${i + 1}</td>
          <td data-label="Player">
            <div class="d-flex align-items-center gap-2">
              <img src="${FGAuth.avatarFor(p.handle)}" alt="" class="avatar avatar-sm" loading="lazy">
              <div>
                <div class="fw-semibold">${FG.esc(p.handle)}</div>
                <div class="small text-dim">${FG.esc(p.name)}</div>
              </div>
            </div>
          </td>
          <td data-label="Team">${FG.esc(p.team)}</td>
          <td data-label="Role"><span class="chip chip-violet">${FG.esc(p.role)}</span></td>
          <td data-label="Rating" class="fw-semibold" style="color:var(--fg-cyan)">${p.rating.toFixed(2)}</td>
        </tr>`).join('');
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    Reviews.init();
    Platforms.init();
    Community.init();
    Hardware.init();
    Esports.init();
  });
})();
