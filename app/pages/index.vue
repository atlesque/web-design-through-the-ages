<script setup lang="ts">
import { eras, eraPath } from '~/composables/useEras'
import { useStageController } from '~/lib/stage'

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
  // Without JavaScript there is nothing to load: show the button straight away.
  noscript: [{ innerHTML: '<style>.title__load{display:none}.title__start{visibility:visible}</style>' }],
})

// Tiles that get a bigger cell in the bento grid.
const wide = new Set(['01', '05', '09', '13', '17'])
const first = eraPath(eras[0]!)

/**
 * The lobby is a title screen. It loads the first room and the stage, then
 * waits for the visitor to press Start; the screen then pulls back into the
 * first era's monitor (a view transition into the stage layout).
 */
const phase = ref<'loading' | 'ready' | 'starting'>('loading')
const pct = ref(0)
const startEl = ref<HTMLAnchorElement | null>(null)
const titleEl = ref<HTMLElement | null>(null)
const nuxtApp = useNuxtApp()
const booting = useState('stage-booting', () => false)

const still = () => {
  let readable = false
  try {
    readable = localStorage.getItem('wdta-readable') === '1'
  } catch {
    /* ignore */
  }
  return readable || matchMedia('(prefers-reduced-motion: reduce)').matches
}

onMounted(async () => {
  let seen = false
  try {
    seen = sessionStorage.getItem('wdta-loaded') === '1'
  } catch {
    /* ignore */
  }
  const jobs: Promise<unknown>[] = [
    document.fonts?.ready ?? Promise.resolve(),
    preloadRouteComponents(first),
    loadPayload(first).catch(() => undefined),
    // Long enough for the bar to read as a loading screen, not a flicker.
    new Promise((r) => setTimeout(r, seen || still() ? 250 : 1100)),
  ]
  let done = 0
  const t0 = performance.now()
  const minMs = seen || still() ? 250 : 1100
  jobs.forEach((j) => j.finally(() => done++))
  await new Promise<void>((resolve) => {
    const tick = () => {
      // The bar follows the real jobs, eased so it never jumps backwards.
      const target = Math.min((done / jobs.length) * 100, ((performance.now() - t0) / minMs) * 100)
      pct.value = Math.round(pct.value + (target - pct.value) * 0.25)
      if (done === jobs.length && pct.value >= 99) {
        pct.value = 100
        resolve()
      } else requestAnimationFrame(tick)
    }
    tick()
  })
  try {
    sessionStorage.setItem('wdta-loaded', '1')
  } catch {
    /* ignore */
  }
  phase.value = 'ready'
  await nextTick()
  if (document.activeElement === document.body) startEl.value?.focus({ preventScroll: true })
})

async function start(e: MouseEvent) {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
  e.preventDefault()
  if (phase.value === 'starting') return
  if (!document.startViewTransition || still()) {
    await navigateTo(first)
    return
  }
  phase.value = 'starting'
  const root = document.documentElement
  const arrived = new Promise<void>((resolve) => {
    nuxtApp.hooks.hookOnce('page:finish', () => resolve())
    setTimeout(resolve, 4000)
  })
  titleEl.value!.style.viewTransitionName = 'era-screen'
  root.classList.add('is-intro')
  const vt = document.startViewTransition(async () => {
    booting.value = true
    await navigateTo(first)
    await arrived
    await nextTick()
    // Pull the camera back from inside the screen: the room starts scaled up
    // around the monitor's screen so the screen fills the viewport.
    const screen = document.querySelector('.stage .rig__screen')?.getBoundingClientRect()
    if (screen?.width) {
      const s = Math.max(innerWidth / screen.width, innerHeight / screen.height)
      const cx = screen.left + screen.width / 2
      const cy = screen.top + screen.height / 2
      root.style.setProperty('--intro-o', `${cx}px ${cy}px`)
      root.style.setProperty('--intro-t', `translate(${innerWidth / 2 - cx}px, ${innerHeight / 2 - cy}px) scale(${s})`)
    }
  })
  await vt.finished.catch(() => undefined)
  root.classList.remove('is-intro')
  root.style.removeProperty('--intro-o')
  root.style.removeProperty('--intro-t')
  await useStageController()?.boot()
}
</script>

<template>
  <div class="lobby" :data-phase="phase">
    <section ref="titleEl" class="title" aria-labelledby="title-h">
      <div class="title__inner">
        <p class="title__kicker">1978 → 2026 · 17 eras · one timeline</p>
        <h1 id="title-h" class="title__h">
          Web design<br />
          <span>through the ages</span>
        </h1>
        <p class="title__lead">
          A museum of the web, one room per era. Every room is a working page built with the tools of its time.
        </p>
        <div class="title__actions">
          <div
            class="title__load"
            role="progressbar"
            aria-label="Loading the museum"
            aria-valuemin="0"
            aria-valuemax="100"
            :aria-valuenow="pct"
            :aria-hidden="phase !== 'loading'"
          >
            <span class="title__bar"><i :style="{ transform: `scaleX(${pct / 100})` }" /></span>
            <span class="title__pct" aria-hidden="true">Loading the museum… {{ pct }}%</span>
          </div>
          <a ref="startEl" class="title__start" :href="first" :tabindex="phase === 'loading' ? -1 : undefined" @click="start">
            Start exploring <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
      <p class="title__more">
        <a href="#eras">Or jump to an era</a>
        <a href="/about/">How this was made</a>
      </p>
    </section>

    <main id="eras" class="lobby__index">
      <h2 class="lobby__h">All eras</h2>
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
      <footer class="landing__foot">
        <p>
          Built as a static Nuxt site, hosted on Cloudflare Pages. Code MIT, words CC BY 4.0.
          <a href="/about/">About &amp; sources</a>.
        </p>
      </footer>
    </main>
  </div>
