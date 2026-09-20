/* ==========================================================================
   FORZA GAMING — Demo data
   Everything below is fictional sample content used to demonstrate the UI.
   No database, no API: the whole site reads from these plain JS arrays.
   Images are served from picsum.photos (royalty-free placeholder imagery)
   with a fixed seed per item so the same picture always maps to the same
   record. Swap the `img()` helper for your own asset paths if you prefer.
   ========================================================================== */

/* Deterministic remote image helper */
function img(seed, w, h) {
  return 'https://picsum.photos/seed/forza-' + seed + '/' + w + '/' + h;
}

const FG_DATA = {};

/* --- Game categories ------------------------------------------------------ */
FG_DATA.categories = [
  { id: 'action',    name: 'Action',     icon: 'bi-lightning-charge-fill', blurb: 'Fast combat, tight controls' },
  { id: 'adventure', name: 'Adventure',  icon: 'bi-compass-fill',          blurb: 'Stories worth finishing' },
  { id: 'rpg',       name: 'RPG',        icon: 'bi-magic',                 blurb: 'Builds, choices, loot' },
  { id: 'horror',    name: 'Horror',     icon: 'bi-moon-stars-fill',       blurb: 'Play with the lights off' },
  { id: 'racing',    name: 'Racing',     icon: 'bi-speedometer2',          blurb: 'Apex hunting and drifts' },
  { id: 'sports',    name: 'Sports',     icon: 'bi-trophy-fill',           blurb: 'Seasons, squads, silverware' },
  { id: 'strategy',  name: 'Strategy',   icon: 'bi-diagram-3-fill',        blurb: 'Plan three turns ahead' },
  { id: 'openworld', name: 'Open World', icon: 'bi-globe-americas',        blurb: 'Go anywhere, poke everything' },
  { id: 'fps',       name: 'FPS',        icon: 'bi-crosshair',             blurb: 'Aim down sights' }
];

/* --- Platforms ------------------------------------------------------------ */
FG_DATA.platforms = [
  { id: 'pc',      name: 'PC',                icon: 'bi-pc-display-horizontal', accent: '#22d3ee', tagline: 'Mods, ultrawide and uncapped frames', library: 2480, blurb: 'The most flexible place to play: every storefront, every frame rate, and a mod scene that keeps games alive for a decade.' },
  { id: 'ps5',     name: 'PlayStation 5',     icon: 'bi-playstation',           accent: '#3b82f6', tagline: 'Haptics, fast loads, big exclusives', library: 1180, blurb: 'Sony\'s current flagship, built around the DualSense controller and a custom SSD that all but removes loading screens.' },
  { id: 'ps4',     name: 'PlayStation 4',     icon: 'bi-playstation',           accent: '#60a5fa', tagline: 'A decade-deep back catalogue', library: 3620, blurb: 'Still supported by cross-gen releases, and home to one of the strongest single-player libraries ever assembled.' },
  { id: 'xsx',     name: 'Xbox Series X|S',   icon: 'bi-xbox',                  accent: '#34d399', tagline: 'Game Pass, Quick Resume, 120Hz', library: 1340, blurb: 'Two boxes, one library. Quick Resume lets you park several games mid-session and jump straight back in.' },
  { id: 'xone',    name: 'Xbox One',          icon: 'bi-xbox',                  accent: '#6ee7b7', tagline: 'Backwards compatible workhorse', library: 2890, blurb: 'The generation that made backwards compatibility a headline feature, and still receives plenty of cross-gen ports.' },
  { id: 'switch',  name: 'Nintendo Switch',   icon: 'bi-nintendo-switch',       accent: '#ff2e63', tagline: 'Handheld first, docked when you want', library: 4310, blurb: 'Nintendo\'s hybrid: first-party design at its most playful, plus an enormous indie catalogue.' },
  { id: 'android', name: 'Android',           icon: 'bi-android2',              accent: '#8b5cf6', tagline: 'Controller support and cloud play', library: 5200, blurb: 'Gamepad support, cloud streaming and a growing shelf of premium ports have made Android a real second screen.' },
  { id: 'ios',     name: 'iOS',               icon: 'bi-apple',                 accent: '#f472b6', tagline: 'Console ports in your pocket', library: 4870, blurb: 'Recent Apple silicon runs full console ports natively, and the App Store remains the best-funded mobile market.' }
];

