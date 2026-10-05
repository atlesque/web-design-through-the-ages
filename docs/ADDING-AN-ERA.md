# Era contract

Every era room follows the same contract so rooms can be built in parallel and checked automatically.
`app/eras/01-bbs/` is the reference implementation; copy its shape.

## Files

```
app/eras/NN-slug/
├─ demo.html        # the period page, as an HTML fragment (required)
├─ era.css          # styles, all scoped under [data-era="NN"], incl. the stamp and travel buttons (required)
├─ meta.ts          # title, years, context, traits, snippets, sources, CTA wording (required)
└─ era.client.ts    # optional behaviour, runs after the page mounts
```

Nested rooms (like `01-bbs/pre-web/`) have `demo.html`, `era.css`, `meta.ts` (typed `RoomMeta`) and an
optional `era.client.ts`. Demos that need their own document
(framesets, a CSS sandbox) live in `public/demos/<name>/index.html` and are embedded with a same-origin iframe.

## The stage

Every room is shown inside the era's hardware (`app/lib/monitors.ts`): a beige all-in-one for 01–02, a CRT for
03–07, a flat LCD for 08–13 and a phone for 14–17. The room renders inside the monitor's screen, which is its
own scroll container. There is no header or footer chrome around it: the era and the travel buttons live
inside the room, placed with two markers (see below) and styled in the era's own idiom.

Because the screen is smaller than the window, `era.css` is fitted to it at build time (`app/lib/frame.ts`):
width-only `@media` queries become `@container screen` queries, `vw`/`vh`/`dvh` become `cqw`/`cqh`, and
`scroll(root)` becomes `scroll(nearest)`. Write CSS as if the screen were the browser window. In
`era.client.ts`, scroll listeners belong on `root.closest('.rig__scroll') ?? window`, not on `window`.

## demo.html

- A fragment: no `<html>`, `<head>`, `<body>` or `<script>`. It is rendered byte for byte inside
  `<main class="era" data-era="NN">`, so period markup (`<font>`, `<center>`, `<table>`, `bgcolor`) survives.
- One invented brand per era with a period-plausible name. No real companies, logos, people, screenshots or
  copyrighted characters.
- At least: a header/nav, a content section, one interactive element, and a footer typical of the era.
- All imagery is drawn in the repo: inline SVG, CSS, hand-made pixel art as SVG, or GIFs written by a script in
  `scripts/` and served from `public/demos/<era>/` (with a still for reduced motion). No external URLs.
- Mark every signature trait with `data-trait="<id>"` (space-separated for several). Every trait id in `meta.ts`
  must appear in the demo.
- Must make sense with JavaScript disabled; play toggles may degrade.
- Use `<h1>`/`<h2>` sensibly; the room is the page's main content. Images need `alt` (decorative: `alt=""` or
  `aria-hidden="true"` on SVG).
- Place `<!-- era:stamp -->` where the era's own header would show a date or tagline (top of the page,
  inside the header). It becomes `p.era-stamp` with `.era-stamp__no` ("Era 03/17"), `.era-stamp__years` and
  `.era-stamp__title`.
- Place `<!-- era:cta -->` in the main content, where the era would put its call to action (a hero, an intro,
  the middle of the page): this is how visitors travel. It becomes
  `nav.era-cta > a.era-cta__next + a.era-cta__prev`, each with `.era-cta__label` (the wording from
  `meta.cta`) and `.era-cta__to` (years and title of the destination). The first era's "previous" and the
  last era's "next" lead to the lobby (`/`).
- Never hand-write `.era-stamp`/`.era-cta` markup; the markers keep the links correct.
- Mark a code region for the curator panel with comments on their own lines:
  `<!-- snippet:<region>:start -->` … `<!-- snippet:<region>:end -->`.
- Use a period technique where it still works (tables, floats, `<font>`, `<center>`, `<frameset>` in an iframe).
  Where it is dead (`<blink>`, `<marquee>` behaviour, Flash, `<bgsound>`), recreate the *effect* and list it in
  `meta.recreated`.
- Inline event handler attributes (`onmouseover=…`) are allowed only where they are the period technique (era 04
  rollovers) and must be self-contained one-liners.

## era.css

- Every top-level rule is either `[data-era="NN"] { … }` (use CSS nesting inside it) or `@keyframes eNN-name`.
  Put `@media`/`@container` queries inside the scope block.
- The loader wraps the file in `@layer era`; the shell layer always wins. Never use `!important`.
- Do not style `.stage`, `.rig…`, `.curator`, `html` or `body`.
- Set the era's background on `[data-era="NN"]` itself; it fills the screen.
- Style `.era-stamp` and `.era-cta` like the era would have: a `<font>` date line and a bevelled GIF-style
  button in 1997, a glossy pill in 2007, a raised button in Material. `.era-cta__next` is the primary call to
  action, `.era-cta__prev` the quieter way back. Both need a visible `:focus-visible` style and AA contrast.
- No page-level horizontal overflow at 390 px wide. If the era is about fixed widths, put the fixed-width page in
  an inner scroll container.
- Fonts: system font stacks only (no font files).
- CSS snippet markers: `/* snippet:<region>:start */` on its own line.

## era.client.ts

```ts
export default function setup(root: HTMLElement): void | (() => void) {
  // root is <main class="era" data-era="NN">; return a cleanup function if you add timers or listeners
}
```

- No imports except `import type`. Vanilla DOM only.
- Respect `matchMedia('(prefers-reduced-motion: reduce)')` and `document.documentElement.classList.contains('readable')`.
- Wrap `localStorage` in `try/catch`. Never autoplay sound; Web Audio only after a click.
- If an element captures letter or arrow keys, give it `data-keys="own"` so global shortcuts pause while it
  has focus. TS snippet markers: `// snippet:<region>:start`.

## meta.ts

See `app/eras/types.ts` (`EraMeta`). `id` = `NN`, `slug` = folder name. `cta: { next, prev }` words the
travel buttons in the voice of the era (“ENTER SITE »”, “Get started, it's free!”). Two to four snippets, three to eight
traits, two to five sources (real, stable URLs: Wikipedia, W3C, MDN, Web Design Museum, A List Apart, etc.).

## Checking your work

```
node scripts/preview-eras.mjs NN-slug --shots
```

writes standalone previews to `.preview/` (the room inside its monitor screen), lints the contract, and saves
desktop and mobile screenshots to `.preview/shots/`, paging down the screen (`-s0`, `-s1`, …). Set
`PW_CHROMIUM` to a Chromium binary if Playwright's own isn't installed. Fix every reported problem, then look
at the screenshots.
