# Web Design Through the Ages

An interactive, static museum of web design history: from BBS ANSI art and 1990s hypertext to Flash, Web 2.0
gloss, flat, glassmorphism and today's bento grids. Each era is rebuilt as a working page in its own period
HTML/CSS.

**Live:** https://webdesign.atlesque.dev

## The eras

| # | Era | Years |
| --- | --- | --- |
| 01 | BBS, terminals & pre-web systems (+ Teletext, Minitel, Gopher room) | 1978–1995 |
| 02 | Early hypertext | 1991–1995 |
| 03 | Personal homepages | 1995–2000 |
| 04 | Table layouts & portals | 1996–2003 |
| 05 | Flash & splash intros | 1997–2009 |
| 06 | Y2K chrome & futurism | 1998–2003 |
| 07 | Web standards & CSS layouts | 2001–2007 |
| 08 | Blogs & MySpace | 2003–2008 |
| 09 | Web 2.0 gloss | 2005–2009 |
| 10 | Skeuomorphism & texture | 2007–2013 |
| 11 | Responsive & grid frameworks | 2010–2015 |
| 12 | Flat & Metro | 2012–2016 |
| 13 | Parallax & one-page storytelling | 2012–2017 |
| 14 | Material Design | 2014–2019 |
| 15 | Brutalism & neubrutalism | 2016–2024 |
| 16 | Gradients, glass & soft UI | 2018–2023 |
| 17 | Bento & scroll-driven (now) | 2023–2026 |

## How it works

- **Nuxt 4 in static mode.** `nuxt generate` prerenders every route; nothing runs on a server.
- **Era rooms** live in `app/eras/NN-slug/`. Each has `demo.html` (period markup, rendered byte for byte, with
  markers for the era stamp and the travel buttons), `era.css` (scoped under `[data-era="NN"]`, in `@layer era`),
  `meta.ts` (curator notes) and an optional `era.client.ts`. See [docs/ADDING-AN-ERA.md](docs/ADDING-AN-ERA.md).
- **The stage** (`app/layouts/stage.vue`, `MonitorRig.vue`, `app/assets/stage.css`) shows each room inside its
  era's hardware, built from CSS 3D boxes: a beige all-in-one, a CRT, a flat LCD, then a phone in a hand
  (`app/lib/monitors.ts`). The room is live inside the screen; era CSS is fitted to it at build time
  (`app/lib/frame.ts`).
- **Travel between eras** stays in the app so the monitor persists (`app/plugins/travel.client.ts`). On the same
  hardware the room morphs into the next with a View Transition; a change of hardware plays a swap scene
  (`app/lib/travel.ts`, Web Animations), reversed when going back. Escape skips; reduced motion and readable
  mode switch instantly. Without JavaScript the travel buttons are plain links.
- **The shell** (`CuratorPanel.vue`, the monitor's hardware buttons, `app/assets/shell.css`) sits in
  `@layer shell` and always wins over era styles. Readable mode and reduced motion override every era.
- **Code snippets** in the curator panel are pulled from marked regions of the real source files and
  highlighted with Shiki at build time; no highlighter ships to the browser.
- **Security headers:** `scripts/postgenerate.mjs` writes `_headers` with a per-page Content-Security-Policy
  that hashes each inline script, plus `sitemap.xml`.

## Develop

```sh
pnpm install
pnpm dev            # http://localhost:3000
pnpm generate       # static build in .output/public (+ _headers, sitemap.xml)
pnpm check:size     # free-tier budgets
pnpm test           # Playwright: every room, no-JS, axe on the shell, keyboard
```

Preview and lint a single room without Nuxt (handy while building eras):

```sh
node scripts/preview-eras.mjs 03-homepages --shots   # writes .preview/ and screenshots
```

The pre-web room's Teletext/Minitel/Gopher markup is generated: edit `scripts/gen-preweb.py` and re-run it.

## Deploy (Cloudflare Pages, free plan)

1. Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to Git → this repository.
2. Framework preset **Nuxt.js**; build command `pnpm generate`; output directory `.output/public`;
   environment variables `NODE_VERSION=22` and `PNPM_VERSION=10` (the v3 build image does not read the pnpm
   version from the lockfile).
3. Production branch `main`. Pull requests get preview URLs.
4. Custom domains → add `webdesign.atlesque.dev`. If `atlesque.dev` is on Cloudflare DNS the CNAME is created
   for you; otherwise add `CNAME webdesign → <project>.pages.dev` at your DNS host.

The site uses no Pages Functions, so the Workers request quota never applies.

## House rules

- Every brand in the demos is invented. No real logos, screenshots or copyrighted characters.
- All imagery is drawn in the repo with CSS or SVG. No external requests, no analytics, no cookies.
- Nothing autoplays sound. Blinking stays under three flashes per second.

## Licence

Code: [MIT](LICENSE). Written content (era copy, curator notes): [CC BY 4.0](LICENSE-CONTENT).
