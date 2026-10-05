<script setup lang="ts">
import { loadRoom, mountRoomBehaviour } from '~/composables/useRoom'
import { findEra } from '~/composables/useEras'

const route = useRoute()
const parts = ([] as string[]).concat(route.params.path as string | string[]).filter(Boolean)
const path = parts.join('/')
const era = findEra(parts[0] ?? '')
if (!era) throw createError({ statusCode: 404, statusMessage: 'No such era', fatal: true })

const { data: room } = await useAsyncData(`room:${path}`, () => loadRoom(path))
if (!room.value) throw createError({ statusCode: 404, statusMessage: 'No such room', fatal: true })

const isSubRoom = parts.length > 1
const title = isSubRoom ? `${room.value.meta.title} · ${era.title}` : era.title

useHead({
  title: `${title} (${room.value.meta.years}) · Web Design Through the Ages`,
  htmlAttrs: { 'data-era-page': era.id },
  link: [{ rel: 'canonical', href: `https://webdesign.atlesque.dev/eras/${path}/` }],
  meta: [
    { name: 'description', content: room.value.meta.summary },
    { property: 'og:title', content: `${title} · Web Design Through the Ages` },
    { property: 'og:description', content: room.value.meta.summary },
    { property: 'og:image', content: 'https://webdesign.atlesque.dev/og.png' },
  ],
  style: [
    { key: 'era-css', innerHTML: room.value.css },
    ...(room.value.skinCss ? [{ key: 'skin-css', innerHTML: room.value.skinCss }] : []),
  ],
})

const root = ref<HTMLElement | null>(null)
let cleanup: (() => void) | undefined
onMounted(async () => {
  if (root.value) cleanup = await mountRoomBehaviour(path, root.value)
})
onBeforeUnmount(() => cleanup?.())
</script>

<template>
  <div class="shell-room">
    <a class="shell-skip" href="#timebar">Skip to the time bar</a>
    <!-- Period markup, rendered byte for byte at build time. -->
    <main
      id="main"
      ref="root"
      class="era"
      :data-era="era!.id"
      :data-room="path"
      :aria-label="`${room!.meta.title} demo`"
      v-html="room!.html"
    />
    <CuratorPanel :era="era!" :room="room!" :is-sub-room="isSubRoom" />
    <TimeBar :current="era!.slug" />
  </div>
</template>
