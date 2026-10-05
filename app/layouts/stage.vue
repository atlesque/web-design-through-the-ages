<script setup lang="ts">
import type { ComponentPublicInstance } from 'vue'
import { eras, eraPath, findEra, neighbours } from '~/composables/useEras'
import { monitorFor, type MonitorKind } from '~/lib/monitors'
import { Deferred, registerStage, roomPath } from '~/lib/stage'
import {
  CAM_REST,
  POSE_REST,
  makeGeometry,
  phoneHold,
  pickScene,
  pose,
  powerOff,
  powerOn,
  pulledCam,
  settle,
  type Geometry,
  type KindSize,
} from '~/lib/travel'

/**
 * The stage persists while the visitor travels between era rooms: the page
 * (the room) renders inside the monitor's screen, and this layout plays the
 * transition between rooms.
 */
const route = useRoute()
const { curatorOpen, readable, helpOpen, setReadable, restoreReadable } = useShell()

const eraOf = (path: string | null) => findEra((path ?? '').split('/')[0] ?? '')
const kind = ref<MonitorKind>(monitorFor(eraOf(roomPath(route.path))?.id ?? '01'))
const ghostKind = ref<MonitorKind | null>(null)
const cast = ref<'none' | 'carry' | 'phone'>('none')
const busy = ref(false)
const cinematic = ref(false)
const announcement = ref('')
const cm = ref(7)
const hold = computed(() => phoneHold(cm.value))

const stageEl = ref<HTMLElement | null>(null)
const cameraEl = ref<HTMLElement | null>(null)
const probeEl = ref<HTMLElement | null>(null)
const mainRig = ref<ComponentPublicInstance | null>(null)
const ghostRig = ref<ComponentPublicInstance | null>(null)
const heldRig = ref<ComponentPublicInstance | null>(null)
const moverEl = ref<HTMLElement | null>(null)
const moverFrontEl = ref<HTMLElement | null>(null)
const el = (c: ComponentPublicInstance | null) => (c?.$el ?? null) as HTMLElement | null

// ---------------------------------------------------------------------------
// Travel

interface Travel {
  token: number
  proceed: Deferred
  arrived: Deferred
  skip: boolean
  anims: Set<Animation>
  vt?: ViewTransition
}
let travel: Travel | null = null
let tokens = 0

const still = () =>
  matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('readable')

function track(t: Travel, anims: Animation[]) {
  anims.forEach((a) => {
    t.anims.add(a)
    if (t.skip) a.finish()
  })
  return settle(anims)
}

function cancel(t: Travel, anims: Iterable<Animation>) {
  for (const a of Array.from(anims)) {
    a.cancel()
    t.anims.delete(a)
  }
}

/** Stop whatever is playing and put the stage back at rest. */
function reset() {
  const t = travel
  if (!t) return
  t.skip = true
  t.vt?.skipTransition()
  cancel(t, t.anims)
  t.proceed.resolve()
  t.arrived.resolve()
  ghostKind.value = null
  cast.value = 'none'
  clearMorphs()
  travel = null
  busy.value = false
  cinematic.value = false
}

function measure(): Geometry {
  const probe = probeEl.value!
  const cache = new Map<MonitorKind, KindSize>()
  const size = (k: MonitorKind) => {
    if (!cache.has(k)) {
      probe.dataset.kind = k
      cache.set(k, { W: probe.offsetWidth, rigH: probe.offsetHeight })
    }
    return cache.get(k)!
  }
  return makeGeometry(innerWidth, innerHeight, size)
}

// Elements that morph into their counterpart in the next era (same-hardware travel).
const MORPHS: [string, string][] = [
  ['stamp', '.era-stamp'],
  ['prev', '.era-cta__prev'],
  ['next', '.era-cta__next'],
  ['headline', 'h1'],
  ['menu', 'nav:not(.era-cta)'],
  ['footer', 'footer'],
]
let morphed: HTMLElement[] = []

function nameMorphs() {
  const screen = el(mainRig.value)?.querySelector('.rig__screen')
  const room = screen?.querySelector<HTMLElement>('main.era')
  if (!screen || !room) return
  const box = screen.getBoundingClientRect()
  const used = new Set<string>()
  const candidates: [string, HTMLElement | null][] = [
    ...Array.from(room.querySelectorAll<HTMLElement>('[data-morph]')).map((e) => [e.dataset.morph!, e] as [string, HTMLElement]),
    ...MORPHS.map(([name, sel]) => [name, room.querySelector<HTMLElement>(sel)] as [string, HTMLElement | null]),
  ]
  for (const [name, e] of candidates) {
    if (!e || used.has(name) || e.style.viewTransitionName) continue
    const r = e.getBoundingClientRect()
    // Only what is fully on screen: a morph group is drawn above the bezel.
    if (!r.width || r.left < box.left - 1 || r.right > box.right + 1 || r.top < box.top - 1 || r.bottom > box.bottom + 1) continue
    e.style.viewTransitionName = `era-${name}`
    used.add(name)
    morphed.push(e)
  }
}
function clearMorphs() {
  morphed.forEach((e) => (e.style.viewTransitionName = ''))
  morphed = []
  stageEl.value?.classList.remove('is-morphing')
}

