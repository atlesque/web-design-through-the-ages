<script setup lang="ts">
import { eras, eraPath } from '~/composables/useEras'

useHead({
  title: 'Web Design Through the Ages',
  htmlAttrs: { 'data-era-page': 'index' },
  link: [{ rel: 'canonical', href: 'https://webdesign.atlesque.dev/' }],
  meta: [
    {
      name: 'description',
      content:
        'A walkable museum of web design: 17 eras from BBS ANSI art to bento grids, each rebuilt as a working page in its own period HTML and CSS.',
    },
    { property: 'og:title', content: 'Web Design Through the Ages' },
    { property: 'og:image', content: 'https://webdesign.atlesque.dev/og.png' },
  ],
})

// Tiles that get a bigger cell in the bento grid.
const wide = new Set(['01', '05', '09', '13', '17'])
</script>

<template>
  <div class="landing">
    <BootSequence />

    <header class="landing__hero">
      <p class="landing__kicker">1978 → 2026 · 17 eras · one timeline</p>
      <h1 class="landing__title">
        Web design<br />
        <span>through the ages</span>
      </h1>
      <p class="landing__lead">
        Every room in this museum is a working page built with the tools of its time: ANSI escape art, table layouts,
        spacer GIFs, gloss, flat colour, glass and grids. Walk through them in order, or jump to any era.
      </p>
      <p class="landing__actions">
        <a class="landing__start" :href="eraPath(eras[0]!)">Start at the beginning →</a>
        <a class="landing__about" href="/about/">How this was made</a>
      </p>
    </header>

    <main id="main">
      <h2 class="sr-only">All eras</h2>
      <ol class="bento">
        <li v-for="era in eras" :key="era.slug" class="bento__tile" :class="[`tile-${era.id}`, { 'is-wide': wide.has(era.id) }]">
          <a :href="eraPath(era)">
            <span class="bento__num">{{ era.id }}</span>
            <span class="bento__years">{{ era.years }}</span>
            <span class="bento__title">{{ era.title }}</span>
            <span class="bento__summary">{{ era.summary }}</span>
          </a>
        </li>
      </ol>
    </main>

    <footer class="landing__foot">
      <p>
        Built as a static Nuxt site, hosted on Cloudflare Pages. Code MIT, words CC BY 4.0.
        <a href="/about/">About &amp; sources</a>.
      </p>
    </footer>
  </div>
</template>

