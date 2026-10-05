<script setup lang="ts">
import type { EraMeta } from '~/eras/types'
import type { RoomPayload } from '~/composables/useRoom'

const props = defineProps<{ era: EraMeta; room: RoomPayload; isSubRoom: boolean }>()
const { curatorOpen } = useShell()

const meta = computed(() => props.room.meta)
const context = computed(() => meta.value.context ?? props.era.context)
const tech = computed(() => meta.value.tech ?? props.era.tech)
const thenVsNow = computed(() => meta.value.thenVsNow ?? props.era.thenVsNow)

let lit: Element[] = []
function highlight(id: string | null) {
  lit.forEach((el) => el.classList.remove('shell-highlight'))
  lit = []
  if (!id) return
  lit = Array.from(document.querySelectorAll(`main.era [data-trait~="${id}"]`))
  lit.forEach((el) => el.classList.add('shell-highlight'))
  lit[0]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
}

const panel = ref<HTMLElement | null>(null)
watch(curatorOpen, async (open) => {
  if (!open) highlight(null)
  await nextTick()
  if (open) panel.value?.querySelector<HTMLElement>('.curator__close')?.focus()
})
</script>

<template>
  <aside
    id="curator"
    ref="panel"
    class="curator"
    :class="{ 'is-open': curatorOpen }"
    :inert="!curatorOpen"
    aria-labelledby="curator-title"
  >
    <header class="curator__head">
      <p class="curator__kicker">Curator's notes · {{ meta.years }}</p>
      <h2 id="curator-title">{{ meta.title }}</h2>
      <button type="button" class="curator__close" aria-label="Close curator panel" @click="curatorOpen = false">×</button>
    </header>

    <p class="curator__summary">{{ meta.summary }}</p>

    <nav v-if="isSubRoom" class="curator__rooms" aria-label="Rooms">
      <a :href="`/eras/${era.slug}/`">← Back to {{ era.title }}</a>
    </nav>
    <nav v-else-if="era.rooms?.length" class="curator__rooms" aria-label="Rooms">
      <a v-for="r in era.rooms" :key="r.path" :href="`/eras/${era.slug}/${r.path}/`">Enter the {{ r.label }} →</a>
    </nav>

    <section v-if="context" aria-labelledby="c-context">
      <h3 id="c-context">The world at the time</h3>
      <dl class="curator__context">
        <dt>Screens</dt>
        <dd>{{ context.screens }}</dd>
        <dt>Connection</dt>
        <dd>{{ context.connection }}</dd>
        <dt>Browsers & clients</dt>
        <dd>{{ context.browsers }}</dd>
      </dl>
    </section>

    <section aria-labelledby="c-traits">
      <h3 id="c-traits">Signature traits</h3>
      <p class="curator__hint">Hover or focus a trait to find it in the page.</p>
      <ul class="curator__traits">
        <li v-for="t in meta.traits" :key="t.id">
          <button
            type="button"
            @mouseenter="highlight(t.id)"
            @mouseleave="highlight(null)"
            @focus="highlight(t.id)"
            @blur="highlight(null)"
          >
            <span aria-hidden="true">✓</span> {{ t.label }}
          </button>
        </li>
      </ul>
    </section>

    <section v-if="tech?.length" aria-labelledby="c-tech">
      <h3 id="c-tech">Built with</h3>
      <ul class="curator__tech">
        <li v-for="t in tech" :key="t">{{ t }}</li>
      </ul>
    </section>

    <section v-if="room.snippets.length" aria-labelledby="c-code">
      <h3 id="c-code">View the code</h3>
      <figure v-for="s in room.snippets" :key="s.caption" class="curator__snippet">
        <figcaption>{{ s.caption }} <code>{{ s.file }}</code></figcaption>
        <div class="curator__code" tabindex="0" v-html="s.html" />
      </figure>
    </section>

    <section v-if="thenVsNow" aria-labelledby="c-now">
      <h3 id="c-now">Then vs now</h3>
      <p>{{ thenVsNow }}</p>
    </section>

    <section v-if="!isSubRoom && era.recreated?.length" aria-labelledby="c-recreated">
      <h3 id="c-recreated">Recreated with modern tech</h3>
      <ul>
        <li v-for="r in era.recreated" :key="r">{{ r }}</li>
      </ul>
    </section>

    <section aria-labelledby="c-sources">
      <h3 id="c-sources">Sources</h3>
      <ul class="curator__sources">
        <li v-for="s in meta.sources" :key="s.url">
          <a :href="s.url" rel="noopener" target="_blank">{{ s.label }}</a>
        </li>
      </ul>
    </section>
  </aside>
</template>