function scrollToTop() {
  const s = el(mainRig.value)?.querySelector('.rig__scroll')
  if (s) s.scrollTop = 0
}

async function morph(t: Travel) {
  if (!document.startViewTransition || still()) {
    t.proceed.resolve()
    await t.arrived.promise
    scrollToTop()
    return
  }
  nameMorphs()
  stageEl.value!.classList.add('is-morphing')
  t.vt = document.startViewTransition(async () => {
    clearMorphs()
    stageEl.value?.classList.add('is-morphing')
    t.proceed.resolve()
    await t.arrived.promise
    await nextTick()
    scrollToTop()
    nameMorphs()
  })
  await t.vt.finished.catch(() => undefined)
}

async function swap(t: Travel, from: MonitorKind, to: MonitorKind, dir: 1 | -1) {
  const [kindA, kindB] = dir > 0 ? [from, to] : [to, from]
  const scene = pickScene(kindA, kindB)
  const g = measure()
  cm.value = g.cm
  stageEl.value!.style.setProperty('--cm', `${g.cm}px`)
  cinematic.value = true
  const camera = cameraEl.value!
  const main = el(mainRig.value)!
  const ease = 'cubic-bezier(.65,0,.3,1)'

  const off = powerOff(main, from)
  await track(t, off)
  if (t !== travel) return

  let pulled: Animation[] = []
  if (dir > 0 ? scene.pulledA : scene.pulledB) {
    pulled = [
      camera.animate([{ transform: CAM_REST }, { transform: pulledCam(g, from) }], { duration: 850, easing: ease, fill: 'forwards' }),
      main.animate([{ transform: POSE_REST }, { transform: pose(0, 0, 0, 0, g.k(from)) }], { duration: 850, easing: ease, fill: 'forwards' }),
    ]
    await track(t, pulled)
    if (t !== travel) return
  }

  // The swap: the outgoing device becomes the ghost, the main rig becomes the new one.
  ghostKind.value = from
  cast.value = scene.cast
  kind.value = to
  await nextTick()
  if (t !== travel) return
  const ghost = el(ghostRig.value)!
  const tl = scene.build({
    g,
    kindA,
    kindB,
    deskKind: to,
    A: dir > 0 ? ghost : main,
    B: dir > 0 ? main : ghost,
    camera,
    mover: moverEl.value,
    moverFront: moverFrontEl.value,
    held: el(heldRig.value),
  })
  const scenes = tl.play(dir < 0)
  cancel(t, pulled)
  t.proceed.resolve()
  await Promise.all([track(t, scenes), t.arrived.promise])
  if (t !== travel) return
  scrollToTop()
  // Both scenes end with the outgoing device and the mover out of shot.
  ghostKind.value = null
  cast.value = 'none'
  await nextTick()
  if (t !== travel) return

  if (dir > 0 ? scene.pulledB : scene.pulledA) {
    const push = [
      camera.animate([{ transform: pulledCam(g, to) }, { transform: CAM_REST }], { duration: 850, easing: ease, fill: 'forwards' }),
      main.animate([{ transform: pose(0, 0, 0, 0, g.k(to)) }, { transform: POSE_REST }], { duration: 850, easing: ease, fill: 'forwards' }),
    ]
    cancel(t, scenes)
    await track(t, push)
    if (t !== travel) return
  }

  const on = powerOn(main, to)
  cancel(t, [...t.anims].filter((a) => !on.includes(a)))
  await track(t, on)
  cancel(t, on)
}

function depart(fromPath: string, toPath: string) {
  reset()
  const fromEra = eraOf(fromPath)
  const toEra = eraOf(toPath)
  const t: Travel = { token: ++tokens, proceed: new Deferred(), arrived: new Deferred(), skip: false, anims: new Set() }
  if (!fromEra || !toEra) return Promise.resolve()
  travel = t
  busy.value = true
  const from = kind.value
  const to = monitorFor(toEra.id)
  const dir = eras.indexOf(toEra) < eras.indexOf(fromEra) ? -1 : 1

  const run = async () => {
    if (from === to) await morph(t)
    else if (still()) {
      kind.value = to
      t.proceed.resolve()
      await t.arrived.promise
      scrollToTop()
    } else await swap(t, from, to, dir)
  }
  run()
    .catch((e) => console.error(e))
    .finally(() => {
      if (travel !== t) return
      clearMorphs()
      travel = null
      busy.value = false
      cinematic.value = false
      announcement.value = `${toEra.years}: ${toEra.title}`
      const room = el(mainRig.value)?.querySelector<HTMLElement>('main.era')
      room?.focus({ preventScroll: true })
    })
  return t.proceed.promise
}

function skip() {
  if (!travel) return
  travel.skip = true
  travel.vt?.skipTransition()
  travel.anims.forEach((a) => a.finish())
}

// ---------------------------------------------------------------------------
// Navigation: links, keys

