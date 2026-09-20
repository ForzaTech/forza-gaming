/* ==========================================================================
   FORZA GAMING — favorites.js
   localStorage-backed lists: favorite games, saved news, recently viewed.
   No server, no account sync — everything lives in this browser only.
   ========================================================================== */

const FGFav = (function () {
  'use strict';

  const KEY_FAV = 'fg-favorites';
  const KEY_NEWS = 'fg-saved-news';
  const KEY_RECENT = 'fg-recent-games';
  const RECENT_LIMIT = 8;

  /* Reading and writing are wrapped because private browsing modes can
     throw on localStorage access. The site still works, it just forgets. */
  function read(key) {
    try { return JSON.parse(localStorage.getItem(key)) || []; }
    catch (e) { return []; }
  }

  function write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch (e) { /* storage unavailable — ignore */ }
  }

  /* --- Favorite games ----------------------------------------------------- */
  function list() { return read(KEY_FAV); }
  function has(id) { return list().indexOf(id) > -1; }
  function count() { return list().length; }

  function add(id) {
    const items = list();
    if (items.indexOf(id) === -1) { items.push(id); write(KEY_FAV, items); }
    refreshBadges();
  }

  function remove(id) {
    write(KEY_FAV, list().filter(x => x !== id));
    refreshBadges();
  }

  function toggle(id) {
    const nowFav = !has(id);
    nowFav ? add(id) : remove(id);
    return nowFav;
  }

  function clear() { write(KEY_FAV, []); refreshBadges(); }

  /** Full game records for everything the user has favorited. */
  function games() {
    return list().map(id => FG_DATA.games.find(g => g.id === id)).filter(Boolean);
  }

  /* --- Saved news --------------------------------------------------------- */
  function newsList() { return read(KEY_NEWS); }
  function hasNews(id) { return newsList().indexOf(id) > -1; }

  function toggleNews(id) {
    const items = newsList();
    const i = items.indexOf(id);
    if (i > -1) { items.splice(i, 1); write(KEY_NEWS, items); return false; }
    items.push(id);
    write(KEY_NEWS, items);
    return true;
  }

  function savedNews() {
    return newsList().map(id => FG_DATA.news.find(n => n.id === id)).filter(Boolean);
  }

  /* --- Recently viewed ---------------------------------------------------- */
  function pushRecent(id) {
    const items = read(KEY_RECENT).filter(x => x !== id);
    items.unshift(id);
    write(KEY_RECENT, items.slice(0, RECENT_LIMIT));
  }

  function recentGames() {
    return read(KEY_RECENT).map(id => FG_DATA.games.find(g => g.id === id)).filter(Boolean);
  }

  /* --- UI sync ------------------------------------------------------------ */
  /** Update every favorites counter and heart button currently on screen. */
  function refreshBadges() {
    const n = count();
    document.querySelectorAll('[data-fav-count]').forEach(el => {
      el.textContent = n;
      el.hidden = n === 0;
    });
    document.querySelectorAll('[data-fav]').forEach(btn => {
      const active = has(btn.dataset.fav);
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', String(active));
      const icon = btn.querySelector('i');
      if (icon) icon.className = 'bi ' + (active ? 'bi-heart-fill' : 'bi-heart');
    });
  }

  /* One delegated listener covers every heart button on every page,
     including cards rendered after load. */
  document.addEventListener('click', function (e) {
    const btn = e.target.closest('[data-fav]');
    if (!btn) return;
    e.preventDefault();
    const id = btn.dataset.fav;
    const game = FG_DATA.games.find(g => g.id === id);
    const added = toggle(id);
    refreshBadges();
    if (window.FG && FG.toast) {
      FG.toast((game ? game.title : 'Game') + (added ? ' added to favorites' : ' removed from favorites'), added ? 'ok' : 'info');
    }
    document.dispatchEvent(new CustomEvent('fg:favorites-changed', { detail: { id: id, added: added } }));
  });

  return {
    list, has, count, add, remove, toggle, clear, games,
    hasNews, toggleNews, savedNews,
    pushRecent, recentGames, refreshBadges
  };
})();