/* --- Games ---------------------------------------------------------------- */
/* rating is out of 10 — used for sorting, score chips and review scores      */
FG_DATA.games = [
  {
    id: 'neon-requiem', title: 'Neon Requiem', genre: 'action', genres: ['Action', 'Open World'],
    platforms: ['pc', 'ps5', 'xsx'], rating: 9.4, released: '2026-03-19', developer: 'Vantablack Studio',
    publisher: 'Helix Interactive', price: '$69.99', players: 'Single-player',
    short: 'A rain-soaked megacity, a dead detective, and 40 hours of neon-lit revenge.',
    description: 'Neon Requiem drops you into Kasumi Ward as an investigator who died four minutes ago and woke up in a borrowed body. Combat blends parry-heavy melee with a hacking layer that lets you rewrite enemy behaviour mid-fight, while the city itself reshuffles its districts every in-game night. The result is an open world that rewards route knowledge instead of map markers.',
    featured: true, trending: true
  },
  {
    id: 'ashfall-protocol', title: 'Ashfall Protocol', genre: 'fps', genres: ['FPS', 'Action'],
    platforms: ['pc', 'ps5', 'xsx'], rating: 8.8, released: '2026-01-28', developer: 'Ninth Circuit',
    publisher: 'Helix Interactive', price: '$59.99', players: 'Single-player, Co-op',
    short: 'Squad-based extraction shooter with weather that actively hunts you.',
    description: 'Every drop into the Ashfall zone starts calm and ends with a storm front closing the map. Ashfall Protocol pairs deliberate, weighty gunplay with a loadout economy where your best gear is always one bad extraction from being lost. Three-player squads can split objectives, but the radio only reaches so far.',
    featured: true, trending: true
  },
  {
    id: 'kingdom-of-glass', title: 'Kingdom of Glass', genre: 'rpg', genres: ['RPG', 'Adventure'],
    platforms: ['pc', 'ps5', 'xsx', 'switch'], rating: 9.6, released: '2025-11-07', developer: 'Marrowlight',
    publisher: 'Orchid Games', price: '$59.99', players: 'Single-player',
    short: 'A 90-hour reactive RPG where every ally you recruit can be lost for good.',
    description: 'Kingdom of Glass is a party-based RPG built around permanence. Companions leave, die, or betray you based on decisions made dozens of hours earlier, and the game never asks you to reload. Turn-based combat layers a positioning grid over a stance system, so the same party plays very differently depending on who you kept alive.',
    featured: true, trending: true
  },
  {
    id: 'apex-circuit-26', title: 'Apex Circuit 26', genre: 'racing', genres: ['Racing', 'Sports'],
    platforms: ['pc', 'ps5', 'xsx', 'xone'], rating: 8.5, released: '2026-02-12', developer: 'Redline Works',
    publisher: 'Torque Media', price: '$69.99', players: 'Single-player, Multiplayer',
    short: 'Career-mode racing with a tyre model that finally punishes lazy braking.',
    description: 'Apex Circuit 26 rebuilds its handling from the tyre up. Surface temperature, camber and wear all feed into grip, and the new career mode gives each team a personality that shapes what upgrades you are allowed to request. Twenty-eight licensed circuits, plus a track editor that exports to online lobbies.',
    featured: true
  },
  {
    id: 'hollow-signal', title: 'Hollow Signal', genre: 'horror', genres: ['Horror', 'Adventure'],
    platforms: ['pc', 'ps5', 'xsx'], rating: 9.1, released: '2025-10-24', developer: 'Pale Lantern',
    publisher: 'Orchid Games', price: '$39.99', players: 'Single-player',
    short: 'A radio survey station, one antenna, and something answering back.',
    description: 'Hollow Signal is a first-person horror game with no combat and no HUD. You triangulate transmissions across a frozen research base, and the only way to survive an encounter is to have already learned the building well enough to move without light. Its audio design is the star: the mix changes depending on how fast you are breathing.',
    featured: true, trending: true
  },
  {
    id: 'ironhold-tactics', title: 'Ironhold Tactics', genre: 'strategy', genres: ['Strategy'],
    platforms: ['pc', 'switch'], rating: 8.9, released: '2025-09-02', developer: 'Coldforge',
    publisher: 'Coldforge', price: '$34.99', players: 'Single-player, Multiplayer',
    short: 'Turn-based siege warfare where terrain is the real opponent.',
    description: 'Ironhold Tactics gives you a fortress, a limited garrison and a besieging army with more patience than you have supplies. Walls crumble persistently across a campaign, and rubble becomes cover for whoever reaches it first. The multiplayer ladder runs asynchronous matches, so a turn takes two minutes rather than two hours.',
    featured: true
  },
  {
    id: 'skyward-drift', title: 'Skyward Drift', genre: 'adventure', genres: ['Adventure', 'Open World'],
    platforms: ['pc', 'ps5', 'xsx', 'switch'], rating: 8.7, released: '2026-04-30', developer: 'Paper Harbor',
    publisher: 'Orchid Games', price: '$49.99', players: 'Single-player, Co-op',
    short: 'Build a glider, chase thermals, map an archipelago that never stops moving.',
    description: 'Skyward Drift is an exploration game about flight rather than fighting. You maintain a glider with parts salvaged from floating ruins, and every island drifts on a seasonal current, so a route that worked last week has to be re-plotted. Two-player co-op splits pilot and navigator duties.',
    featured: true
  },
  {
    id: 'blackwater-league', title: 'Blackwater League', genre: 'sports', genres: ['Sports'],
    platforms: ['pc', 'ps5', 'xsx', 'xone', 'switch'], rating: 8.2, released: '2025-08-15', developer: 'Halfline',
    publisher: 'Torque Media', price: '$49.99', players: 'Single-player, Multiplayer',
    short: 'Five-a-side football with a physics engine that rewards first touch.',
    description: 'Blackwater League strips football down to five-a-side pitches and rebuilds ball control around momentum. There is no shooting button that guarantees a goal; everything comes from body position. Season mode runs a full promotion ladder with squad morale that reacts to how you actually play, not just results.'
  },
  {
    id: 'the-long-orbit', title: 'The Long Orbit', genre: 'adventure', genres: ['Adventure', 'Strategy'],
    platforms: ['pc', 'ps5', 'xsx'], rating: 9.0, released: '2026-05-21', developer: 'Marrowlight',
    publisher: 'Helix Interactive', price: '$44.99', players: 'Single-player',
    short: 'Keep a generation ship alive for 200 years. You will not see the destination.',
    description: 'The Long Orbit is a management-adventure hybrid played across six generations of crew. Decisions you make in the first hour shape the culture, laws and technical debt that your descendants inherit. Failure is not a game over screen; it is a worse ship that your grandchildren have to live in.',
    trending: true
  },
  {
    id: 'grit-and-gasoline', title: 'Grit & Gasoline', genre: 'racing', genres: ['Racing', 'Open World'],
    platforms: ['pc', 'ps5', 'xsx'], rating: 8.0, released: '2025-07-11', developer: 'Redline Works',
    publisher: 'Torque Media', price: '$39.99', players: 'Single-player, Multiplayer',
    short: 'Open-world rally across 900 km of unpaved American backroads.',
    description: 'Grit & Gasoline swaps circuits for country. There are no loading screens between stages, damage carries between events, and a repair economy means finishing second in one piece often beats winning on three wheels. Weather rolls in on a real clock, so a dry stage can go to mud mid-run.'
  },
  {
    id: 'veil-of-cinders', title: 'Veil of Cinders', genre: 'rpg', genres: ['RPG', 'Action'],
    platforms: ['pc', 'ps5', 'xsx'], rating: 9.2, released: '2025-12-05', developer: 'Vantablack Studio',
    publisher: 'Orchid Games', price: '$69.99', players: 'Single-player',
    short: 'Action RPG with a magic system you write yourself, rune by rune.',
    description: 'Veil of Cinders hands you a blank grimoire instead of a spell list. Runes combine into shapes, costs and side effects, and the same three components can produce a shield or a bomb depending on how you arrange them. The world reacts to what you build: guards who have seen your signature spell will prepare for it.',
    trending: true
  },
  {
    id: 'static-bloom', title: 'Static Bloom', genre: 'horror', genres: ['Horror', 'RPG'],
    platforms: ['pc', 'switch'], rating: 8.4, released: '2026-06-18', developer: 'Pale Lantern',
    publisher: 'Pale Lantern', price: '$24.99', players: 'Single-player',
    short: 'Pixel-art body horror with a combat system built on sacrifice.',
    description: 'Static Bloom is a compact, hand-animated horror RPG where every ability costs part of your body. Lose an arm to cast, lose an eye to see the truth of a room. Runs last about five hours, and the game is designed to be finished several times with different mutilations.'
  },
  {
    id: 'terminus-drive', title: 'Terminus Drive', genre: 'fps', genres: ['FPS', 'Horror'],
    platforms: ['pc', 'ps5', 'xsx'], rating: 7.9, released: '2025-06-27', developer: 'Ninth Circuit',
    publisher: 'Helix Interactive', price: '$29.99', players: 'Single-player, Co-op',
    short: 'Retro-styled corridor shooter with a brutal one-life challenge mode.',
    description: 'Terminus Drive is a deliberately old-fashioned shooter: no regenerating health, no cover system, just level knowledge and ammo discipline. Four-player co-op scales enemy density rather than health pools, which keeps the pace frantic instead of spongy.'
  },
  {
    id: 'sunken-atlas', title: 'Sunken Atlas', genre: 'openworld', genres: ['Open World', 'Adventure'],
    platforms: ['pc', 'ps5', 'xsx', 'switch'], rating: 8.6, released: '2026-02-27', developer: 'Paper Harbor',
    publisher: 'Orchid Games', price: '$54.99', players: 'Single-player',
    short: 'Cartography as a core mechanic, 60 metres under a flooded world.',
    description: 'In Sunken Atlas the map starts blank and you draw it. Every wreck you chart sells for supplies, and the ocean floor shifts after storms, invalidating older surveys. Oxygen is the only real currency, and the deep sections are genuinely unnerving without ever being a horror game.'
  },
  {
    id: 'pixel-dynasty', title: 'Pixel Dynasty', genre: 'strategy', genres: ['Strategy', 'RPG'],
    platforms: ['pc', 'switch', 'android', 'ios'], rating: 8.1, released: '2025-05-09', developer: 'Coldforge',
    publisher: 'Coldforge', price: '$19.99', players: 'Single-player, Multiplayer',
    short: '4X empire building that finishes a full campaign in ninety minutes.',
    description: 'Pixel Dynasty is a deliberately short 4X. Tech trees are five layers deep instead of fifty, and diplomacy is handled through a small deck of promises that you can break at a reputational cost. Cross-play between PC, Switch and mobile with asynchronous turns.'
  },
  {
    id: 'crown-of-thorne', title: 'Crown of Thorne', genre: 'action', genres: ['Action', 'RPG'],
    platforms: ['pc', 'ps5', 'xsx'], rating: 9.3, released: '2026-07-24', developer: 'Marrowlight',
    publisher: 'Helix Interactive', price: '$69.99', players: 'Single-player',
    short: 'A precise, punishing action game about inheriting a cursed throne.',
    description: 'Crown of Thorne is built around a single mechanic: your health bar is your kingdom. Spend it to rebuild villages and you fight weaker; hoard it and your realm starves. Boss design is exceptional, with every encounter teachable in three attempts and masterable in thirty.',
    trending: true
  },
  {
    id: 'harbor-lights', title: 'Harbor Lights', genre: 'adventure', genres: ['Adventure'],
    platforms: ['pc', 'switch', 'ios', 'android'], rating: 8.3, released: '2025-04-18', developer: 'Halfline',
    publisher: 'Halfline', price: '$14.99', players: 'Single-player',
    short: 'A gentle six-hour story about running a ferry nobody needs anymore.',
    description: 'Harbor Lights is a quiet narrative game with no fail state. You pilot a small ferry between four islands, learn the routines of about twenty residents, and decide what to do when the route is scheduled for closure. Watercolour art, live-recorded score.'
  },
  {
    id: 'voltage-arena', title: 'Voltage Arena', genre: 'fps', genres: ['FPS', 'Sports'],
    platforms: ['pc', 'ps5', 'xsx'], rating: 8.7, released: '2026-08-06', developer: 'Ninth Circuit',
    publisher: 'Torque Media', price: 'Free to play', players: 'Multiplayer',
    short: 'Five-versus-five arena shooter designed around a 90-second round clock.',
    description: 'Voltage Arena is the esports-first shooter in Forza\'s rotation. Rounds are short, economy resets every four rounds, and there are no loadout unlocks that affect balance. Its ranked ladder uses transparent MMR, and the spectator client ships with the game rather than a year later.',
    trending: true
  }
];

