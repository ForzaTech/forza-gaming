/* ==========================================================================
   FORZA GAMING — dashboard.js
   Powers dashboard.html (sidebar panel with several views) and
   profile.html. Both require a demo sign-in and read from localStorage.
   ========================================================================== */

(function () {
  'use strict';

  const NOTIFICATIONS = [
    { id: 1, icon: 'bi-controller', tone: 'chip-violet', title: 'Neon Requiem update is live', text: 'The Harbour Ward district and new-game-plus mode are out now.', when: '2 hours ago', unread: true },
    { id: 2, icon: 'bi-star-fill', tone: 'chip-amber', title: 'A game on your list was reviewed', text: 'Crown of Thorne scored 9.3 in our full review.', when: 'Yesterday', unread: true },
    { id: 3, icon: 'bi-chat-dots', tone: 'chip-cyan', title: 'Reply on your community thread', text: 'grimsight replied to “Ashfall Protocol solo extraction tips”.', when: '2 days ago', unread: false },
    { id: 4, icon: 'bi-tag-fill', tone: 'chip-green', title: 'Price drop on a favorite', text: 'Hollow Signal is 35% off across storefronts this week.', when: '4 days ago', unread: false }
  ];

  /* ======================================================================
     DASHBOARD
     ====================================================================== */
  const Dashboard = {
    init() {
      if (!FG.qs('#dashShell')) return;
      if (!FGAuth.requireLogin()) return;

      this.user = FGAuth.current();
      this.paint();
      this.bindNav();
      this.route();
      window.addEventListener('hashchange', () => this.route());

      // Any heart toggled elsewhere in the panel refreshes the lists
      document.addEventListener('fg:favorites-changed', () => {
        this.renderFavorites();
        this.renderOverview();
      });
    },

    paint() {
      const u = this.user;
      const head = FG.qs('#dashUser');
      if (head) {
        head.innerHTML = `
          <img src="${u.avatar}" alt="" class="avatar" loading="lazy">
          <div class="flex-grow-1">
            <div class="fw-semibold" style="color:var(--fg-text)">${FG.esc(u.username)}</div>
            <div class="small text-dim">${u.role === 'admin' ? 'Administrator' : 'Member'} since ${FG.fmtDate(u.joined)}</div>
          </div>`;
      }
      const adminLink = FG.qs('#dashAdminLink');
      if (adminLink) adminLink.hidden = u.role !== 'admin';

      this.renderOverview();
      this.renderFavorites();
      this.renderSavedNews();
      this.renderRecent();
      this.renderNotifications();
      this.fillSettings();
    },

    bindNav() {
      FG.qs('#dashSidebar').addEventListener('click', e => {
        const link = e.target.closest('[data-view]');
        if (!link) return;
        e.preventDefault();
        location.hash = link.dataset.view;
      });

      const settings = FG.qs('#settingsForm');
      if (settings) {
        settings.addEventListener('submit', e => {
          e.preventDefault();
          const username = settings.username.value.trim();
          const email = settings.email.value.trim();
          if (username.length < 3) { FGAuth.setError(settings.username, 'Use at least 3 characters.'); return; }
          FGAuth.setError(settings.username, '');
          if (!FGAuth.validEmail(email)) { FGAuth.setError(settings.email, 'Enter a valid email address.'); return; }
          FGAuth.setError(settings.email, '');
          FGAuth.updateProfile({ username, email });
          this.user = FGAuth.current();
          this.paint();
          FG.toast('Profile updated', 'ok');
        });
      }

      const clearFav = FG.qs('#clearFavorites');
      if (clearFav) {
        clearFav.addEventListener('click', () => {
          if (!FGFav.count()) { FG.toast('Your favorites list is already empty', 'info'); return; }
          FGFav.clear();
          this.renderFavorites();
          this.renderOverview();
          FG.toast('Favorites cleared', 'info');
        });
      }

      const markRead = FG.qs('#markAllRead');
      if (markRead) {
        markRead.addEventListener('click', () => {
          FG.qsa('.notif').forEach(n => n.classList.remove('unread'));
          const badge = FG.qs('#notifBadge');
          if (badge) badge.hidden = true;
          FG.toast('All notifications marked as read', 'ok');
        });
      }
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
      FG.qsa('#dashSidebar [data-view]').forEach(l => l.classList.toggle('active', l.dataset.view === view));
      FG.observeReveal();
      FG.runCounters();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    renderOverview() {
      const host = FG.qs('#overviewStats');
      if (!host) return;
      const favs = FGFav.games();
      const avg = favs.length ? (favs.reduce((s, g) => s + g.rating, 0) / favs.length).toFixed(1) : '0.0';
      const stats = [
        { icon: 'bi-heart-fill', tone: 'ico-red', num: FGFav.count(), label: 'Favorite games' },
        { icon: 'bi-bookmark-fill', tone: 'ico-cyan', num: FGFav.savedNews().length, label: 'Saved articles' },
        { icon: 'bi-clock-history', tone: 'ico-violet', num: FGFav.recentGames().length, label: 'Recently viewed' },
        { icon: 'bi-star-fill', tone: 'ico-green', num: avg, label: 'Avg. score of favorites' }
      ];
      host.innerHTML = stats.map(s => `
        <div class="col-6 col-xl-3">
          <div class="metric">
            <span class="ico ${s.tone}"><i class="bi ${s.icon}"></i></span>
            <div>
              <div class="num" data-count="${s.num}">0</div>
              <div class="label">${s.label}</div>
            </div>
          </div>
        </div>`).join('');

      const activity = FG.qs('#overviewActivity');
      if (activity) {
        const recent = FGFav.recentGames().slice(0, 4);
        activity.innerHTML = recent.length
          ? recent.map(g => `
            <div class="activity">
              <span class="dot"></span>
              <div class="flex-grow-1">
                <p class="a-text">You opened <a href="game-details.html?id=${g.id}">${FG.esc(g.title)}</a></p>
                <span class="a-time">${FG.esc(g.genres.join(' · '))} · scored ${g.rating.toFixed(1)}</span>
              </div>
            </div>`).join('')
          : '<p class="text-dim mb-0">Nothing here yet. Open a game page and it will show up in your history.</p>';
      }

      const picks = FG.qs('#overviewPicks');
      if (picks) {
        const favIds = FGFav.list();
        const suggestions = FG_DATA.games.filter(g => favIds.indexOf(g.id) === -1)
          .sort((a, b) => b.rating - a.rating).slice(0, 3);
        picks.innerHTML = suggestions.map(g => `
          <a class="row-item mb-2 text-decoration-none" href="game-details.html?id=${g.id}">
            <img src="${g.cover}" alt="" width="64" height="44" style="object-fit:cover;border-radius:8px" loading="lazy">
            <span class="flex-grow-1">
              <span class="d-block fw-semibold" style="color:var(--fg-text)">${FG.esc(g.title)}</span>
              <span class="small text-dim">${FG.esc(g.genres.join(' · '))}</span>
            </span>
            <span class="score ${FG.scoreClass(g.rating)}" style="font-size:.9rem;min-width:42px">${g.rating.toFixed(1)}</span>
          </a>`).join('');
      }
    },

    renderFavorites() {
      const host = FG.qs('#favoritesGrid');
      if (!host) return;
      const games = FGFav.games();
      host.innerHTML = games.length
        ? games.map(g => `<div class="col-sm-6 col-xl-4">${FG.gameCard(g)}</div>`).join('')
        : `<div class="col-12"><div class="empty">
             <i class="bi bi-heart"></i>
             <h3>No favorites saved yet</h3>
             <p>Tap the heart on any game card and it will be waiting for you here next time.</p>
             <a class="btn btn-neon" href="games.html">Find something to play</a>
           </div></div>`;
      FG.observeReveal(host);
      FGFav.refreshBadges();
    },

    renderSavedNews() {
      const host = FG.qs('#savedNewsList');
      if (!host) return;
      const items = FGFav.savedNews();
      host.innerHTML = items.length
        ? items.map(n => `
          <a class="row-item mb-2 text-decoration-none" href="news-details.html?id=${n.id}">
            <img src="${n.image}" alt="" width="84" height="58" style="object-fit:cover;border-radius:8px" loading="lazy">
            <span class="flex-grow-1">
              <span class="d-block small text-dim">${FG.esc(n.category)} · ${FG.fmtDate(n.date)}</span>
              <span class="d-block fw-semibold" style="color:var(--fg-text)">${FG.esc(n.title)}</span>
            </span>
            <i class="bi bi-arrow-right-short fs-4 text-dim"></i>
          </a>`).join('')
        : `<div class="empty">
             <i class="bi bi-bookmark"></i>
             <h3>Nothing saved from the newsroom</h3>
             <p>Use “Save for later” on any article and it will land here.</p>
             <a class="btn btn-neon" href="news.html">Open the newsroom</a>
           </div>`;
    },

    renderRecent() {
      const host = FG.qs('#recentList');
      if (!host) return;
      const games = FGFav.recentGames();
      host.innerHTML = games.length
        ? games.map(g => `<div class="col-sm-6 col-xl-4">${FG.gameCard(g)}</div>`).join('')
        : `<div class="col-12"><div class="empty">
             <i class="bi bi-clock-history"></i>
             <h3>Your history is empty</h3>
             <p>Games you open are listed here so you can get back to them quickly.</p>
             <a class="btn btn-neon" href="games.html">Browse the library</a>
           </div></div>`;
      FG.observeReveal(host);
    },

    renderNotifications() {
      const host = FG.qs('#notifList');
      if (!host) return;
      host.innerHTML = NOTIFICATIONS.map(n => `
        <div class="notif ${n.unread ? 'unread' : ''} mb-2">
          <span class="n-ico"><i class="bi ${n.icon}"></i></span>
          <div class="flex-grow-1">
            <div class="fw-semibold" style="color:var(--fg-text)">${FG.esc(n.title)}</div>
            <div class="small text-muted-fg">${FG.esc(n.text)}</div>
            <div class="small text-dim mt-1">${n.when}</div>
          </div>
          ${n.unread ? '<span class="chip chip-red">New</span>' : ''}
        </div>`).join('');

      const badge = FG.qs('#notifBadge');
      const unread = NOTIFICATIONS.filter(n => n.unread).length;
      if (badge) { badge.textContent = unread; badge.hidden = unread === 0; }
    },

    fillSettings() {
      const form = FG.qs('#settingsForm');
      if (!form) return;
      form.username.value = this.user.username;
      form.email.value = this.user.email;
    }
  };

  /* ======================================================================
     PROFILE PAGE
     ====================================================================== */
  const Profile = {
    init() {
      const host = FG.qs('#profileHead');
      if (!host) return;
      if (!FGAuth.requireLogin()) return;

      const u = FGAuth.current();
      const favs = FGFav.games();
      const recent = FGFav.recentGames();
      const hoursPlayed = 120 + favs.length * 37;

      host.innerHTML = `
        <img src="${u.avatar}" alt="" class="avatar avatar-lg">
        <div class="flex-grow-1">
          <h1 class="p-name">${FG.esc(u.username)}</h1>
          <p class="p-mail">${FG.esc(u.email)}</p>
          <div class="d-flex flex-wrap gap-2 mt-2">
            <span class="chip chip-violet"><i class="bi bi-person-badge"></i>${u.role === 'admin' ? 'Administrator' : 'Member'}</span>
            <span class="chip"><i class="bi bi-calendar3"></i>Joined ${FG.fmtDate(u.joined)}</span>
            <span class="chip chip-cyan"><i class="bi bi-heart-fill"></i>${favs.length} favorites</span>
          </div>
        </div>
        <div class="d-flex flex-column gap-2">
          <a class="btn btn-neon" href="dashboard.html">Open dashboard</a>
          <a class="btn btn-ghost" href="dashboard.html#settings">Edit profile</a>
        </div>`;

      const stats = FG.qs('#profileStats');
      if (stats) {
        const items = [
          { num: favs.length, label: 'Games favorited' },
          { num: recent.length, label: 'Games viewed' },
          { num: FGFav.savedNews().length, label: 'Articles saved' },
          { num: hoursPlayed, label: 'Hours logged' }
        ];
        stats.innerHTML = items.map(i => `
          <div class="col-6 col-lg-3">
            <div class="stat reveal">
              <div class="num" data-count="${i.num}">0</div>
              <div class="label">${i.label}</div>
            </div>
          </div>`).join('');
      }

      const genreHost = FG.qs('#profileGenres');
      if (genreHost) {
        const counts = {};
        favs.concat(recent).forEach(g => g.genres.forEach(t => { counts[t] = (counts[t] || 0) + 1; }));
        const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
        const max = entries.length ? entries[0][1] : 1;
        genreHost.innerHTML = entries.length
          ? entries.map(([name, n]) => `
            <div class="progress-row">
              <span class="p-name">${FG.esc(name)}</span>
              <span class="p-track"><span class="p-fill" style="width:${(n / max) * 100}%"></span></span>
              <span class="p-val">${n}</span>
            </div>`).join('')
          : '<p class="text-dim mb-0">Favorite a few games and your genre breakdown will appear here.</p>';
      }

      const favHost = FG.qs('#profileFavorites');
      if (favHost) {
        favHost.innerHTML = favs.length
          ? favs.slice(0, 6).map(g => `<div class="col-6 col-lg-4">${FG.gameCard(g)}</div>`).join('')
          : `<div class="col-12"><div class="empty">
               <i class="bi bi-heart"></i><h3>No favorites yet</h3>
               <p>Everything you favorite across the site collects here.</p>
               <a class="btn btn-neon" href="games.html">Browse games</a></div></div>`;
      }

      const recentHost = FG.qs('#profileRecent');
      if (recentHost) {
        recentHost.innerHTML = recent.length
          ? recent.slice(0, 4).map(g => `
            <a class="row-item mb-2 text-decoration-none" href="game-details.html?id=${g.id}">
              <img src="${g.cover}" alt="" width="64" height="44" style="object-fit:cover;border-radius:8px" loading="lazy">
              <span class="flex-grow-1">
                <span class="d-block fw-semibold" style="color:var(--fg-text)">${FG.esc(g.title)}</span>
                <span class="small text-dim">${FG.fmtDate(g.released)}</span>
              </span>
              <span class="score ${FG.scoreClass(g.rating)}" style="font-size:.9rem;min-width:42px">${g.rating.toFixed(1)}</span>
            </a>`).join('')
          : '<p class="text-dim mb-0">Games you open will be listed here.</p>';
      }

      FG.observeReveal();
      FG.runCounters();
      FGFav.refreshBadges();
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    Dashboard.init();
    Profile.init();
  });
})();
