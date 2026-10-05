<script setup lang="ts">
import { eras, eraPath, neighbours } from '~/composables/useEras'

const props = defineProps<{ current: string }>()
const { curatorOpen, readable, helpOpen, setReadable, restoreReadable } = useShell()

const nav = computed(() => neighbours(props.current))
const currentEra = computed(() => eras[nav.value.index])

const track = ref<HTMLElement | null>(null)
const preview = ref<number | null>(null)
let dragging = false

function indexAt(clientX: number) {
  const rect = track.value!.getBoundingClientRect()
  const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
  return Math.round(ratio * (eras.length - 1))
}

function go(index: number) {
  const target = eras[Math.min(eras.length - 1, Math.max(0, index))]
  if (target && target.slug !== props.current) window.location.assign(eraPath(target))
}

function onPointerDown(e: PointerEvent) {
  if ((e.target as HTMLElement).closest('a')) return // a plain click on a notch is a link
  dragging = true
  track.value!.setPointerCapture(e.pointerId)
  preview.value = indexAt(e.clientX)
}
function onPointerMove(e: PointerEvent) {
  if (dragging) preview.value = indexAt(e.clientX)
}
function onPointerUp(e: PointerEvent) {
  if (!dragging) return
  dragging = false
  const i = indexAt(e.clientX)
  preview.value = null
  go(i)
}

function onKey(e: KeyboardEvent) {
  const t = e.target as HTMLElement
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

onMounted(() => {
  restoreReadable()
  window.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <nav id="timebar" class="timebar" aria-label="Time bar" tabindex="-1">
    <a
      v-if="nav.prev"
      class="timebar__step timebar__prev"
      :href="eraPath(nav.prev)"
      rel="prev"
      :aria-label="`Previous era: ${nav.prev.title}`"
    >
      <span aria-hidden="true">‹</span>
    </a>
    <span v-else class="timebar__step timebar__prev" aria-hidden="true" />

    <div class="timebar__now">
      <span class="timebar__years">{{ currentEra?.years }}</span>
      <span class="timebar__title">{{ currentEra?.title }}</span>
    </div>

    <div
      ref="track"
      class="timebar__track"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="preview = null"
    >
      <ol class="timebar__notches">
        <li v-for="(era, i) in eras" :key="era.slug">
          <a
            :href="eraPath(era)"
            class="timebar__notch"
            :class="{ 'is-preview': preview === i }"
            :aria-current="era.slug === current ? 'page' : undefined"
            :title="`${era.years} · ${era.title}`"
          >
            <span class="timebar__notch-label">{{ era.id }}</span>
            <span class="sr-only">{{ era.title }}, {{ era.years }}</span>
          </a>
        </li>
      </ol>
      <output v-if="preview !== null" class="timebar__preview">{{ eras[preview]?.years }} · {{ eras[preview]?.title }}</output>
    </div>

    <div class="timebar__tools">
      <button
        type="button"
        class="timebar__btn"
        :aria-pressed="readable"
        title="Readable mode: higher contrast, larger text, no motion"
        @click="setReadable(!readable)"
      >
        Aa<span class="sr-only"> Readable mode</span>
      </button>
      <button
        type="button"
        class="timebar__btn timebar__btn--curator"
        aria-controls="curator"
        :aria-expanded="curatorOpen"
        @click="curatorOpen = !curatorOpen"
      >
        Curator
      </button>
      <button type="button" class="timebar__btn" aria-label="Keyboard shortcuts" @click="helpOpen = true">?</button>
      <a class="timebar__btn timebar__home" href="/" aria-label="All eras">◰</a>
    </div>

    <a
      v-if="nav.next"
      class="timebar__step timebar__next"
      :href="eraPath(nav.next)"
      rel="next"
      :aria-label="`Next era: ${nav.next.title}`"
    >
      <span aria-hidden="true">›</span>
    </a>
    <span v-else class="timebar__step timebar__next" aria-hidden="true" />
  </nav>

  <dialog ref="help" class="shell-dialog" aria-labelledby="help-title" @close="helpOpen = false">
    <h2 id="help-title">Keyboard shortcuts</h2>
    <dl>
      <dt><kbd>←</kbd> <kbd>→</kbd></dt>
      <dd>Previous / next era</dd>
      <dt><kbd>Home</kbd> <kbd>End</kbd></dt>
      <dd>First / last era</dd>
      <dt><kbd>C</kbd></dt>
      <dd>Open or close the curator panel</dd>
      <dt><kbd>?</kbd></dt>
      <dd>This list</dd>
    </dl>
    <p>Shortcuts pause while you type in a form, and inside demos that use the keyboard themselves (like the BBS).</p>
    <form method="dialog"><button class="shell-button">Close</button></form>
  </dialog>
</template>