/* --- News ----------------------------------------------------------------- */
FG_DATA.news = [
  { id: 'n01', category: 'PC', title: 'Neon Requiem gets a 60-hour free content update this autumn', author: 'Dania Karimova', date: '2026-09-17', excerpt: 'Vantablack Studio confirmed a second district, a new-game-plus mode and full ultrawide support arriving in October, free to everyone who owns the base game.', body: 'The studio walked through the update in a 20-minute stream, focusing on the new Harbour Ward district and a rebuilt hacking interface. Director Mira Osei said the team had held the district back rather than ship it as paid DLC because "the map felt incomplete without it". The patch also brings proper 21:9 and 32:9 support, DLSS and FSR updates, and a rebalanced late-game economy.', featured: true },
  { id: 'n02', category: 'PlayStation', title: 'PS5 September system update adds per-game power profiles', author: 'Marco Villanueva', date: '2026-09-16', excerpt: 'Sony is rolling out a firmware release that lets players cap frame rates and set power targets per title, plus a rebuilt friends list.', body: 'The update is live for beta participants and reaches everyone else within a fortnight. Alongside power profiles, the release reworks the friends list into a single activity feed, adds folder support to the game library, and improves DualSense battery reporting accuracy.' },
  { id: 'n03', category: 'Xbox', title: 'Game Pass adds Kingdom of Glass on day one of its console release', author: 'Hannah Reid', date: '2026-09-15', excerpt: 'Marrowlight\'s 90-hour RPG joins the catalogue alongside four back-catalogue strategy titles and a cloud-only beta.', body: 'Microsoft confirmed the September wave at its monthly showcase. Kingdom of Glass is the headline addition, arriving day one on Series X|S and PC. Also joining: three Coldforge strategy titles and a cloud-streaming beta for Ironhold Tactics that supports touch controls on mobile.', featured: true },
  { id: 'n04', category: 'Nintendo', title: 'Nintendo dates its autumn Direct for early October', author: 'Yuki Tanabe', date: '2026-09-14', excerpt: 'A 40-minute presentation will focus on titles shipping before March, according to the company\'s investor briefing.', body: 'Nintendo told investors the presentation would concentrate on the holiday window and the first quarter of next year. Analysts expect an update on the Switch port of Skyward Drift, which was announced without a date, plus the annual first-party holiday reveal.' },
  { id: 'n05', category: 'Esports', title: 'Voltage Arena World Series expands to sixteen teams and three regions', author: 'Sam Okoro', date: '2026-09-13', excerpt: 'The organisers have added a South American slot and doubled the prize pool to $4.2 million for next season.', body: 'The expanded format introduces a group stage in each region followed by a single-site playoff. Prize distribution has also been flattened, with last place taking home roughly 4% of the pool instead of 1%. Player representatives welcomed the change but pushed for a shorter travel calendar.', featured: true },
  { id: 'n06', category: 'Gaming Hardware', title: 'Vertex RTX-class GPU refresh lands with 24GB and a smaller cooler', author: 'Priya Raghunathan', date: '2026-09-12', excerpt: 'Early benchmarks put the mid-tier card within 8% of last generation\'s flagship at two-thirds of the power draw.', body: 'The refresh focuses on efficiency rather than raw ceiling. In our sample runs at 1440p the card held above 120fps in Ashfall Protocol with ray tracing enabled. The two-slot cooler is a meaningful change for small form factor builds, which have been badly served for three generations.' },
  { id: 'n07', category: 'Industry News', title: 'Orchid Games opens a second studio and commits to no crunch policy', author: 'Dania Karimova', date: '2026-09-11', excerpt: 'The publisher says the new team will work a four-day week during pre-production, with contractual overtime limits.', body: 'Orchid published the policy in full, which is unusual for the industry. It caps overtime at 10 hours per month, requires written sign-off from a director for any exception, and ties executive bonuses to compliance. Several developers publicly asked their own employers to match it.' },
  { id: 'n08', category: 'Mobile', title: 'Pixel Dynasty crosses four million players on mobile', author: 'Hannah Reid', date: '2026-09-10', excerpt: 'Coldforge\'s compact 4X has found a second life on phones, where asynchronous turns fit the format.', body: 'The studio credits cross-play and the absence of any energy timer. "We sell the game once and then leave people alone," said design lead Ana Petrov. A tablet-optimised interface update is scheduled for November.' },
  { id: 'n09', category: 'PC', title: 'Ashfall Protocol adds solo extraction and drops its always-online requirement', author: 'Marco Villanueva', date: '2026-09-09', excerpt: 'Ninth Circuit responded to six months of community feedback with an offline mode and a reworked loss economy.', body: 'Solo extraction runs at a reduced storm speed and pays out slightly less, which the studio says keeps squad play worthwhile without punishing people who have nobody online. The offline mode stores progress locally and syncs when you reconnect.' },
  { id: 'n10', category: 'PlayStation', title: 'Veil of Cinders sells 3.1 million copies in its first quarter', author: 'Yuki Tanabe', date: '2026-09-08', excerpt: 'Vantablack\'s rune-crafting RPG is the publisher\'s fastest-selling new property since 2021.', body: 'Orchid Games reported the figure in its quarterly results, noting unusually strong PC attachment at 44% of sales. The company said a story expansion is in production for next year and that the rune editor would be opened to community sharing.' },
  { id: 'n11', category: 'Xbox', title: 'Quick Resume now holds twelve games after a September backend change', author: 'Sam Okoro', date: '2026-09-07', excerpt: 'Microsoft quietly raised the suspended-title limit, and the reliability improvements are noticeable.', body: 'The change was not in the release notes, but testing confirms twelve suspended titles on Series X and eight on Series S. Restore times also improved by roughly 30% on titles that had previously been prone to dropping their state.' },
  { id: 'n12', category: 'Esports', title: 'Ironhold Tactics announces a $500,000 asynchronous world championship', author: 'Priya Raghunathan', date: '2026-09-06', excerpt: 'Matches will be played over 48-hour turn windows, with the finals played live on a single stage.', body: 'The format is unusual for a strategy title and is designed around players with jobs. Qualification runs entirely online across four months, and only the eight-player finals require travel. Coldforge says it will cover flights and accommodation for all finalists.' },
  { id: 'n13', category: 'Gaming Hardware', title: 'We tested nine gaming headsets: three are worth your money', author: 'Hannah Reid', date: '2026-09-05', excerpt: 'Wireless latency has largely been solved. Microphone quality and clamp force are where the real differences remain.', body: 'Across nine units between $80 and $350, measured latency never exceeded 38ms, which is inaudible in practice. What separates them now is comfort over a four-hour session and how well the microphone survives a noisy room. Our picks are in the full review.' },
  { id: 'n14', category: 'Industry News', title: 'Preservation group archives 400 delisted games with publisher cooperation', author: 'Dania Karimova', date: '2026-09-04', excerpt: 'A two-year effort has produced playable archives available to researchers and libraries, with three publishers signing on.', body: 'The archive covers titles removed from digital storefronts due to expired licences. Access is limited to accredited institutions for now, but the group is lobbying for a legal exemption that would allow remote access for academic use.' },
  { id: 'n15', category: 'Mobile', title: 'Harbor Lights arrives on phones with full controller support', author: 'Marco Villanueva', date: '2026-09-03', excerpt: 'Halfline\'s ferry game makes the jump to mobile without cuts, and it suits the format better than expected.', body: 'The port keeps the full six-hour story, adds cloud saves that sync with the PC version, and supports any Bluetooth controller. Touch controls were rebuilt rather than mapped, with a single-thumb piloting scheme for the ferry sections.' },
  { id: 'n16', category: 'PC', title: 'Crown of Thorne patch reworks its most criticised boss encounter', author: 'Yuki Tanabe', date: '2026-09-02', excerpt: 'Marrowlight adjusted the third act fight after telemetry showed a 61% abandonment rate at that point.', body: 'The studio published the telemetry alongside the patch notes, which is rare. The encounter keeps its difficulty but adds a mid-fight checkpoint and removes a camera issue in the second phase. Players who already beat it receive a cosmetic in recognition.' },
  { id: 'n17', category: 'PlayStation', title: 'Sunken Atlas cartography mode gets a community map exchange', author: 'Sam Okoro', date: '2026-09-01', excerpt: 'Players can now publish their survey charts and download other people\'s, with attribution and version history.', body: 'Paper Harbor built the exchange into the game rather than a website, and every chart records who surveyed which section. Downloaded maps are marked as second-hand data, and storms will still invalidate them, so the feature saves time without removing the core loop.' },
  { id: 'n18', category: 'Industry News', title: 'Accessibility report: 78% of 2026 releases shipped with remappable controls', author: 'Priya Raghunathan', date: '2026-08-31', excerpt: 'The annual survey shows steady progress on input options and subtitles, and very little on colour vision support.', body: 'The report covers 340 releases. Full input remapping is now close to standard, and subtitle size options appear in four out of five games. Colour vision modes remain under a third, and the report singles out user interface contrast as the most common failure.' }
];

