/* ==========================================================================
   FORZA GAMING — admin.js
   DEMO ADMIN PANEL. Every "record" lives in localStorage and is seeded from
   js/data.js the first time the panel is opened. Nothing is sent anywhere;
   "Reset demo data" puts everything back to the seeded state.
   ========================================================================== */

(function () {
  'use strict';

  const KEYS = { games: 'fg-admin-games', news: 'fg-admin-news', users: 'fg-admin-users' };

  const Store = {
    read(kind) {
      try {
        const raw = localStorage.getItem(KEYS[kind]);
        if (raw) return JSON.parse(raw);
      } catch (e) { /* fall through to seed */ }
      const seed = this.seed(kind);
      this.write(kind, seed);
      return seed;
    },
    write(kind, rows) {
      try { localStorage.setItem(KEYS[kind], JSON.stringify(rows)); } catch (e) {}
    },
    seed(kind) {
      if (kind === 'games') {
        return FG_DATA.games.map(g => ({
          id: g.id, title: g.title, genre: FG.categoryName(g.genre), rating: g.rating,
          released: g.released, platforms: g.platforms.map(p => FG.platformShort(p)).join(', '),
          status: 'Published', image: g.cover
        }));
      }
      if (kind === 'news') {
        return FG_DATA.news.map(n => ({
          id: n.id, title: n.title, category: n.category, author: n.author,
          date: n.date, status: n.featured ? 'Featured' : 'Published', image: n.image
        }));
      }
      return FG_DATA.users.map(u => Object.assign({}, u));
    },
    resetAll() {
      Object.keys(KEYS).forEach(k => { try { localStorage.removeItem(KEYS[k]); } catch (e) {} });
    }
  };

  const Admin = {
    state: { games: { q: '', sort: 'title' }, news: { q: '', category: 'all' }, users: { q: '', role: 'all' } },

    init() {
      if (!FG.qs('#adminShell')) return;
      if (!FGAuth.requireLogin()) return;

      const user = FGAuth.current();
      if (user.role !== 'admin') {
        FG.qs('#adminShell').innerHTML = `
          <div class="container"><div class="empty" style="margin-top:2rem">
            <i class="bi bi-shield-lock"></i>
            <h3>This panel is limited to the demo administrator</h3>
            <p>Sign in with <strong>admin@forza.demo</strong> and password <strong>admin123</strong> to look around, or head back to your own dashboard.</p>
            <div class="d-flex gap-2 justify-content-center flex-wrap">
              <a class="btn btn-neon" href="login.html?next=admin.html">Sign in as admin</a>
              <a class="btn btn-ghost" href="dashboard.html">My dashboard</a>
            </div>
          </div></div>`;
        return;
      }

      this.paintUser(user);
      this.bindNav();
      this.renderOverview();
      this.renderGames();
      this.renderNews();
      this.renderUsers();
      this.renderCategories();
      this.renderReviews();
      this.renderReports();
      this.bindForms();
      this.route();
      window.addEventListener('hashchange', () => this.route());
    },

    paintUser(u) {
      const host = FG.qs('#adminUser');
      if (!host) return;
      host.innerHTML = `
        <img src="${u.avatar}" alt="" class="avatar" loading="lazy">
        <div class="flex-grow-1">
          <div class="fw-semibold" style="color:var(--fg-text)">${FG.esc(u.username)}</div>
          <div class="small text-dim">Administrator</div>
        </div>`;
    },

    route() {
      const view = (location.hash || '#overview').slice(1);
      let matched = false;
      FG.qsa('.dash-view').forEach(v => {
        const on = v.id === 'view-' + view;
        v.hidden = !on;
        if (on) matched = true;
      });
      if (!matched) { location.hash = 'overview'; return; }
      FG.qsa('#adminSidebar [data-view]').forEach(l => l.classList.toggle('active', l.dataset.view === view));
      FG.runCounters();
      this.animateCharts();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    bindNav() {
      FG.qs('#adminSidebar').addEventListener('click', e => {
        const link = e.target.closest('[data-view]');
        if (!link) return;
        e.preventDefault();
        location.hash = link.dataset.view;
      });

      const reset = FG.qs('#resetDemo');
      if (reset) {
        reset.addEventListener('click', () => {
          Store.resetAll();
          this.renderGames(); this.renderNews(); this.renderUsers(); this.renderOverview();
          FG.toast('Demo data restored to its original state', 'ok');
        });
      }
    },

    /* --- Overview ---------------------------------------------------------- */
    renderOverview() {
      const games = Store.read('games'), news = Store.read('news'), users = Store.read('users');

      const metrics = FG.qs('#adminMetrics');
      if (metrics) {
        const tiles = [
          { icon: 'bi-controller', tone: 'ico-violet', num: games.length, label: 'Games in catalogue', trend: '+3 this month', up: true },
          { icon: 'bi-newspaper', tone: 'ico-cyan', num: news.length, label: 'Published articles', trend: '+12 this month', up: true },
          { icon: 'bi-people-fill', tone: 'ico-green', num: users.length * 1284, label: 'Registered members', trend: '+8.4% vs last month', up: true },
          { icon: 'bi-star-fill', tone: 'ico-red', num: FG_DATA.reviews.length, label: 'Reviews published', trend: '-1 vs last month', up: false }
        ];
        metrics.innerHTML = tiles.map(t => `
          <div class="col-6 col-xl-3">
            <div class="metric">
              <span class="ico ${t.tone}"><i class="bi ${t.icon}"></i></span>
              <div>
                <div class="num" data-count="${t.num}">0</div>
                <div class="label">${t.label}</div>
                <div class="trend ${t.up ? 'trend-up' : 'trend-down'}"><i class="bi bi-arrow-${t.up ? 'up' : 'down'}-short"></i>${t.trend}</div>
              </div>
            </div>
          </div>`).join('');
      }

      // Traffic bar chart — plain divs, no chart library needed
      const chart = FG.qs('#trafficChart');
      if (chart) {
        const months = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
        const values = [412, 388, 466, 502, 478, 561, 604];
        const max = Math.max.apply(null, values);
        chart.innerHTML = months.map((m, i) => `
          <div class="bar-col">
            <div class="bar" data-height="${(values[i] / max) * 100}">
              <span class="bar-value">${values[i]}k</span>
            </div>
            <span class="bar-label">${m}</span>
          </div>`).join('');
      }

      // Platform split donut, drawn with a conic gradient
      const donut = FG.qs('#platformDonut');
      if (donut) {
        const split = [
          { label: 'PC', value: 42, color: '#22d3ee' },
          { label: 'PlayStation', value: 26, color: '#3b82f6' },
          { label: 'Xbox', value: 19, color: '#34d399' },
          { label: 'Switch & mobile', value: 13, color: '#8b5cf6' }
        ];
        let acc = 0;
        const stops = split.map(s => {
          const from = acc; acc += s.value;
          return `${s.color} ${from}% ${acc}%`;
        }).join(', ');
        donut.innerHTML = `
          <div class="donut-ring" style="background:conic-gradient(${stops})">
            <div class="donut-center"><div class="num">42%</div><div class="label">PC share</div></div>
          </div>
          <div class="legend">
            ${split.map(s => `<div><span class="dot" style="background:${s.color}"></span>${s.label} · ${s.value}%</div>`).join('')}
          </div>`;
      }

      const feed = FG.qs('#adminActivity');
      if (feed) {
        const events = [
          ['emberkit published “Crown of Thorne patch reworks its most criticised boss”', '18 minutes ago'],
          ['clockout updated the Esports landing page', '1 hour ago'],
          ['runeleaf moderated 4 community reports', '3 hours ago'],
          ['System: nightly search index rebuilt successfully', '6 hours ago'],
          ['New member registration spike detected (+312)', 'Yesterday']
        ];
        feed.innerHTML = events.map(([text, when]) => `
          <div class="activity">
            <span class="dot"></span>
            <div><p class="a-text">${FG.esc(text)}</p><span class="a-time">${when}</span></div>
          </div>`).join('');
      }
    },

    animateCharts() {
      setTimeout(() => {
        FG.qsa('.bar[data-height]').forEach(b => { b.style.height = b.dataset.height + '%'; });
        FG.qsa('.p-fill[data-width]').forEach(p => { p.style.width = p.dataset.width + '%'; });
      }, 120);
    },

    /* --- Games CRUD --------------------------------------------------------- */
    renderGames() {
      const body = FG.qs('#gamesTableBody');
      if (!body) return;
      const s = this.state.games;
      let rows = Store.read('games');
      if (s.q) {
        const q = s.q.toLowerCase();
        rows = rows.filter(r => (r.title + ' ' + r.genre + ' ' + r.platforms).toLowerCase().indexOf(q) > -1);
      }
      const sorters = {
        title: (a, b) => a.title.localeCompare(b.title),
        rating: (a, b) => b.rating - a.rating,
        newest: (a, b) => b.released.localeCompare(a.released)
      };
      rows.sort(sorters[s.sort] || sorters.title);

      body.innerHTML = rows.length ? rows.map(r => `
        <tr>
          <td data-label="Game">
            <div class="cell-title"><img src="${r.image}" alt="" loading="lazy">${FG.esc(r.title)}</div>
          </td>
          <td data-label="Genre"><span class="chip chip-violet">${FG.esc(r.genre)}</span></td>
          <td data-label="Platforms" class="text-dim">${FG.esc(r.platforms)}</td>
          <td data-label="Score"><span class="score ${FG.scoreClass(r.rating)}" style="font-size:.85rem;min-width:40px">${Number(r.rating).toFixed(1)}</span></td>
          <td data-label="Released" class="text-dim">${FG.fmtDate(r.released)}</td>
          <td data-label="Status"><span class="chip ${r.status === 'Published' ? 'chip-green' : 'chip-amber'}">${FG.esc(r.status)}</span></td>
          <td data-label="Actions">
            <div class="table-actions">
              <button class="btn-icon" data-edit-game="${r.id}" aria-label="Edit ${FG.esc(r.title)}"><i class="bi bi-pencil"></i></button>
              <button class="btn-icon danger" data-del="games" data-id="${r.id}" data-name="${FG.esc(r.title)}" aria-label="Delete ${FG.esc(r.title)}"><i class="bi bi-trash3"></i></button>
            </div>
          </td>
        </tr>`).join('')
        : '<tr><td colspan="7" class="text-center text-dim py-4">No games match that search.</td></tr>';

      const count = FG.qs('#gamesCount');
      if (count) count.textContent = rows.length + ' record' + (rows.length === 1 ? '' : 's');
    },

    renderNews() {
      const body = FG.qs('#newsTableBody');
      if (!body) return;
      const s = this.state.news;
      let rows = Store.read('news');
      if (s.category !== 'all') rows = rows.filter(r => r.category === s.category);
      if (s.q) {
        const q = s.q.toLowerCase();
        rows = rows.filter(r => (r.title + ' ' + r.author + ' ' + r.category).toLowerCase().indexOf(q) > -1);
      }
      rows.sort((a, b) => b.date.localeCompare(a.date));

      body.innerHTML = rows.length ? rows.map(r => `
        <tr>
          <td data-label="Headline"><div class="cell-title"><img src="${r.image}" alt="" loading="lazy">${FG.esc(r.title)}</div></td>
          <td data-label="Category"><span class="chip chip-cyan">${FG.esc(r.category)}</span></td>
          <td data-label="Author" class="text-dim">${FG.esc(r.author)}</td>
          <td data-label="Date" class="text-dim">${FG.fmtDate(r.date)}</td>
          <td data-label="Status"><span class="chip ${r.status === 'Featured' ? 'chip-amber' : 'chip-green'}">${FG.esc(r.status)}</span></td>
          <td data-label="Actions">
            <div class="table-actions">
              <button class="btn-icon" data-edit-news="${r.id}" aria-label="Edit article"><i class="bi bi-pencil"></i></button>
              <button class="btn-icon danger" data-del="news" data-id="${r.id}" data-name="${FG.esc(r.title)}" aria-label="Delete article"><i class="bi bi-trash3"></i></button>
            </div>
          </td>
        </tr>`).join('')
        : '<tr><td colspan="6" class="text-center text-dim py-4">No articles match those filters.</td></tr>';

      const sel = FG.qs('#adminNewsCategory');
      if (sel && !sel.dataset.filled) {
        const cats = Array.from(new Set(Store.seed('news').map(n => n.category))).sort();
        sel.innerHTML = '<option value="all">All categories</option>' + cats.map(c => `<option value="${c}">${c}</option>`).join('');
        sel.dataset.filled = '1';
      }
    },

    renderUsers() {
      const body = FG.qs('#usersTableBody');
      if (!body) return;
      const s = this.state.users;
      let rows = Store.read('users');
      if (s.role !== 'all') rows = rows.filter(r => r.role === s.role);
      if (s.q) {
        const q = s.q.toLowerCase();
        rows = rows.filter(r => (r.username + ' ' + r.email + ' ' + r.role).toLowerCase().indexOf(q) > -1);
      }

      const statusChip = { Active: 'chip-green', Suspended: 'chip-red', Pending: 'chip-amber' };
      body.innerHTML = rows.length ? rows.map(r => `
        <tr>
          <td data-label="Member">
            <div class="cell-title">
              <img src="${FGAuth.avatarFor(r.username)}" alt="" style="width:34px;height:34px;border-radius:50%" loading="lazy">
              ${FG.esc(r.username)}
            </div>
          </td>
          <td data-label="Email" class="text-dim">${FG.esc(r.email)}</td>
          <td data-label="Role"><span class="chip chip-violet">${FG.esc(r.role)}</span></td>
          <td data-label="Joined" class="text-dim">${FG.fmtDate(r.joined)}</td>
          <td data-label="Status"><span class="chip ${statusChip[r.status] || 'chip'}">${FG.esc(r.status)}</span></td>
          <td data-label="Actions">
            <div class="table-actions">
              <button class="btn-icon" data-edit-user="${r.id}" aria-label="Edit member"><i class="bi bi-pencil"></i></button>
              <button class="btn-icon danger" data-del="users" data-id="${r.id}" data-name="${FG.esc(r.username)}" aria-label="Remove member"><i class="bi bi-trash3"></i></button>
            </div>
          </td>
        </tr>`).join('')
        : '<tr><td colspan="6" class="text-center text-dim py-4">No members match those filters.</td></tr>';
    },

    renderCategories() {
      const host = FG.qs('#categoryTable');
      if (!host) return;
      const games = Store.read('games');
      host.innerHTML = FG_DATA.categories.map(c => {
        const n = games.filter(g => g.genre === c.name).length;
        return `
        <tr>
          <td data-label="Category"><div class="cell-title"><i class="bi ${c.icon} fs-5" style="color:var(--fg-cyan)"></i>${c.name}</div></td>
          <td data-label="Slug" class="text-dim">${c.id}</td>
          <td data-label="Description" class="text-dim">${FG.esc(c.blurb)}</td>
          <td data-label="Games">${n}</td>
          <td data-label="Actions">
            <div class="table-actions">
              <button class="btn-icon" data-noop aria-label="Edit category"><i class="bi bi-pencil"></i></button>
              <button class="btn-icon danger" data-noop aria-label="Delete category"><i class="bi bi-trash3"></i></button>
            </div>
          </td>
        </tr>`;
      }).join('');
    },

    renderReviews() {
      const host = FG.qs('#reviewTable');
      if (!host) return;
      host.innerHTML = FG_DATA.reviews.map(r => `
        <tr>
          <td data-label="Game"><div class="cell-title"><img src="${r.image}" alt="" loading="lazy">${FG.esc(r.title)}</div></td>
          <td data-label="Score"><span class="score ${FG.scoreClass(r.score)}" style="font-size:.85rem;min-width:40px">${r.score.toFixed(1)}</span></td>
          <td data-label="Reviewer" class="text-dim">${FG.esc(r.reviewer)}</td>
          <td data-label="Platform" class="text-dim">${FG.esc(r.platform)}</td>
          <td data-label="Published" class="text-dim">${FG.fmtDate(r.date)}</td>
          <td data-label="Actions"><div class="table-actions"><button class="btn-icon" data-noop aria-label="Edit review"><i class="bi bi-pencil"></i></button></div></td>
        </tr>`).join('');
    },

    renderReports() {
      const host = FG.qs('#reportBars');
      if (!host) return;
      const top = Store.read('games').slice().sort((a, b) => b.rating - a.rating).slice(0, 6);
      const max = top.length ? top[0].rating : 10;
      host.innerHTML = top.map(g => `
        <div class="progress-row">
          <span class="p-name">${FG.esc(g.title)}</span>
          <span class="p-track"><span class="p-fill" data-width="${(g.rating / max) * 100}"></span></span>
          <span class="p-val">${Number(g.rating).toFixed(1)}</span>
        </div>`).join('');

      const summary = FG.qs('#reportSummary');
      if (summary) {
        const rows = [
          ['Page views (30 days)', '604,218', '+7.7%', true],
          ['New registrations', '3,482', '+8.4%', true],
          ['Community posts', '11,905', '+2.1%', true],
          ['Average session', '4m 12s', '-0.4%', false],
          ['Newsletter opens', '38.6%', '+1.9%', true]
        ];
        summary.innerHTML = rows.map(([label, value, delta, up]) => `
          <tr>
            <td data-label="Metric">${label}</td>
            <td data-label="Value" class="fw-semibold">${value}</td>
            <td data-label="Change"><span class="${up ? 'trend-up' : 'trend-down'}"><i class="bi bi-arrow-${up ? 'up' : 'down'}-short"></i>${delta}</span></td>
          </tr>`).join('');
      }
    },

    /* --- Forms, modals, delete ---------------------------------------------- */
    bindForms() {
      const self = this;

      // Search + filter controls
      const on = (sel, evt, fn) => { const el = FG.qs(sel); if (el) el.addEventListener(evt, fn); };
      on('#adminGameSearch', 'input', e => { self.state.games.q = e.target.value; self.renderGames(); });
      on('#adminGameSort', 'change', e => { self.state.games.sort = e.target.value; self.renderGames(); });
      on('#adminNewsSearch', 'input', e => { self.state.news.q = e.target.value; self.renderNews(); });
      on('#adminNewsCategory', 'change', e => { self.state.news.category = e.target.value; self.renderNews(); });
      on('#adminUserSearch', 'input', e => { self.state.users.q = e.target.value; self.renderUsers(); });
      on('#adminUserRole', 'change', e => { self.state.users.role = e.target.value; self.renderUsers(); });

      // Open the game editor (add or edit)
      document.addEventListener('click', e => {
        const addBtn = e.target.closest('#addGameBtn');
        const editBtn = e.target.closest('[data-edit-game]');
        if (!addBtn && !editBtn) return;

        const form = FG.qs('#gameForm');
        const rows = Store.read('games');
        const row = editBtn ? rows.find(r => r.id === editBtn.dataset.editGame) : null;
        FG.qs('#gameModalTitle').textContent = row ? 'Edit game' : 'Add a game';
        form.recordId.value = row ? row.id : '';
        form.title.value = row ? row.title : '';
        form.genre.value = row ? row.genre : 'Action';
        form.rating.value = row ? row.rating : 8;
        form.released.value = row ? row.released : new Date().toISOString().slice(0, 10);
        form.platforms.value = row ? row.platforms : 'PC, PS5, XSX';
        form.status.value = row ? row.status : 'Published';
        bootstrap.Modal.getOrCreateInstance(FG.qs('#gameModal')).show();
      });

      const gameForm = FG.qs('#gameForm');
      if (gameForm) {
        gameForm.addEventListener('submit', e => {
          e.preventDefault();
          if (gameForm.title.value.trim().length < 2) { FGAuth.setError(gameForm.title, 'Enter a title.'); return; }
          FGAuth.setError(gameForm.title, '');
          const rows = Store.read('games');
          const id = gameForm.recordId.value;
          const record = {
            title: gameForm.title.value.trim(),
            genre: gameForm.genre.value,
            rating: parseFloat(gameForm.rating.value) || 0,
            released: gameForm.released.value,
            platforms: gameForm.platforms.value.trim(),
            status: gameForm.status.value
          };
          if (id) {
            Object.assign(rows.find(r => r.id === id), record);
            FG.toast('Game updated', 'ok');
          } else {
            record.id = 'g' + Date.now();
            record.image = 'https://picsum.photos/seed/forza-' + record.id + '/800/500';
            rows.unshift(record);
            FG.toast('Game added to the catalogue', 'ok');
          }
          Store.write('games', rows);
          self.renderGames();
          self.renderOverview();
          self.renderReports();
          bootstrap.Modal.getInstance(FG.qs('#gameModal')).hide();
        });
      }

      // News editor
      document.addEventListener('click', e => {
        const addBtn = e.target.closest('#addNewsBtn');
        const editBtn = e.target.closest('[data-edit-news]');
        if (!addBtn && !editBtn) return;

        const form = FG.qs('#newsForm');
        const rows = Store.read('news');
        const row = editBtn ? rows.find(r => r.id === editBtn.dataset.editNews) : null;
        FG.qs('#newsModalTitle').textContent = row ? 'Edit article' : 'Add an article';
        form.recordId.value = row ? row.id : '';
        form.title.value = row ? row.title : '';
        form.category.value = row ? row.category : 'PC';
        form.author.value = row ? row.author : FGAuth.current().username;
        form.date.value = row ? row.date : new Date().toISOString().slice(0, 10);
        form.status.value = row ? row.status : 'Published';
        bootstrap.Modal.getOrCreateInstance(FG.qs('#newsModal')).show();
      });

      const newsForm = FG.qs('#newsForm');
      if (newsForm) {
        newsForm.addEventListener('submit', e => {
          e.preventDefault();
          if (newsForm.title.value.trim().length < 6) { FGAuth.setError(newsForm.title, 'Headlines need at least 6 characters.'); return; }
          FGAuth.setError(newsForm.title, '');
          const rows = Store.read('news');
          const id = newsForm.recordId.value;
          const record = {
            title: newsForm.title.value.trim(),
            category: newsForm.category.value,
            author: newsForm.author.value.trim(),
            date: newsForm.date.value,
            status: newsForm.status.value
          };
          if (id) {
            Object.assign(rows.find(r => r.id === id), record);
            FG.toast('Article updated', 'ok');
          } else {
            record.id = 'n' + Date.now();
            record.image = 'https://picsum.photos/seed/forza-' + record.id + '/800/500';
            rows.unshift(record);
            FG.toast('Article published', 'ok');
          }
          Store.write('news', rows);
          self.renderNews();
          self.renderOverview();
          bootstrap.Modal.getInstance(FG.qs('#newsModal')).hide();
        });
      }

      // User editor
      document.addEventListener('click', e => {
        const addBtn = e.target.closest('#addUserBtn');
        const editBtn = e.target.closest('[data-edit-user]');
        if (!addBtn && !editBtn) return;

        const form = FG.qs('#userForm');
        const rows = Store.read('users');
        const row = editBtn ? rows.find(r => r.id === editBtn.dataset.editUser) : null;
        FG.qs('#userModalTitle').textContent = row ? 'Edit member' : 'Add a member';
        form.recordId.value = row ? row.id : '';
        form.username.value = row ? row.username : '';
        form.email.value = row ? row.email : '';
        form.role.value = row ? row.role : 'Member';
        form.status.value = row ? row.status : 'Active';
        bootstrap.Modal.getOrCreateInstance(FG.qs('#userModal')).show();
      });

      const userForm = FG.qs('#userForm');
      if (userForm) {
        userForm.addEventListener('submit', e => {
          e.preventDefault();
          if (userForm.username.value.trim().length < 3) { FGAuth.setError(userForm.username, 'Usernames need 3 characters or more.'); return; }
          FGAuth.setError(userForm.username, '');
          if (!FGAuth.validEmail(userForm.email.value)) { FGAuth.setError(userForm.email, 'Enter a valid email address.'); return; }
          FGAuth.setError(userForm.email, '');

          const rows = Store.read('users');
          const id = userForm.recordId.value;
          const record = {
            username: userForm.username.value.trim(),
            email: userForm.email.value.trim(),
            role: userForm.role.value,
            status: userForm.status.value
          };
          if (id) {
            Object.assign(rows.find(r => r.id === id), record);
            FG.toast('Member updated', 'ok');
          } else {
            record.id = 'u' + Date.now();
            record.joined = new Date().toISOString().slice(0, 10);
            rows.unshift(record);
            FG.toast('Member added', 'ok');
          }
          Store.write('users', rows);
          self.renderUsers();
          self.renderOverview();
          bootstrap.Modal.getInstance(FG.qs('#userModal')).hide();
        });
      }

      // Delete, with a confirmation step
      let pending = null;
      document.addEventListener('click', e => {
        const btn = e.target.closest('[data-del]');
        if (btn) {
          pending = { kind: btn.dataset.del, id: btn.dataset.id };
          FG.qs('#deleteTarget').textContent = btn.dataset.name;
          bootstrap.Modal.getOrCreateInstance(FG.qs('#deleteModal')).show();
          return;
        }
        if (e.target.closest('[data-noop]')) {
          FG.toast('This record type is read-only in the demo', 'info');
        }
      });

      const confirmBtn = FG.qs('#confirmDelete');
      if (confirmBtn) {
        confirmBtn.addEventListener('click', () => {
          if (!pending) return;
          const rows = Store.read(pending.kind).filter(r => r.id !== pending.id);
          Store.write(pending.kind, rows);
          if (pending.kind === 'games') { self.renderGames(); self.renderReports(); }
          if (pending.kind === 'news') self.renderNews();
          if (pending.kind === 'users') self.renderUsers();
          self.renderOverview();
          bootstrap.Modal.getInstance(FG.qs('#deleteModal')).hide();
          FG.toast('Record deleted from the demo data', 'ok');
          pending = null;
        });
      }

      // Settings form
      const settings = FG.qs('#adminSettingsForm');
      if (settings) {
        settings.addEventListener('submit', e => {
          e.preventDefault();
          FG.toast('Settings saved to this browser', 'ok');
        });
      }
    }
  };

  document.addEventListener('DOMContentLoaded', () => Admin.init());
})();
