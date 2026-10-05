<script setup lang="ts">
import { eras, eraPath } from '~/composables/useEras'

useHead({
  title: 'About · Web Design Through the Ages',
  htmlAttrs: { 'data-era-page': 'about' },
  link: [{ rel: 'canonical', href: 'https://webdesign.atlesque.dev/about/' }],
  meta: [{ name: 'description', content: 'How the web design museum was built, the rules each era follows, and the sources behind it.' }],
})

const sources = computed(() => {
  const seen = new Map<string, string>()
  for (const era of eras) for (const s of era.sources) if (!seen.has(s.url)) seen.set(s.url, s.label)
  return [...seen].map(([url, label]) => ({ url, label }))
})
</script>

<template>
  <div class="about">
    <a class="about__back" href="/">← All eras</a>
    <main id="main">
      <h1>How this museum was made</h1>
      <p class="about__lead">
        Each of the 17 rooms is a real page built with the techniques of its era, not a screenshot. Where a technique
        still works in today's browsers, the room uses it as-is: <code>&lt;font&gt;</code> tags, nested tables, floats,
        <code>&lt;frameset&gt;</code>. Where it is gone for good (Flash, <code>&lt;blink&gt;</code>, MIDI background
        music), the effect is recreated with modern CSS and JavaScript, and the curator panel says so.
      </p>

      <h2>House rules</h2>
      <ul>
        <li>Every brand, person and product in the demos is invented. No real logos, screenshots or trademarks.</li>
        <li>All imagery is drawn with CSS or SVG in the repository. No hotlinked or scraped assets.</li>
        <li>The code you see in the curator panel is the code that runs, pulled from the source files at build time.</li>
        <li>Nothing autoplays sound. Blinking never exceeds three flashes per second.</li>
        <li>No analytics, no cookies, no third-party requests.</li>
        <li>Readable mode (the <strong>Aa</strong> button) raises contrast and turns off motion in every era.</li>
      </ul>

      <h2>Dates are approximate</h2>
      <p>
        Styles never start or stop on a date. The year ranges mark when a look was most common, and they overlap on
        purpose: plenty of table layouts outlived the web standards movement, and Flash intros lingered well into the
        responsive era.
      </p>

      <h2>The eras</h2>
      <ol class="about__eras">
        <li v-for="era in eras" :key="era.slug">
          <a :href="eraPath(era)">{{ era.title }}</a> <span>{{ era.years }}</span>
        </li>
      </ol>

      <h2>Sources</h2>
      <ul class="about__sources">
        <li v-for="s in sources" :key="s.url">
          <a :href="s.url" rel="noopener">{{ s.label }}</a>
        </li>
      </ul>

      <h2>Licence</h2>
      <p>
        Code is released under the MIT licence. Written content is released under Creative Commons Attribution 4.0
        (CC BY 4.0). Built with Nuxt in static mode and hosted on Cloudflare Pages at webdesign.atlesque.dev.
      </p>
    </main>
  </div>
</template>

<style>
@layer shell {
  .about {
    min-height: 100dvh;
    background: var(--shell-paper);
    color: var(--shell-ink);
    font: 17px/1.65 var(--shell-font);
    padding: clamp(24px, 5vw, 64px) clamp(16px, 4vw, 48px);
    box-sizing: border-box;
  }
  .about main {
    max-width: 720px;
    margin: 0 auto;
  }
  .about a {
    color: var(--shell-accent);
  }
  .about :focus-visible {
    outline: 3px solid var(--shell-accent);
    outline-offset: 2px;
  }
  .about__back {
    display: inline-block;
    margin-bottom: 24px;
    font-weight: 600;
  }
  .about h1 {
    font-size: clamp(36px, 6vw, 56px);
    line-height: 1.05;
    letter-spacing: -0.03em;
    margin: 0 0 16px;
  }
  .about h2 {
    margin-top: 40px;
    font-size: 22px;
  }
  .about__lead {
    font-size: 19px;
  }
  .about code {
    font: 0.9em var(--shell-mono);
  }
  .about__eras span {
    color: var(--shell-muted);
    font: 14px var(--shell-mono);
  }
  .about__sources {
    font-size: 15px;
  }
}
</style>