</template>

<style>
@layer shell {
  .lobby {
    background: #07070a;
    color: #eeece6;
    font: 16px/1.55 var(--shell-font);
  }
  .lobby a {
    color: inherit;
  }
  .lobby :focus-visible {
    outline: 3px solid #fb923c;
    outline-offset: 3px;
  }

  /* ---------- The title screen: a dark tube, ready to switch on ---------- */
  .title {
    position: relative;
    min-height: 100dvh;
    display: grid;
    grid-template-rows: 1fr auto;
    padding: clamp(24px, 5vw, 64px) clamp(16px, 5vw, 64px) 24px;
    box-sizing: border-box;
    overflow: hidden;
    background: radial-gradient(ellipse 80% 70% at 50% 45%, #15151c, #07070a 75%);
    isolation: isolate;
  }
  .title::after {
    /* scanlines and a vignette, like the glass it is about to become */
    content: '';
    position: absolute;
    inset: 0;
    z-index: -1;
    pointer-events: none;
    background:
      repeating-linear-gradient(to bottom, transparent 0 2px, rgb(0 0 0 / 0.28) 2px 3px),
      radial-gradient(ellipse 75% 70% at 50% 50%, transparent 55%, rgb(0 0 0 / 0.6));
  }
  .title__inner {
    align-self: center;
    width: min(100%, 980px);
    margin: 0 auto;
  }
  .title__kicker {
    font: 600 13px/1.3 var(--shell-mono);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #fb923c;
    margin: 0 0 16px;
  }
  .title__h {
    font-size: clamp(48px, 11vw, 148px);
    line-height: 0.9;
    letter-spacing: -0.045em;
    margin: 0 0 24px;
    font-weight: 800;
    text-shadow: 0 0 28px rgb(255 255 255 / 0.12);
  }
  .title__h span {
    font-weight: 300;
    font-style: italic;
  }
  .title__lead {
    max-width: 560px;
    font-size: clamp(17px, 2vw, 20px);
    color: #a3a3ad;
    margin: 0 0 40px;
  }
  .title__actions {
    display: grid;
    min-height: 64px;
    align-items: center;
  }
  .title__actions > * {
    grid-area: 1 / 1;
  }
  .title__load {
    display: grid;
    gap: 10px;
    max-width: 360px;
    transition: opacity 300ms;
  }
  .title__bar {
    display: block;
    height: 4px;
    border-radius: 2px;
    background: rgb(255 255 255 / 0.12);
    overflow: hidden;
  }
  .title__bar i {
    display: block;
    height: 100%;
    background: #fb923c;
    transform-origin: left;
    box-shadow: 0 0 12px #fb923c;
  }
  .title__pct {
    font: 13px/1 var(--shell-mono);
    color: #a3a3ad;
    font-variant-numeric: tabular-nums;
  }
  .title__start {
    justify-self: start;
    visibility: hidden;
    padding: 18px 30px;
    background: #eeece6;
    color: #07070a !important;
    text-decoration: none;
    font-weight: 700;
    font-size: 18px;
    border-radius: 999px;
    box-shadow: 0 0 0 0 rgb(251 146 60 / 0.5);
    transition:
      transform 160ms ease,
      background 160ms ease;
  }
  .title__start:hover {
    background: #fff;
    transform: translateY(-2px);
  }
  .title__start:active {
    transform: translateY(1px);
  }
  .lobby:not([data-phase='loading']) .title__load {
    opacity: 0;
    visibility: hidden;
  }
  .lobby:not([data-phase='loading']) .title__start {
    visibility: visible;
    animation:
      title-start-in 500ms cubic-bezier(0.2, 0.8, 0.2, 1) both,
      title-start-glow 2.4s ease-in-out 600ms infinite;
  }
  @keyframes title-start-in {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
  }
  @keyframes title-start-glow {
    50% {
      box-shadow: 0 0 0 10px rgb(251 146 60 / 0);
    }
    0%,
    100% {
      box-shadow: 0 0 0 0 rgb(251 146 60 / 0.45);
    }
  }
  .title__more {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 24px;
    width: min(100%, 980px);
    margin: 32px auto 0;
    font-size: 14px;
    color: #a3a3ad;
  }

  /* ---------- Index of all eras, below the title screen ---------- */
  .lobby__index {
    padding: clamp(32px, 6vw, 72px) clamp(16px, 4vw, 48px);
    background: var(--shell-paper);
    color: var(--shell-ink);
  }
  .lobby__index :focus-visible {
    outline-color: var(--shell-accent);
  }
  .lobby__h {
    max-width: 1200px;
    margin: 0 auto 20px;
    font-size: 28px;
    letter-spacing: -0.02em;
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
