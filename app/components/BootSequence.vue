<script setup lang="ts">
// The landing page "upgrades" itself through the eras in about 8 seconds.
// Client-only: without JS (or with reduced motion) visitors see the index directly.
const stages = [
  { id: 'bbs', label: 'CONNECT 2400', line: 'WELCOME TO THE WEB DESIGN BBS' },
  { id: 'hypertext', label: '1993', line: 'Web Design Through the Ages' },
  { id: 'geocities', label: '1997', line: '~*~ Web Design Through the Ages ~*~' },
  { id: 'portal', label: '2000', line: 'Web Design Through the Ages' },
  { id: 'flash', label: '2002', line: 'WEB DESIGN THROUGH THE AGES' },
  { id: 'gloss', label: '2007', line: 'Web Design Through the Ages' },
  { id: 'flat', label: '2013', line: 'Web Design Through the Ages' },
  { id: 'glass', label: '2020', line: 'Web Design Through the Ages' },
] as const

const active = ref(false)
const stage = ref(0)
const typed = ref('')
let timers: number[] = []

function finish() {
  timers.forEach((t) => clearTimeout(t))
  timers = []
  active.value = false
  try {
    sessionStorage.setItem('wdta-booted', '1')
  } catch {
    /* ignore */
  }
}

onMounted(() => {
  let seen = false
  try {
    seen = sessionStorage.getItem('wdta-booted') === '1'
  } catch {
    /* ignore */
  }
  if (seen || matchMedia('(prefers-reduced-motion: reduce)').matches) return
  active.value = true

  const first = stages[0].line
  for (let i = 0; i <= first.length; i++) {
    timers.push(window.setTimeout(() => (typed.value = first.slice(0, i)), 40 * i))
  }
  const start = 40 * first.length + 500
  stages.forEach((_, i) => {
    if (i > 0) timers.push(window.setTimeout(() => (stage.value = i), start + (i - 1) * 850))
  })
  timers.push(window.setTimeout(finish, start + (stages.length - 1) * 850 + 600))
})
onBeforeUnmount(() => timers.forEach((t) => clearTimeout(t)))

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') finish()
}
</script>

<template>
  <div
    v-if="active"
    class="boot"
    :data-stage="stages[stage]!.id"
    role="dialog"
    aria-modal="true"
    aria-label="Intro animation"
    @keydown="onKey"
  >
    <div class="boot__screen" aria-hidden="true">
      <span class="boot__label">{{ stages[stage]!.label }}</span>
      <span class="boot__line">{{ stage === 0 ? typed : stages[stage]!.line }}<i v-if="stage === 0" class="boot__cursor">█</i></span>
    </div>
    <button type="button" class="boot__skip" autofocus @click="finish">Skip intro</button>
  </div>
</template>

<style>
@layer shell {
  .boot {
    position: fixed;
    inset: 0;
    z-index: 2000;
    display: grid;
    place-items: center;
    background: #000;
    color: #55ff55;
    transition:
      background 300ms,
      color 300ms;
  }
  .boot__screen {
    display: grid;
    gap: 16px;
    justify-items: center;
    text-align: center;
    padding: 24px;
  }
  .boot__label {
    font: 14px/1 var(--shell-mono);
    opacity: 0.7;
  }
  .boot__line {
    font: clamp(18px, 4vw, 40px) / 1.2 var(--shell-mono);
  }
  .boot__cursor {
    font-style: normal;
    animation: boot-blink 1s steps(1) infinite;
  }
  @keyframes boot-blink {
    50% {
      opacity: 0;
    }
  }
  .boot__skip {
    position: absolute;
    right: 24px;
    bottom: 24px;
    padding: 10px 16px;
    font: 600 14px var(--shell-font);
    background: rgb(255 255 255 / 0.9);
    color: #000;
    border: 2px solid #000;
    border-radius: 6px;
    cursor: pointer;
  }
  .boot[data-stage='hypertext'] {
    background: #c0c0c0;
    color: #000;
  }
  .boot[data-stage='hypertext'] .boot__line {
    font: 700 clamp(28px, 5vw, 48px) / 1.2 'Times New Roman', serif;
    text-align: left;
  }
  .boot[data-stage='geocities'] {
    background: #000080 radial-gradient(#ffff00 1px, transparent 1.5px) 0 0 / 18px 18px;
    color: #ff00ff;
  }
  .boot[data-stage='geocities'] .boot__line {
    font: 700 clamp(26px, 5vw, 48px) / 1.2 'Comic Sans MS', cursive;
    text-shadow: 3px 3px #00ffff;
  }
  .boot[data-stage='portal'] {
    background: #fff;
    color: #fff;
  }
  .boot[data-stage='portal'] .boot__line {
    background: #336699;
    padding: 8px 16px;
    font: 700 clamp(18px, 3vw, 26px) Verdana, sans-serif;
  }
  .boot[data-stage='portal'] .boot__label {
    color: #336699;
  }
  .boot[data-stage='flash'] {
    background: radial-gradient(circle at 50% 40%, #39306b, #05040a 70%);
    color: #d8d8ff;
  }
  .boot[data-stage='flash'] .boot__line {
    letter-spacing: 0.4em;
    font: 400 clamp(16px, 3vw, 28px) / 1.2 'Courier New', monospace;
  }
  .boot[data-stage='gloss'] {
    background: linear-gradient(#ffffff, #e8f6d2);
    color: #2e5506;
  }
  .boot[data-stage='gloss'] .boot__line {
    font: 700 clamp(26px, 5vw, 52px) / 1.1 'Lucida Grande', 'Trebuchet MS', sans-serif;
    padding: 18px 36px;
    border-radius: 999px;
    color: #fff;
    background: linear-gradient(#9be15d 0 50%, #6cbf2b 50%);
    box-shadow: 0 6px 16px rgb(0 0 0 / 0.2);
  }
  .boot[data-stage='flat'] {
    background: #117a65;
    color: #fff;
  }
  .boot[data-stage='flat'] .boot__line {
    font: 300 clamp(30px, 6vw, 64px) / 1.1 'Segoe UI', 'Helvetica Neue', sans-serif;
  }
  .boot[data-stage='glass'] {
    background: linear-gradient(135deg, #7f5af0, #2cb67d 60%, #ff8ba7);
    color: #fff;
  }
  .boot[data-stage='glass'] .boot__screen {
    background: rgb(255 255 255 / 0.16);
    backdrop-filter: blur(14px);
    border: 1px solid rgb(255 255 255 / 0.35);
    border-radius: 24px;
    padding: 36px 48px;
  }
  .boot[data-stage='glass'] .boot__line {
    font: 600 clamp(26px, 5vw, 52px) / 1.1 var(--shell-font);
  }
}
</style>
