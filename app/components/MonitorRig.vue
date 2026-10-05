<script setup lang="ts">
import type { MonitorKind } from '~/lib/monitors'

// One piece of hardware: a CSS 3D box with a live screen on its front face.
// The stage renders one for the current era and, during a swap, a second
// "ghost" for the outgoing device. Geometry lives in stage.css.
defineProps<{ kind: MonitorKind; ghost?: boolean }>()

const faces = ['back', 'left', 'right', 'top', 'bottom'] as const
</script>

<template>
  <div class="rig" :class="{ 'rig--ghost': ghost }" :data-kind="kind">
    <div class="rig__model" aria-hidden="true">
      <i class="box box--case">
        <i v-for="f in faces" :key="f" :class="`box__f box__f--${f}`" />
      </i>
      <i v-if="kind === 'crt'" class="box box--tube">
        <i v-for="f in faces" :key="f" :class="`box__f box__f--${f}`" />
      </i>
      <i v-if="kind === 'lcd'" class="box box--neck">
        <i v-for="f in faces" :key="f" :class="`box__f box__f--${f}`" />
        <i class="box__f box__f--front" />
      </i>
      <i v-if="kind !== 'phone'" class="box box--foot">
        <i v-for="f in faces" :key="f" :class="`box__f box__f--${f}`" />
        <i class="box__f box__f--front" />
      </i>
      <i v-if="kind === 'crt' || kind === 'classic'" class="rig__cable" />
      <!-- A hand holding the phone from behind: fingertips and thumb peek out at the sides. -->
      <svg v-if="kind === 'phone'" class="rig__hand" viewBox="0 0 150 130">
        <ellipse class="rig__hand-skin" cx="126" cy="6" rx="9" ry="6.5" />
        <ellipse class="rig__hand-skin" cx="127" cy="19" rx="9.5" ry="6.5" />
        <ellipse class="rig__hand-skin" cx="126" cy="32" rx="9" ry="6.5" />
        <ellipse class="rig__hand-skin" cx="123" cy="44" rx="8" ry="6" />
        <path class="rig__hand-skin" d="M30 52 C 22 44, 18 30, 21 18 C 23 11, 31 11, 32 19 L 36 40 Z" />
        <path class="rig__hand-skin" d="M28 50 C 40 44, 112 42, 124 50 C 128 70, 116 92, 104 112 L 48 112 C 38 92, 26 72, 28 50 Z" />
        <path class="rig__hand-shade" d="M40 64 C 60 74, 92 74, 114 62 C 110 80, 102 96, 96 108 L 56 108 C 50 94, 44 80, 40 64 Z" />
        <rect class="rig__hand-sleeve" x="42" y="108" width="68" height="22" rx="4" />
      </svg>
    </div>

    <div class="rig__front">
      <div class="rig__screen" data-screen>
        <div class="rig__scroll">
          <slot />
        </div>
        <div class="rig__glass" aria-hidden="true" />
        <div class="rig__power" aria-hidden="true" />
      </div>
      <div class="rig__chin" aria-hidden="true">
        <span class="rig__brand">{{ kind === 'phone' ? '' : 'CHRONOS' }}</span>
        <span v-if="kind === 'classic'" class="rig__floppy" />
        <span v-if="kind !== 'phone'" class="rig__led" />
      </div>
      <slot name="controls" />
    </div>
  </div>
</template>