function onClick(e: MouseEvent) {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
  const a = (e.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null
  if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download')) return
  const url = new URL(a.href, location.href)
  if (url.origin !== location.origin || !roomPath(url.pathname)) return
  if (url.pathname === location.pathname) return // in-page anchors
  e.preventDefault()
  navigateTo(url.pathname + url.search + url.hash)
}

const nav = computed(() => neighbours(eraOf(roomPath(route.path))?.slug ?? ''))
function go(index: number) {
  const target = eras[Math.min(eras.length - 1, Math.max(0, index))]
  if (target && index !== nav.value.index) navigateTo(eraPath(target))
}

function onKey(e: KeyboardEvent) {
  const t = e.target as HTMLElement
  if (e.key === 'Escape') {
    if (busy.value) skip()
    else if (curatorOpen.value) curatorOpen.value = false
    else return
    e.preventDefault()
    return
  }
  if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return
  if (t.closest('input, textarea, select, [contenteditable=""], [contenteditable="true"], [data-keys="own"]')) return
  const i = nav.value.index
  switch (e.key) {
    case 'ArrowLeft':
      if (i > 0) go(i - 1)
      break
    case 'ArrowRight':
      go(i + 1)
      break
    case 'Home':
      go(0)
      break
    case 'End':
      go(eras.length - 1)
      break
    case 'c':
    case 'C':
      curatorOpen.value = !curatorOpen.value
      break
    case '?':
      helpOpen.value = true
      break
    default:
      return
  }
  e.preventDefault()
}

const help = ref<HTMLDialogElement | null>(null)
watch(helpOpen, (open) => {
  if (!help.value) return
  if (open && !help.value.open) help.value.showModal()
  if (!open && help.value.open) help.value.close()
})

let unregister: (() => void) | undefined
onMounted(() => {
  restoreReadable()
  window.addEventListener('keydown', onKey)
  unregister = registerStage({ depart, arrive: () => travel?.arrived.resolve(), abort: reset, skip })
})
onBeforeUnmount(() => {
  reset()
  unregister?.()
  window.removeEventListener('keydown', onKey)
})
</script>

<template>
  <div ref="stageEl" class="stage" :data-kind="kind" :class="{ 'is-travelling': busy }" @click="onClick">
    <div ref="cameraEl" class="stage__camera">
      <div class="desk" aria-hidden="true"><i class="desk__top" /><i class="desk__front" /></div>
      <MonitorRig v-if="ghostKind" ref="ghostRig" :kind="ghostKind" ghost />
      <MonitorRig ref="mainRig" :kind="kind">
        <slot />
        <template #controls>
          <div class="rig__controls" role="group" aria-label="Museum controls">
            <button
              type="button"
              class="hw-btn"
              aria-controls="curator"
              :aria-expanded="curatorOpen"
              @click="curatorOpen = !curatorOpen"
            >
              Curator
            </button>
            <button
              type="button"
              class="hw-btn"
              :aria-pressed="readable"
              title="Readable mode: higher contrast, larger text, no motion"
              @click="setReadable(!readable)"
            >
              Aa<span class="sr-only"> Readable mode</span>
            </button>
            <button type="button" class="hw-btn" aria-label="Keyboard shortcuts" @click="helpOpen = true">?</button>
            <a class="hw-btn" href="/">Lobby</a>
          </div>
        </template>
      </MonitorRig>
      <div v-if="cast !== 'none'" ref="moverEl" class="mover" aria-hidden="true">
        <MoverFigure />
        <MonitorRig
          v-if="cast === 'phone'"
          ref="heldRig"
          kind="phone"
          ghost
          class="rig--held"
          :style="{ '--hold-x': `${hold.x}px`, '--hold-y': `${hold.y}px` }"
        />
      </div>
      <div v-if="cast === 'carry'" ref="moverFrontEl" class="mover mover--front" aria-hidden="true">
        <MoverFigure front />
      </div>
    </div>
    <div ref="probeEl" class="stage__probe" aria-hidden="true" />

    <button v-if="busy && cinematic" type="button" class="stage__skip" @click="skip">Skip <span aria-hidden="true">⏭</span></button>
    <p class="sr-only" aria-live="polite">{{ announcement }}</p>

    <dialog ref="help" class="shell-dialog" aria-labelledby="help-title" @close="helpOpen = false">
      <h2 id="help-title">Keyboard shortcuts</h2>
      <dl>
        <dt><kbd>←</kbd> <kbd>→</kbd></dt>
        <dd>Previous / next era</dd>
        <dt><kbd>Home</kbd> <kbd>End</kbd></dt>
        <dd>First / last era</dd>
        <dt><kbd>C</kbd></dt>
        <dd>Open or close the curator panel</dd>
        <dt><kbd>Esc</kbd></dt>
        <dd>Skip a transition, or close the curator panel</dd>
        <dt><kbd>?</kbd></dt>
        <dd>This list</dd>
      </dl>
      <p>Shortcuts pause while you type in a form, and inside demos that use the keyboard themselves (like the BBS).</p>
      <form method="dialog"><button class="shell-button">Close</button></form>
    </dialog>
  </div>
</template>
