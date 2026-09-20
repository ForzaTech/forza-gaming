/* ==========================================================================
   FORZA GAMING — news.js
   Powers news.html (category filtering, search, load more) and
   news-details.html (single article driven by ?id=<article-id>).
   ========================================================================== */

(function () {
  'use strict';

  const PAGE_SIZE = 9;

  const NewsList = {
    state: { category: 'all', q: '', sort: 'newest', shown: PAGE_SIZE },

    init() {
      this.grid = FG.qs('#newsGrid');
      if (!this.grid) return;

      this.buildFilters();
      const cat = FG.param('category');
      if (cat) {
        this.state.category = cat;
        FG.qsa('#newsFilters .pill').forEach(b => b.classList.toggle('active', b.dataset.cat === cat));
      }
      this.bind();
      this.renderFeatured();
      this.render();
    },

    buildFilters() {
      const host = FG.qs('#newsFilters');
      if (!host) return;
      const cats = Array.from(new Set(FG_DATA.news.map(n => n.category))).sort();
      host.innerHTML = '<button class="pill active" data-cat="all">All stories</button>' +
        cats.map(c => `<button class="pill" data-cat="${c}">${c}</button>`).join('');
    },

    bind() {
      const host = FG.qs('#newsFilters');
      if (host) {
        host.addEventListener('click', e => {
          const btn = e.target.closest('[data-cat]');
          if (!btn) return;
          FG.qsa('.pill', host).forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.state.category = btn.dataset.cat;
          this.state.shown = PAGE_SIZE;
          this.render();
        });
      }

      const search = FG.qs('#searchNews');
      if (search) {
        let t;
        search.addEventListener('input', e => {
          clearTimeout(t);
          t = setTimeout(() => { this.state.q = e.target.value; this.state.shown = PAGE_SIZE; this.render(); }, 160);
        });
      }

      const sort = FG.qs('#newsSort');
      if (sort) sort.addEventListener('change', e => { this.state.sort = e.target.value; this.render(); });

      const more = FG.qs('#loadMoreNews');
      if (more) more.addEventListener('click', () => { this.state.shown += PAGE_SIZE; this.render(); });

      this.grid.addEventListener('click', e => {
        if (!e.target.closest('[data-clear-news]')) return;
        this.state = { category: 'all', q: '', sort: 'newest', shown: PAGE_SIZE };
        if (search) search.value = '';
        FG.qsa('#newsFilters .pill').forEach(b => b.classList.toggle('active', b.dataset.cat === 'all'));
        this.render();
      });
    },

    renderFeatured() {
      const host = FG.qs('#newsFeatured');
      if (!host) return;
      const items = FG_DATA.news.filter(n => n.featured).slice(0, 3);
      host.innerHTML = items.map((n, i) => `
        <div class="${i === 0 ? 'col-lg-6' : 'col-lg-3 col-md-6'}">
          <a class="card-fg reveal h-100 text-decoration-none" href="news-details.html?id=${n.id}">
            <div class="thumb" style="aspect-ratio:${i === 0 ? '16/9' : '4/3'}">
              <img src="${n.image}" alt="" loading="lazy">
              <div class="thumb-top"><span class="chip chip-cyan">${FG.esc(n.category)}</span></div>
              <div class="thumb-bottom">
                <span class="fw-semibold" style="color:#fff;font-family:var(--fg-display);font-size:${i === 0 ? '1.25rem' : '1rem'};text-shadow:0 2px 12px #000">${FG.esc(n.title)}</span>
              </div>
            </div>
          </a>
        </div>`).join('');
    },

    filtered() {
      const s = this.state;
      const q = s.q.trim().toLowerCase();
      let list = FG_DATA.news.filter(n => {
        if (s.category !== 'all' && n.category !== s.category) return false;
        if (q && (n.title + ' ' + n.excerpt + ' ' + n.author + ' ' + n.category).toLowerCase().indexOf(q) === -1) return false;
        return true;
      });
      list.sort((a, b) => s.sort === 'oldest' ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date));
      return list;
    },

    render() {
      const all = this.filtered();
      const visible = all.slice(0, this.state.shown);

      const count = FG.qs('#newsCount');
      if (count) count.textContent = all.length ? 'Showing ' + visible.length + ' of ' + all.length + ' articles' : 'No articles found';

      this.grid.innerHTML = all.length
        ? visible.map(n => `<div class="col-md-6 col-xl-4">${FG.newsCard(n)}</div>`).join('')
        : `<div class="col-12"><div class="empty">
             <i class="bi bi-newspaper"></i>
             <h3>No stories in that combination</h3>
             <p>Try another category, or clear the search to see everything we have published.</p>
             <button class="btn btn-neon" data-clear-news>Show all news</button>
           </div></div>`;

      const more = FG.qs('#loadMoreNews');
      if (more) more.hidden = visible.length >= all.length;

      FG.observeReveal(this.grid);
    }
  };

  /* ======================================================================
     ARTICLE PAGE
     ====================================================================== */
  const Article = {
    init() {
      const host = FG.qs('#articleBody');
      if (!host) return;

      const id = FG.param('id') || FG_DATA.news[0].id;
      const n = FG.newsById(id);

      if (!n) {
        host.innerHTML = `<div class="container py-5"><div class="empty">
          <i class="bi bi-newspaper"></i><h3>That article is no longer available</h3>
          <p>It may have been moved. The newsroom archive is a good place to start again.</p>
          <a class="btn btn-neon" href="news.html">Open the newsroom</a></div></div>`;
        return;
      }

      document.title = n.title + ' — Forza Gaming';
      const desc = document.querySelector('meta[name="description"]');
      if (desc) desc.setAttribute('content', n.excerpt);

      const related = FG_DATA.news.filter(x => x.id !== n.id && x.category === n.category).slice(0, 3);
      const fallbackRelated = FG_DATA.news.filter(x => x.id !== n.id).slice(0, 3);
      const saved = FGFav.hasNews(n.id);

      host.innerHTML = `
      <header class="page-banner" style="background:linear-gradient(to bottom, rgba(7,7,12,.5), var(--fg-bg)), url('${n.image}') center/cover no-repeat">
        <div class="container">
          <nav class="crumbs mb-3" aria-label="Breadcrumb">
            <a href="index.html">Home</a> / <a href="news.html">News</a> / <span>${FG.esc(n.category)}</span>
          </nav>
          <span class="chip chip-cyan mb-3 d-inline-flex">${FG.esc(n.category)}</span>
          <h1 class="mb-3" style="max-width:20ch">${FG.esc(n.title)}</h1>
          <div class="d-flex flex-wrap align-items-center gap-3 text-dim small">
            <span class="d-flex align-items-center gap-2">
              <img src="https://picsum.photos/seed/forza-author-${encodeURIComponent(n.author)}/80/80" alt="" class="avatar avatar-sm">
              ${FG.esc(n.author)}
            </span>
            <span><i class="bi bi-calendar3 me-1"></i>${FG.fmtDate(n.date)}</span>
            <span><i class="bi bi-clock me-1"></i>3 min read</span>
          </div>
        </div>
      </header>

      <div class="container section">
        <div class="row g-5">
          <div class="col-lg-8">
            <article class="reveal">
              <p class="fs-5" style="color:var(--fg-text)">${FG.esc(n.excerpt)}</p>
              <p>${FG.esc(n.body)}</p>
              <p>Forza Gaming will keep this page updated as more detail is confirmed. If you spot something we have missed, the ${'<a href="community.html">community boards</a>'} are the fastest way to reach the newsroom.</p>
              <div class="glass p-3 my-4 d-flex flex-wrap gap-2 align-items-center">
                <span class="me-auto small text-dim">Share this story</span>
                <button class="btn btn-ghost btn-sm" data-share><i class="bi bi-link-45deg me-1"></i>Copy link</button>
                <button class="btn ${saved ? 'btn-danger-soft' : 'btn-ghost'} btn-sm" id="saveArticle" data-id="${n.id}">
                  <i class="bi ${saved ? 'bi-bookmark-fill' : 'bi-bookmark'} me-1"></i><span>${saved ? 'Saved' : 'Save for later'}</span>
                </button>
              </div>
            </article>
          </div>
          <aside class="col-lg-4">
            <div class="glass p-4 reveal" style="position:sticky;top:6rem">
              <h2 class="h6 mb-3">More in ${FG.esc(n.category)}</h2>
              ${(related.length ? related : fallbackRelated).map(r => `
                <a class="d-flex gap-3 py-2 text-decoration-none" href="news-details.html?id=${r.id}">
                  <img src="${r.image}" alt="" width="72" height="50" style="object-fit:cover;border-radius:8px" loading="lazy">
                  <span>
                    <span class="d-block small text-dim">${FG.timeAgo(r.date)}</span>
                    <span class="d-block line-clamp-2" style="color:var(--fg-text);font-size:.92rem">${FG.esc(r.title)}</span>
                  </span>
                </a>`).join('')}
              <a class="btn btn-ghost btn-sm w-100 mt-3" href="news.html?category=${encodeURIComponent(n.category)}">All ${FG.esc(n.category)} stories</a>
            </div>
          </aside>
        </div>

        <section class="mt-5">
          <div class="section-head">
            <div><div class="rule"></div><h2>Latest from the newsroom</h2></div>
            <a class="btn btn-ghost btn-sm" href="news.html">See everything</a>
          </div>
          <div class="row g-4">
            ${FG_DATA.news.filter(x => x.id !== n.id).slice(0, 3).map(x => `<div class="col-md-6 col-xl-4">${FG.newsCard(x)}</div>`).join('')}
          </div>
        </section>
      </div>`;

      FG.observeReveal(host);
      this.bind(n);
    },

    bind(n) {
      const save = FG.qs('#saveArticle');
      if (save) {
        save.addEventListener('click', () => {
          const nowSaved = FGFav.toggleNews(n.id);
          save.classList.toggle('btn-danger-soft', nowSaved);
          save.classList.toggle('btn-ghost', !nowSaved);
          save.querySelector('i').className = 'bi ' + (nowSaved ? 'bi-bookmark-fill' : 'bi-bookmark') + ' me-1';
          save.querySelector('span').textContent = nowSaved ? 'Saved' : 'Save for later';
          FG.toast(nowSaved ? 'Article saved to your dashboard' : 'Article removed from saved', nowSaved ? 'ok' : 'info');
        });
      }

      const share = FG.qs('[data-share]');
      if (share) {
        share.addEventListener('click', () => {
          const url = location.href;
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(url).then(
              () => FG.toast('Link copied to your clipboard', 'ok'),
              () => FG.toast('Copy the link from the address bar', 'warn')
            );
          } else {
            FG.toast('Copy the link from the address bar', 'info');
          }
        });
      }
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    NewsList.init();
    Article.init();
  });
})();
