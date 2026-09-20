# FORZA GAMING

A complete, fully static gaming portal: games catalogue, news, reviews, platforms,
hardware, esports, community, a member dashboard and a demo admin panel.

Built with **HTML5, CSS3, vanilla JavaScript and Bootstrap 5** — nothing else.
No PHP, no MySQL, no Node.js build step, no backend of any kind. Every page is a
plain `.html` file you can open straight from your file manager.

---

## 1. How to run it locally

Unzip the archive and you are done — there is nothing to install and nothing to build.

```
unzip forza-gaming.zip
cd forza-gaming
```

If you want a local web server (optional, but recommended — see the note below),
use any static server you already have:

```bash
# Python 3 — ships with macOS and most Linux distros
python3 -m http.server 5500
# then open http://localhost:5500

# or, if you happen to have Node installed
npx serve .
```

**Note on the local server:** the site works fine from `file://`, but browsers apply
stricter rules there. A local server gives you clean URLs and avoids any future CORS
surprises if you swap the demo data for a local `.json` file.

## 2. How to open it directly in a browser

Double-click **`index.html`**, or drag it onto an open browser window.

That is the whole procedure. The site detects nothing special about its environment —
the navbar, footer and search overlay are injected by `js/main.js`, and all content is
read from the arrays in `js/data.js`.

The only thing that needs the internet is the remote imagery (picsum.photos), the
Bootstrap CDN and Google Fonts. Offline, the layout still renders and every broken
photo falls back to `assets/images/placeholder.svg`.

## 3. Deploying to GitHub Pages

1. Create a repository on GitHub and push the contents of this folder to it:

   ```bash
   git init
   git add .
   git commit -m "Forza Gaming static site"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo>.git
   git push -u origin main
   ```

2. On GitHub, open **Settings → Pages**.
3. Under *Build and deployment*, set **Source** to `Deploy from a branch`.
4. Choose branch **`main`** and folder **`/ (root)`**, then click **Save**.
5. Wait about a minute. Your site appears at
   `https://<your-username>.github.io/<your-repo>/`.

Because `index.html` sits at the root and every link is relative, no configuration
file is needed. If you prefer to serve from a subfolder, move the files into `/docs`
and pick `/docs` as the folder in step 4.

## 4. Deploying to Vercel

**Option A — the dashboard**

1. Push the project to GitHub, GitLab or Bitbucket.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repository.
3. Leave *Framework Preset* as **Other**.
4. Leave *Build Command* **empty** and set *Output Directory* to **`.`** (the root).
5. Click **Deploy**.

**Option B — the CLI**

```bash
npm i -g vercel   # one-time
cd forza-gaming
vercel            # follow the prompts, accept the defaults
vercel --prod     # when you are happy with the preview
```

There is no build step, so deployment is effectively an upload. The same approach
works on Netlify, Cloudflare Pages, Surge or any static host.

## 5. Project structure

```
forza-gaming/
├── index.html              Home: hero, featured games, categories, news, reviews
├── games.html              Catalogue with filters, sorting, search, load-more
├── game-details.html       Reusable detail page, driven by ?id=
├── news.html               News hub with category filtering
├── news-details.html       Reusable article page, driven by ?id=
├── reviews.html            Scored reviews with pros and cons
├── platforms.html          Eight platforms, each with its own game list
├── community.html          Discussions, trending topics, top members
├── hardware.html           GPUs, CPUs, laptops, monitors, peripherals
├── esports.html            Tournaments, teams, players, match results
├── login.html              Demo sign-in
├── register.html           Demo registration with password-strength meter
├── forgot-password.html    Simulated password reset
├── profile.html            Public profile: stats, genres, favorites
├── dashboard.html          Member panel with a sidebar and six views
├── admin.html              Demo admin panel with CRUD, charts and reports
├── about.html              About, privacy, terms, contact
├── README.md
│
├── css/
│   ├── style.css           Design tokens, layout, components, animations
│   ├── responsive.css      Breakpoint tuning from 380px to 1400px+
│   └── admin.css           Dashboard and admin panel styles
│
├── js/
│   ├── data.js             All demo content (games, news, reviews, hardware…)
│   ├── main.js             Shared UI: navbar, footer, search, theme, toasts, home
│   ├── games.js            Catalogue filtering/sorting + game detail page
│   ├── news.js             News listing + article page
│   ├── pages.js            Reviews, platforms, community, hardware, esports
│   ├── auth.js             Demo login/register/logout (localStorage)
│   ├── favorites.js        Favorites, saved articles, recently viewed
│   ├── dashboard.js        Member dashboard + profile page
│   └── admin.js            Admin panel CRUD simulation
│
└── assets/
    ├── images/placeholder.svg   Fallback for any image that fails to load
    └── icons/favicon.svg        Site icon
```