/* --- Reviews -------------------------------------------------------------- */
FG_DATA.reviews = [
  { id: 'r1', gameId: 'kingdom-of-glass', score: 9.6, reviewer: 'Dania Karimova', date: '2025-11-12', platform: 'PC', verdict: 'The rarest thing in a long RPG: consequences that actually stick.',
    pros: ['Companion deaths are permanent and meaningful', 'Combat stance system stays fresh for 90 hours', 'Writing holds up across every branch'],
    cons: ['Opening five hours are slow', 'Inventory management is fiddly on controller'] },
  { id: 'r2', gameId: 'neon-requiem', score: 9.4, reviewer: 'Marco Villanueva', date: '2026-03-25', platform: 'PlayStation 5', verdict: 'An open world you learn rather than one you clear.',
    pros: ['City layout rewards memory, not markers', 'Hacking layer transforms every fight', 'Best-in-class lighting and rain'],
    cons: ['Side cases repeat their structure', 'Performance mode drops in the market district'] },
  { id: 'r3', gameId: 'crown-of-thorne', score: 9.3, reviewer: 'Yuki Tanabe', date: '2026-07-30', platform: 'PC', verdict: 'Brutal, fair, and built around one excellent idea.',
    pros: ['Health-as-kingdom mechanic is genuinely novel', 'Every boss is teachable', 'No difficulty cliff disguised as depth'],
    cons: ['Very little guidance in the second act', 'Story fizzles in the final hour'] },
  { id: 'r4', gameId: 'veil-of-cinders', score: 9.2, reviewer: 'Hannah Reid', date: '2025-12-11', platform: 'Xbox Series X', verdict: 'A spell editor deep enough to break the game, and it lets you.',
    pros: ['Rune crafting is a real toolset', 'Enemies adapt to your signature spells', 'Excellent accessibility options'],
    cons: ['Tutorial undersells the systems badly', 'Frame pacing issues in large fights'] },
  { id: 'r5', gameId: 'hollow-signal', score: 9.1, reviewer: 'Sam Okoro', date: '2025-10-29', platform: 'PC', verdict: 'Horror that trusts sound design instead of jump scares.',
    pros: ['Audio mix reacts to your own panic', 'No combat, and it never needs any', 'Map knowledge is the only real upgrade'],
    cons: ['One late chapter overstays its welcome', 'Requires headphones to work at all'] },
  { id: 'r6', gameId: 'ashfall-protocol', score: 8.8, reviewer: 'Priya Raghunathan', date: '2026-02-04', platform: 'PC', verdict: 'Tense extraction shooting, once you accept the losses.',
    pros: ['Weather system creates real drama', 'Gunplay has weight and consequence', 'Solo mode is a proper addition'],
    cons: ['Progression grind bites around hour 20', 'Voice comms drop out at long range'] },
  { id: 'r7', gameId: 'apex-circuit-26', score: 8.5, reviewer: 'Marco Villanueva', date: '2026-02-19', platform: 'PlayStation 5', verdict: 'The best handling model the series has shipped.',
    pros: ['Tyre simulation is a genuine step up', 'Team personalities give career mode shape', 'Track editor is deep and exports cleanly'],
    cons: ['Career presentation is still dull', 'Wheel force feedback needs tuning out of the box'] },
  { id: 'r8', gameId: 'sunken-atlas', score: 8.6, reviewer: 'Dania Karimova', date: '2026-03-06', platform: 'Nintendo Switch', verdict: 'Mapping the ocean floor turns out to be excellent company.',
    pros: ['Cartography is a satisfying core loop', 'Deep sections are properly tense', 'Runs surprisingly well in handheld'],
    cons: ['Oxygen management gets repetitive late', 'Text is small on a handheld screen'] }
];

