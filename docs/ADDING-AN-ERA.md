# Era contract

Every era room follows the same contract so rooms can be built in parallel and checked automatically.
`app/eras/01-bbs/` is the reference implementation; copy its shape.

## Files

```
app/eras/NN-slug/
├─ demo.html        # the period page, as an HTML fragment (required)
├─ era.css          # styles, all scoped under [data-era="NN"] (required)
├─ timebar.css      # the era's skin for the global time bar (required)
├─ meta.ts          # title, years, context, traits, snippets, sources (required)
└─ era.client.ts    # optional behaviour, runs after the page mounts
```

Nested rooms (like `01-bbs/pre-web/`) have `demo.html`, `era.css`, `meta.ts` (typed `RoomMeta`) and an
optional `era.client.ts`; they reuse their parent era's `timebar.css`. Demos that need their own document
(framesets, a CSS sandbox) live in `public/demos/<name>/index.html` and are embedded with a same-origin iframe.

## demo.html

- A fragment: no `<html>`, `<head>`, `<body>` or `<script>`. It is rendered byte for byte inside
  `<main class="era" data-era="NN">`, so period markup (`<font>`, `<center>`, `<table>`, `bgcolor`) survives.
- One invented brand per era with a period-plausible name. No real companies, logos, people, screenshots or
  copyrighted characters.
- At least: a header/nav, a content section, one interactive element, and a footer typical of the era.
- All imagery is drawn in the repo: inline SVG, CSS, or hand-made pixel art as SVG. No external URLs.
- Mark every signature trait with `data-trait="<id>"` (space-separated for several). Every trait id in `meta.ts`
  must appear in the demo.
- Must make sense with JavaScript disabled; play toggles may degrade.
- Use `<h1>`/`<h2>` sensibly; the room is the page's main content. Images need `alt` (decorative: `alt=""` or
  `aria-hidden="true"` on SVG).
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
- Do not style `.timebar`, `.curator`, `html` or `body`.
- `main.era` already reserves space for the 60 px time bar. Set the era's background on `[data-era="NN"]` itself.
- No page-level horizontal overflow at 390 px wide. If the era is about fixed widths, put the fixed-width page in
  an inner scroll container.
- Fonts: system font stacks only (no font files).
- CSS snippet markers: `/* snippet:<region>:start */` on its own line.

## timebar.css

Restyle the time bar to belong to the era, only via `html[data-era-page="NN"] .timebar…` selectors. Prefer setting
the tokens: `--tb-bg --tb-fg --tb-muted --tb-accent --tb-accent-fg --tb-font --tb-notch --tb-btn-bg
--tb-btn-border --tb-btn-radius --tb-shadow --tb-radius`. Markup and behaviour never change. Labels and the focus
ring must keep WCAG AA contrast (4.5:1 for text) against the bar.

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

See `app/eras/types.ts` (`EraMeta`). `id` = `NN`, `slug` = folder name. Two to four snippets, three to eight
traits, two to five sources (real, stable URLs: Wikipedia, W3C, MDN, Web Design Museum, A List Apart, etc.).

## Checking your work

```
node scripts/preview-eras.mjs NN-slug --shots
```

writes standalone previews to `.preview/`, lints the contract, and saves desktop and mobile screenshots to
`.preview/shots/`. Fix every reported problem, then look at the screenshots.