Each page loads its scripts in a fixed order:
`bootstrap → data.js → auth.js → favorites.js → main.js → page script`.

### Where the content lives

All demo content is in **`js/data.js`** as plain JavaScript arrays and objects —
18 games, 18 news articles, 8 reviews, 12 hardware products, 9 categories,
8 platforms, esports fixtures, community threads and member records.

Edit that one file to change what the whole site displays. Images use a deterministic
`img()` helper pointing at picsum.photos; swap it for your own paths (e.g.
`assets/images/my-game.jpg`) and every page picks the change up at once.

## 6. Technologies used

| Technology | Role |
| --- | --- |
| HTML5 | Semantic markup, landmarks, accessible forms |
| CSS3 | Custom properties, grid, flexbox, glassmorphism, animations, conic-gradient charts |
| JavaScript (ES6, vanilla) | All behaviour — no framework, no bundler |
| Bootstrap 5.3.3 | Grid, modals, offcanvas, dropdowns, form controls (CDN) |
| Bootstrap Icons 1.11.3 | Iconography (CDN) |
| Google Fonts | Chakra Petch (display) + Inter (body) |
| localStorage | Auth session, favorites, saved news, theme, admin records |
| picsum.photos | Royalty-free placeholder imagery |

Notable features implemented in plain JS: live site-wide search (`/` or `Ctrl`/`⌘`+`K`),
multi-criteria filtering and sorting, favorites with persistence, scroll-reveal
animations, animated counters, parallax hero, image gallery, tabs, toast
notifications, form validation, a light/dark theme toggle, and charts drawn with
CSS rather than a charting library.

## 7. Important: this is a frontend demo

**The login, registration, dashboard and admin panel are simulations.** There is no
server, no database, no API and no real authentication anywhere in this project.

- Accounts are stored in `localStorage` under `fg-users`, and the active session
  under `fg-session`. Passwords are held in plain text in your own browser.
  **Do not enter a real password you use anywhere else.**
- "Creating", "editing" and "deleting" records in the admin panel writes to
  `localStorage` (`fg-admin-games`, `fg-admin-news`, `fg-admin-users`). Use
  *Reset demo data* in the admin sidebar to restore the originals.
- The newsletter form, contact details, password reset and community posting all
  validate input and show feedback, but send nothing anywhere.
- Clearing your browser's site data resets the entire experience.
- Every game, article, review, product, team and member is fictional content written
  for this portfolio project.

### Demo accounts

| Role | Email | Password |
| --- | --- | --- |
| Member | `player@forza.demo` | `demo1234` |
| Administrator | `admin@forza.demo` | `admin123` |

Sign in as the administrator to reach `admin.html`; members are redirected to their
own dashboard.

---

## Browser support

Tested against current Chrome, Edge, Firefox and Safari. Uses `backdrop-filter`,
CSS custom properties, `IntersectionObserver` and `conic-gradient` — all supported in
browsers from 2021 onwards. A `prefers-reduced-motion` block disables animation for
anyone who asks for it at the OS level.

## License

The code is yours to use and modify freely. The imagery is served from picsum.photos
under its own terms; replace it with your own assets before any commercial use.