/* --- Gaming hardware ------------------------------------------------------ */
FG_DATA.hardware = [
  { id: 'h1', name: 'Vertex Aurora 5090X', type: 'GPU', price: '$1,599', rating: 9.2, specs: ['24GB GDDR7', '2.9GHz boost', '320W TDP', 'Two-slot cooler'], blurb: 'Flagship performance at a power draw that finally fits a small case.' },
  { id: 'h2', name: 'Corefall Ryzen X9 9950', type: 'CPU', price: '$649', rating: 9.0, specs: ['16 cores / 32 threads', '5.7GHz boost', '120W TDP', 'AM5 socket'], blurb: 'Still the sensible ceiling for a high-end gaming build in 2026.' },
  { id: 'h3', name: 'Forza Battlestation Pro', type: 'Gaming PC', price: '$2,899', rating: 8.8, specs: ['Aurora 5080 GPU', '32GB DDR5-6400', '2TB NVMe Gen5', '850W platinum PSU'], blurb: 'A pre-built that uses standard parts, so you can actually upgrade it later.' },
  { id: 'h4', name: 'Nightblade 16 Laptop', type: 'Gaming Laptop', price: '$2,199', rating: 8.6, specs: ['16" 240Hz mini-LED', 'Aurora 5070 mobile', '32GB RAM', '6-hour real battery'], blurb: 'The rare gaming laptop you can carry all day without regretting it.' },
  { id: 'h5', name: 'Halo View 27 OLED', type: 'Monitor', price: '$899', rating: 9.1, specs: ['27" 1440p OLED', '360Hz', '0.03ms GtG', 'HDR true black 400'], blurb: 'The sweet spot for competitive play without moving to a 32-inch desk.' },
  { id: 'h6', name: 'Halo View 32 4K', type: 'Monitor', price: '$1,249', rating: 8.7, specs: ['32" 4K IPS', '240Hz', 'DisplayPort 2.1', 'KVM built in'], blurb: 'For people who work on the same screen they play on.' },
  { id: 'h7', name: 'Pulse TKL Hall Effect', type: 'Keyboard', price: '$179', rating: 9.0, specs: ['Hall effect switches', 'Adjustable actuation 0.1–3.4mm', '8000Hz polling', 'Aluminium case'], blurb: 'Analogue actuation that genuinely helps in movement shooters.' },
  { id: 'h8', name: 'Pulse Compact 65', type: 'Keyboard', price: '$119', rating: 8.4, specs: ['65% layout', 'Hot-swap sockets', 'Gasket mount', 'USB-C detachable'], blurb: 'A small, quiet board that does not sound like a stapler.' },
  { id: 'h9', name: 'Drift Lightweight Wireless', type: 'Mouse', price: '$139', rating: 9.3, specs: ['48g', '32K DPI sensor', '90-hour battery', 'PTFE feet'], blurb: 'Light without holes, and the battery outlasts a long tournament weekend.' },
  { id: 'h10', name: 'Drift Ergo MX', type: 'Mouse', price: '$99', rating: 8.5, specs: ['Right-hand ergonomic', '26K DPI', '70-hour battery', 'Six programmable buttons'], blurb: 'The comfortable option for people who play and work on one mouse.' },
  { id: 'h11', name: 'Echo Chamber Wireless', type: 'Headset', price: '$249', rating: 9.0, specs: ['50mm drivers', '38ms latency', 'Broadcast-grade mic', '40-hour battery'], blurb: 'The microphone is the reason to buy it, which is unusual for a headset.' },
  { id: 'h12', name: 'Forza Precision Controller', type: 'Controller', price: '$189', rating: 8.9, specs: ['Hall effect sticks', 'Four back paddles', 'Swappable weights', 'Wired 1000Hz mode'], blurb: 'No stick drift by design, and the paddles are actually reachable.' }
];