<style>
@layer shell {
  .landing {
    min-height: 100dvh;
    background: var(--shell-paper);
    color: var(--shell-ink);
    font: 16px/1.55 var(--shell-font);
    padding: clamp(24px, 5vw, 64px) clamp(16px, 4vw, 48px);
    box-sizing: border-box;
  }
  .landing a {
    color: inherit;
  }
  .landing :focus-visible {
    outline: 3px solid var(--shell-accent);
    outline-offset: 3px;
  }
  .landing__hero {
    max-width: 1200px;
    margin: 0 auto clamp(32px, 6vw, 72px);
  }
  .landing__kicker {
    font: 600 13px/1.3 var(--shell-mono);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--shell-accent);
    margin: 0 0 12px;
  }
  .landing__title {
    font-size: clamp(48px, 10vw, 136px);
    line-height: 0.9;
    letter-spacing: -0.045em;
    margin: 0 0 24px;
    font-weight: 800;
  }
  .landing__title span {
    font-weight: 300;
    font-style: italic;
  }
  .landing__lead {
    max-width: 640px;
    font-size: clamp(17px, 2vw, 20px);
    color: var(--shell-muted);
    margin: 0 0 24px;
  }
  .landing__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 12px 24px;
    align-items: center;
    margin: 0;
  }
  .landing__start {
    display: inline-block;
    padding: 14px 22px;
    background: var(--shell-ink);
    color: var(--shell-paper) !important;
    text-decoration: none;
    font-weight: 700;
    border-radius: 999px;
  }
  .bento {
    list-style: none;
    margin: 0 auto;
    padding: 0;
    max-width: 1200px;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 260px), 1fr));
    grid-auto-flow: dense;
    gap: 14px;
  }
  .bento__tile {
    container-type: inline-size;
    border-radius: 18px;
    overflow: hidden;
    min-height: 200px;
  }
  @media (min-width: 840px) {
    .bento__tile.is-wide {
      grid-column: span 2;
    }
  }
  .bento__tile a {
    display: grid;
    align-content: start;
    gap: 6px;
    height: 100%;
    padding: 20px;
    box-sizing: border-box;
    text-decoration: none;
    transition: transform 160ms ease;
  }
  .bento__tile a:hover {
    transform: translateY(-3px);
  }
  .bento__num {
    font: 700 13px/1 var(--shell-mono);
  }
  .bento__years {
    font: 600 13px/1 var(--shell-mono);
  }
  .bento__title {
    font-size: 22px;
    line-height: 1.15;
    font-weight: 700;
    margin-top: auto;
    padding-top: 40px;
  }
  .bento__summary {
    font-size: 14px;
    line-height: 1.45;
  }
  @supports (animation-timeline: view()) {
    @media (prefers-reduced-motion: no-preference) {
      .bento__tile {
        animation: landing-rise linear both;
        animation-timeline: view();
        animation-range: entry 0% entry 60%;
      }
    }
  }
  @keyframes landing-rise {
    from {
      opacity: 0;
      transform: translateY(40px) scale(0.97);
    }
  }

  /* Each tile is a postage stamp of its era. */
  .tile-01 a { background: #000; color: #55ff55; font-family: var(--shell-mono); }
  .tile-01 .bento__title { color: #ffff55; }
  .tile-02 a { background: #c0c0c0; color: #000; font-family: 'Times New Roman', Times, serif; }
  .tile-02 .bento__title { color: #0000aa; text-decoration: underline; font-weight: 400; }
  .tile-03 a {
    background: #000080 radial-gradient(#ffff00 1px, transparent 1.5px) 0 0 / 14px 14px;
    color: #fff; font-family: 'Comic Sans MS', 'Comic Neue', cursive;
  }
  .tile-03 .bento__title { color: #ff00ff; text-shadow: 2px 2px #00ffff; }
  .tile-04 a { background: #fff; color: #000; font-family: Verdana, Geneva, sans-serif; border: 1px solid #999; }
  .tile-04 .bento__years { background: #336699; color: #fff; padding: 4px 6px; justify-self: start; }
  .tile-05 a { background: radial-gradient(circle at 70% 30%, #39306b, #0b0a14 70%); color: #d8d8ff; font-family: 'Courier New', monospace; }
  .tile-05 .bento__title { letter-spacing: 0.3em; text-transform: uppercase; font-size: 18px; }
  .tile-06 a { background: linear-gradient(160deg, #e8edf5, #8ea2c0 45%, #fdfeff 55%, #6b7f9e); color: #10213d; }
  .tile-06 .bento__title { font-style: italic; letter-spacing: 0.05em; }
  .tile-07 a { background: #fafaf7; color: #333; font-family: Georgia, serif; border-top: 8px solid #7a9a3a; }
  .tile-08 a { background: #eef3fb; color: #1d3c78; font-family: Tahoma, Verdana, sans-serif; border: 2px solid #5b84c4; }
  .tile-09 a { background: linear-gradient(#f2fbe5, #c8eb8f); color: #2e5506; font-family: 'Lucida Grande', 'Trebuchet MS', sans-serif; }
  .tile-09 .bento__years { background: linear-gradient(#e0560f, #b23a07); color: #fff; padding: 3px 8px; border-radius: 999px; justify-self: start; font-size: 11px; }
  .tile-10 a { background: #5c3d24 repeating-linear-gradient(90deg, rgb(255 255 255 / 0.04) 0 2px, transparent 2px 6px); color: #f6e7c8; font-family: Georgia, serif; outline: 2px dashed #c9a46b; outline-offset: -10px; }
  .tile-11 a { background: #fff; color: #333; border: 1px solid #ddd; background-image: repeating-linear-gradient(90deg, rgb(13 110 253 / 0.06) 0 calc(100% / 12 - 6px), transparent 0 calc(100% / 12)); }
  .tile-12 a { background: #117a65; color: #fff; font-family: 'Segoe UI', 'Open Sans', sans-serif; }
  .tile-12 .bento__title { font-weight: 300; font-size: 26px; }
  .tile-13 a { background: linear-gradient(#0f2027, #2c5364); color: #fff; }
  .tile-14 a { background: #fff; color: #212121; box-shadow: inset 0 0 0 1px #e0e0e0; font-family: Roboto, Arial, sans-serif; }
  .tile-14 .bento__num { justify-self: start; display: grid; place-items: center; width: 36px; height: 36px; border-radius: 50%; background: #c2185b; color: #fff; }
  .tile-15 a { background: #ffde59; color: #000; border: 3px solid #000; box-shadow: 6px 6px 0 #000; font-family: 'Arial Black', Arial, sans-serif; }
  .bento__tile.tile-15 { overflow: visible; border-radius: 0; }
  .tile-15 a:hover { transform: translate(-2px, -2px); }
  .tile-16 a { background: linear-gradient(135deg, #5b3cc4, #1d6f50 60%, #a83b62); color: #fff; }
  .tile-16 .bento__summary { background: rgb(0 0 0 / 0.22); backdrop-filter: blur(10px); border-radius: 10px; padding: 8px 10px; }
  .tile-17 a { background: #101014; color: #f5f3ee; border: 1px solid #2c2c34; }
  .tile-17 .bento__title { font-size: clamp(22px, 8cqi, 44px); letter-spacing: -0.03em; }

  .landing__foot {
    max-width: 1200px;
    margin: 64px auto 0;
    font-size: 14px;
    color: var(--shell-muted);
  }
}
</style>
