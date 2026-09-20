/* ==========================================================================
   FORZA GAMING — auth.js
   DEMO AUTHENTICATION ONLY.

   There is no server, no session, and no encryption here. Accounts are kept
   as plain objects in localStorage so the interface can show a signed-in
   state for a portfolio build. Never reuse this pattern for a real product:
   a production login needs a backend, hashed passwords and real sessions.
   ========================================================================== */

const FGAuth = (function () {
  'use strict';

  const KEY_USERS = 'fg-users';
  const KEY_SESSION = 'fg-session';

  /* Two accounts are seeded so the demo can be explored without signing up. */
  const SEED = [
    { id: 'demo-admin', username: 'forza_admin', email: 'admin@forza.demo', password: 'admin123', role: 'admin', joined: '2024-01-15' },
    { id: 'demo-user', username: 'player_one', email: 'player@forza.demo', password: 'demo1234', role: 'member', joined: '2025-03-02' }
  ];

  function read(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) || fallback; }
    catch (e) { return fallback; }
  }

  function write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch (e) { /* storage unavailable */ }
  }

  function users() {
    let list = read(KEY_USERS, null);
    if (!list) { list = SEED.slice(); write(KEY_USERS, list); }
    return list;
  }

  function avatarFor(name) {
    return 'https://picsum.photos/seed/forza-avatar-' + encodeURIComponent(name) + '/160/160';
  }

  /** The signed-in user, or null. Never includes the password. */
  function current() {
    const s = read(KEY_SESSION, null);
    if (!s) return null;
    const u = users().find(x => x.email === s.email);
    if (!u) return null;
    return {
      id: u.id, username: u.username, email: u.email, role: u.role,
      joined: u.joined, avatar: u.avatar || avatarFor(u.username)
    };
  }

  const isLoggedIn = () => !!current();

  function login(email, password) {
    const u = users().find(x => x.email.toLowerCase() === String(email).trim().toLowerCase());
    if (!u) return { ok: false, error: 'No account found with that email address.' };
    if (u.password !== password) return { ok: false, error: 'That password does not match our demo records.' };
    write(KEY_SESSION, { email: u.email, at: Date.now() });
    return { ok: true, user: current() };
  }

  function register(username, email, password) {
    const list = users();
    if (list.some(x => x.email.toLowerCase() === email.trim().toLowerCase())) {
      return { ok: false, error: 'That email is already registered in this demo.' };
    }
    const user = {
      id: 'u' + Date.now(),
      username: username.trim(),
      email: email.trim(),
      password: password,
      role: 'member',
      joined: new Date().toISOString().slice(0, 10),
      avatar: avatarFor(username.trim())
    };
    list.push(user);
    write(KEY_USERS, list);
    write(KEY_SESSION, { email: user.email, at: Date.now() });
    return { ok: true, user: current() };
  }

  function logout() {
    try { localStorage.removeItem(KEY_SESSION); } catch (e) {}
  }

  function updateProfile(changes) {
    const s = read(KEY_SESSION, null);
    if (!s) return false;
    const list = users();
    const u = list.find(x => x.email === s.email);
    if (!u) return false;
    Object.assign(u, changes);
    write(KEY_USERS, list);
    if (changes.email) write(KEY_SESSION, { email: changes.email, at: Date.now() });
    return true;
  }

  /** Send guests to the login page, remembering where they were headed. */
  function requireLogin() {
    if (isLoggedIn()) return true;
    const back = encodeURIComponent(location.pathname.split('/').pop() + location.hash);
    location.replace('login.html?next=' + back);
    return false;
  }

  /* --- Password strength --------------------------------------------------- */
  function strength(pw) {
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
    if (/\d/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    const levels = [
      { label: 'Too short', color: '#ff2e63', pct: 15 },
      { label: 'Weak', color: '#ff2e63', pct: 30 },
      { label: 'Fair', color: '#fbbf24', pct: 50 },
      { label: 'Good', color: '#22d3ee', pct: 75 },
      { label: 'Strong', color: '#34d399', pct: 100 },
      { label: 'Strong', color: '#34d399', pct: 100 }
    ];
    return levels[score];
  }

  /* --- Form validation helpers --------------------------------------------- */
  function setError(input, message) {
    input.classList.toggle('is-invalid', !!message);
    const holder = input.closest('.mb-3, .mb-2, .form-group') || input.parentElement;
    let fb = holder.querySelector('.invalid-feedback');
    if (!fb) {
      fb = document.createElement('div');
      fb.className = 'invalid-feedback d-block';
      holder.appendChild(fb);
    }
    fb.textContent = message || '';
  }

  const validEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

  /* --- Page wiring ---------------------------------------------------------- */
  function initLoginPage() {
    const form = document.getElementById('loginForm');
    if (!form) return;
    form.addEventListener('submit', e => {
      e.preventDefault();
      const email = form.email, pw = form.password;
      let ok = true;
      if (!validEmail(email.value)) { setError(email, 'Enter a valid email address.'); ok = false; } else setError(email, '');
      if (!pw.value) { setError(pw, 'Enter your password.'); ok = false; } else setError(pw, '');
      if (!ok) return;

      const res = login(email.value, pw.value);
      if (!res.ok) { setError(pw, res.error); return; }
      FG.toast('Signed in as ' + res.user.username, 'ok');
      const next = new URLSearchParams(location.search).get('next');
      setTimeout(() => { location.href = next ? decodeURIComponent(next) : 'dashboard.html'; }, 700);
    });

    // One-tap demo accounts
    document.querySelectorAll('[data-demo-login]').forEach(btn => {
      btn.addEventListener('click', () => {
        const role = btn.dataset.demoLogin;
        const acc = SEED.find(s => s.role === role);
        form.email.value = acc.email;
        form.password.value = acc.password;
        FG.toast('Demo credentials filled in — press Sign in', 'info');
      });
    });
  }

  function initRegisterPage() {
    const form = document.getElementById('registerForm');
    if (!form) return;

    const meter = document.querySelector('#pwStrength span');
    const meterLabel = document.getElementById('pwStrengthLabel');
    if (meter) {
      form.password.addEventListener('input', () => {
        const s = strength(form.password.value);
        meter.style.width = form.password.value ? s.pct + '%' : '0';
        meter.style.background = s.color;
        meterLabel.textContent = form.password.value ? s.label : '';
      });
    }

    form.addEventListener('submit', e => {
      e.preventDefault();
      let ok = true;
      if (form.username.value.trim().length < 3) { setError(form.username, 'Pick a name with at least 3 characters.'); ok = false; } else setError(form.username, '');
      if (!validEmail(form.email.value)) { setError(form.email, 'Enter a valid email address.'); ok = false; } else setError(form.email, '');
      if (form.password.value.length < 8) { setError(form.password, 'Use at least 8 characters.'); ok = false; } else setError(form.password, '');
      if (form.confirm.value !== form.password.value) { setError(form.confirm, 'Both passwords need to match.'); ok = false; } else setError(form.confirm, '');
      if (!form.terms.checked) { setError(form.terms, 'Accept the demo terms to continue.'); ok = false; } else setError(form.terms, '');
      if (!ok) return;

      const res = register(form.username.value, form.email.value, form.password.value);
      if (!res.ok) { setError(form.email, res.error); return; }
      FG.toast('Account created. Welcome, ' + res.user.username + '.', 'ok');
      setTimeout(() => { location.href = 'dashboard.html'; }, 800);
    });
  }

  function initForgotPage() {
    const form = document.getElementById('forgotForm');
    if (!form) return;
    form.addEventListener('submit', e => {
      e.preventDefault();
      if (!validEmail(form.email.value)) { setError(form.email, 'Enter the email you registered with.'); return; }
      setError(form.email, '');
      document.getElementById('forgotSent').hidden = false;
      form.hidden = true;
      FG.toast('Reset link simulated — nothing was actually sent', 'info');
    });
  }

  /* Sign-out works from the navbar on any page. */
  document.addEventListener('click', e => {
    if (!e.target.closest('[data-action="logout"]')) return;
    logout();
    FG.toast('Signed out', 'info');
    setTimeout(() => { location.href = 'index.html'; }, 500);
  });

  document.addEventListener('DOMContentLoaded', () => {
    initLoginPage();
    initRegisterPage();
    initForgotPage();
  });

  return {
    current, isLoggedIn, login, register, logout, updateProfile,
    requireLogin, users, strength, avatarFor, setError, validEmail
  };
})();