/* --- Esports -------------------------------------------------------------- */
FG_DATA.esports = {
  tournaments: [
    { id: 't1', name: 'Voltage World Series 2026', game: 'Voltage Arena', prize: '$4,200,000', location: 'Berlin, Germany', dates: 'Oct 12 – Nov 2', teams: 16, status: 'Upcoming' },
    { id: 't2', name: 'Ashfall Extraction Open', game: 'Ashfall Protocol', prize: '$850,000', location: 'Seoul, South Korea', dates: 'Sep 25 – Sep 29', teams: 24, status: 'Upcoming' },
    { id: 't3', name: 'Ironhold Asynchronous Championship', game: 'Ironhold Tactics', prize: '$500,000', location: 'Online + Warsaw finals', dates: 'Jun 1 – Dec 14', teams: 128, status: 'Live' },
    { id: 't4', name: 'Apex Circuit Pro League', game: 'Apex Circuit 26', prize: '$1,100,000', location: 'Monza, Italy', dates: 'Aug 3 – Sep 14', teams: 12, status: 'Finished' }
  ],
  teams: [
    { id: 'tm1', name: 'Static Vanguard', region: 'EU', titles: 6, roster: 5, form: 'W W W L W' },
    { id: 'tm2', name: 'Kasumi Royals', region: 'APAC', titles: 4, roster: 5, form: 'W L W W W' },
    { id: 'tm3', name: 'Ironwake', region: 'NA', titles: 3, roster: 5, form: 'L W W L W' },
    { id: 'tm4', name: 'Cinder Collective', region: 'EU', titles: 2, roster: 5, form: 'W W L L W' },
    { id: 'tm5', name: 'Southern Cross', region: 'SA', titles: 1, roster: 5, form: 'W L L W W' },
    { id: 'tm6', name: 'Meridian Nine', region: 'APAC', titles: 5, roster: 5, form: 'W W W W L' }
  ],
  players: [
    { id: 'p1', handle: 'nullframe', name: 'Elena Duarte', team: 'Static Vanguard', role: 'Entry', rating: 1.34 },
    { id: 'p2', handle: 'kohaku', name: 'Riku Sano', team: 'Kasumi Royals', role: 'Support', rating: 1.21 },
    { id: 'p3', handle: 'wraithe', name: 'Tobi Adeyemi', team: 'Ironwake', role: 'Sniper', rating: 1.28 },
    { id: 'p4', handle: 'cindra', name: 'Lena Vogt', team: 'Cinder Collective', role: 'Anchor', rating: 1.19 },
    { id: 'p5', handle: 'austral', name: 'Diego Rossi', team: 'Southern Cross', role: 'Flex', rating: 1.25 },
    { id: 'p6', handle: 'meridian', name: 'Jae-won Park', team: 'Meridian Nine', role: 'IGL', rating: 1.30 }
  ],
  matches: [
    { id: 'm1', home: 'Static Vanguard', away: 'Kasumi Royals', score: '2 – 1', event: 'Voltage World Series', when: 'Finished · Sep 16', status: 'finished' },
    { id: 'm2', home: 'Ironwake', away: 'Cinder Collective', score: '0 – 2', event: 'Voltage World Series', when: 'Finished · Sep 15', status: 'finished' },
    { id: 'm3', home: 'Meridian Nine', away: 'Southern Cross', score: 'LIVE', event: 'Ashfall Extraction Open', when: 'Map 2 · 8–6', status: 'live' },
    { id: 'm4', home: 'Kasumi Royals', away: 'Ironwake', score: 'vs', event: 'Voltage World Series', when: 'Sep 21 · 18:00 CET', status: 'upcoming' },
    { id: 'm5', home: 'Cinder Collective', away: 'Meridian Nine', score: 'vs', event: 'Ashfall Extraction Open', when: 'Sep 22 · 20:30 CET', status: 'upcoming' },
    { id: 'm6', home: 'Static Vanguard', away: 'Southern Cross', score: 'vs', event: 'Voltage World Series', when: 'Sep 23 · 17:00 CET', status: 'upcoming' }
  ]
};

/* --- Community ------------------------------------------------------------ */
FG_DATA.community = {
  threads: [
    { id: 'c1', title: 'Kingdom of Glass: who did you actually manage to keep alive?', author: 'runeleaf', avatar: 'u1', board: 'RPG', replies: 342, likes: 1284, last: '12 minutes ago', pinned: true,
      preview: 'Four playthroughs in and I have never saved the cartographer. Post your survivor lists, no spoiler tags needed past act two.' },
    { id: 'c2', title: 'Ashfall Protocol solo extraction tips thread', author: 'grimsight', avatar: 'u2', board: 'FPS', replies: 218, likes: 903, last: '38 minutes ago',
      preview: 'Storm timing is everything. Leave by the second warning, not the third, and never route through the refinery after dark.' },
    { id: 'c3', title: 'Show your rune builds — Veil of Cinders', author: 'emberkit', avatar: 'u3', board: 'RPG', replies: 487, likes: 2110, last: '1 hour ago', pinned: true,
      preview: 'Built a shield that explodes when it breaks. It is not efficient but it is extremely funny in the arena.' },
    { id: 'c4', title: 'Best 27-inch OLED for a 1440p build right now?', author: 'pixelmoth', avatar: 'u4', board: 'Hardware', replies: 96, likes: 341, last: '2 hours ago',
      preview: 'Coming from a 144Hz IPS. Is the jump to OLED worth the burn-in anxiety if the monitor is also my work screen?' },
    { id: 'c5', title: 'Hollow Signal made me turn the lights on. Twice.', author: 'nightferry', avatar: 'u5', board: 'Horror', replies: 154, likes: 720, last: '3 hours ago',
      preview: 'No combat, no HUD, and somehow the tensest four hours I have played this year. The breathing mechanic is unfair.' },
    { id: 'c6', title: 'Voltage Arena ranked is in a genuinely good state', author: 'clockout', avatar: 'u6', board: 'Esports', replies: 265, likes: 1102, last: '5 hours ago',
      preview: 'Transparent MMR changed the whole experience. You can see exactly why you gained or lost, which kills most of the tilt.' },
    { id: 'c7', title: 'Anyone else playing Harbor Lights as a bedtime game?', author: 'salttide', avatar: 'u7', board: 'Indie', replies: 73, likes: 512, last: '8 hours ago',
      preview: 'One ferry route per night, then sleep. It is the only game I have finished this year and I think that is the point.' },
    { id: 'c8', title: 'Apex Circuit 26 wheel settings that actually feel right', author: 'apexline', avatar: 'u8', board: 'Racing', replies: 188, likes: 664, last: '11 hours ago',
      preview: 'Drop the default force feedback to 62% and raise the tyre slip channel. Everything else is usable out of the box.' }
  ],
  trending: ['Kingdom of Glass endings', 'Ashfall storm routes', 'OLED vs IPS 2026', 'Voltage World Series', 'Rune crafting builds', 'Switch port wishlist', 'No-crunch policies'],
  members: [
    { handle: 'runeleaf', avatar: 'u1', posts: 1420, badge: 'Moderator' },
    { handle: 'emberkit', avatar: 'u3', posts: 1187, badge: 'Top contributor' },
    { handle: 'grimsight', avatar: 'u2', posts: 964, badge: 'Veteran' },
    { handle: 'clockout', avatar: 'u6', posts: 802, badge: 'Esports lead' },
    { handle: 'nightferry', avatar: 'u5', posts: 651, badge: 'Horror board' }
  ]
};

/* --- Admin demo users ----------------------------------------------------- */
FG_DATA.users = [
  { id: 'u1', username: 'runeleaf',  email: 'runeleaf@forza.demo',  role: 'Moderator', joined: '2024-02-11', status: 'Active' },
  { id: 'u2', username: 'grimsight', email: 'grimsight@forza.demo', role: 'Member',    joined: '2024-06-03', status: 'Active' },
  { id: 'u3', username: 'emberkit',  email: 'emberkit@forza.demo',  role: 'Editor',    joined: '2023-11-27', status: 'Active' },
  { id: 'u4', username: 'pixelmoth', email: 'pixelmoth@forza.demo', role: 'Member',    joined: '2025-01-19', status: 'Suspended' },
  { id: 'u5', username: 'nightferry',email: 'nightferry@forza.demo',role: 'Member',    joined: '2025-04-08', status: 'Active' },
  { id: 'u6', username: 'clockout',  email: 'clockout@forza.demo',  role: 'Editor',    joined: '2023-08-14', status: 'Active' },
  { id: 'u7', username: 'salttide',  email: 'salttide@forza.demo',  role: 'Member',    joined: '2025-09-30', status: 'Pending' },
  { id: 'u8', username: 'apexline',  email: 'apexline@forza.demo',  role: 'Member',    joined: '2026-01-22', status: 'Active' }
];

/* --- Derived image fields -------------------------------------------------
   Attaching images here keeps the records above readable.
   -------------------------------------------------------------------------- */
FG_DATA.games.forEach(function (g, i) {
  g.cover = img(g.id, 800, 500);
  g.poster = img(g.id + '-p', 600, 800);
  g.banner = img(g.id + '-b', 1600, 900);
  g.shots = [img(g.id + '-s1', 800, 500), img(g.id + '-s2', 800, 500), img(g.id + '-s3', 800, 500), img(g.id + '-s4', 800, 500)];
  g.views = 12000 + i * 3137;
  g.requirements = {
    min: { os: 'Windows 10 64-bit', cpu: 'Intel Core i5-9400 / Ryzen 5 3600', ram: '12 GB', gpu: 'GTX 1660 6GB / RX 5600 XT', storage: '60 GB SSD' },
    rec: { os: 'Windows 11 64-bit', cpu: 'Intel Core i7-12700K / Ryzen 7 7700X', ram: '16 GB', gpu: 'RTX 4070 / RX 7800 XT', storage: '60 GB NVMe SSD' }
  };
});

FG_DATA.news.forEach(function (n) { n.image = img(n.id + '-news', 800, 500); });
FG_DATA.hardware.forEach(function (h) { h.image = img(h.id + '-hw', 800, 500); });
FG_DATA.esports.tournaments.forEach(function (t) { t.image = img(t.id + '-esp', 800, 500); });
FG_DATA.community.threads.forEach(function (t) { t.avatarUrl = img(t.avatar + '-av', 120, 120); });
FG_DATA.community.members.forEach(function (m) { m.avatarUrl = img(m.avatar + '-av', 120, 120); });
FG_DATA.reviews.forEach(function (r) {
  const g = FG_DATA.games.find(function (x) { return x.id === r.gameId; });
  r.title = g ? g.title : r.gameId;
  r.image = g ? g.cover : '';
  r.released = g ? g.released : '';
});
