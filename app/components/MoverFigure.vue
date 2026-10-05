<script setup lang="ts">
// The mover who swaps the hardware between eras. Drawn front-on from the hips
// up (the desk hides the rest) in a 60 × 90 cm box: 200 × 300 SVG units.
// Arm poses are separate groups that the swap scenes fade between. The phone
// in the "hold" pose brings its own hand (MonitorRig's .rig__hand), so the
// sleeve here ends at that hand's cuff.
// `front` draws only the hands, on a layer in front of the carried screen.
defineProps<{ front?: boolean }>()
</script>

<template>
  <svg v-if="front" class="mover__svg" viewBox="0 0 200 300">
    <g class="mv-hands-carry">
      <ellipse cx="14" cy="150" rx="11" ry="13" class="mv-skin" />
      <ellipse cx="186" cy="150" rx="11" ry="13" class="mv-skin" />
    </g>
  </svg>
  <svg v-else class="mover__svg" viewBox="0 0 200 300">
    <g class="mv-bob">
      <!-- torso -->
      <path class="mv-shirt" d="M40 112 Q100 94 160 112 Q172 116 170 140 L166 300 L34 300 L30 140 Q28 116 40 112 Z" />
      <path class="mv-shirt-dark" d="M86 102 L100 124 L114 102 Z" />
      <circle cx="68" cy="146" r="8" class="mv-badge" />
      <!-- neck and head -->
      <rect x="90" y="84" width="20" height="22" rx="6" class="mv-skin-dark" />
      <ellipse cx="74" cy="62" rx="5" ry="8" class="mv-skin" />
      <ellipse cx="126" cy="62" rx="5" ry="8" class="mv-skin" />
      <ellipse cx="100" cy="60" rx="26" ry="31" class="mv-skin" />
      <circle cx="91" cy="62" r="2.6" class="mv-ink" />
      <circle cx="109" cy="62" r="2.6" class="mv-ink" />
      <path d="M92 76 Q100 81 108 76" class="mv-line" />
      <!-- cap -->
      <path class="mv-cap" d="M73 50 Q74 24 100 23 Q126 24 127 50 Z" />
      <path class="mv-cap-brim" d="M70 50 Q100 42 134 50 L136 56 Q100 48 68 56 Z" />
    </g>
    <!-- arms: carrying a screen at the sides -->
    <g class="mv-arms-carry">
      <path d="M44 116 L30 134 L16 150" class="mv-sleeve" />
      <path d="M156 116 L170 134 L184 150" class="mv-sleeve" />
    </g>
    <!-- arms: hanging down -->
    <g class="mv-arms-down" opacity="0">
      <path d="M42 118 L34 210" class="mv-sleeve" />
      <ellipse cx="33" cy="220" rx="9" ry="11" class="mv-skin" />
      <path d="M158 118 L166 210" class="mv-sleeve" />
      <ellipse cx="167" cy="220" rx="9" ry="11" class="mv-skin" />
    </g>
    <!-- arms: left hangs, right holds a phone up in front of the chest -->
    <g class="mv-arms-hold" opacity="0">
      <path d="M42 118 L34 210" class="mv-sleeve" />
      <ellipse cx="33" cy="220" rx="9" ry="11" class="mv-skin" />
      <path d="M158 118 L182 232 L151 204" class="mv-sleeve" />
    </g>
  </svg>
</template>

<style>
@layer shell {
  .mover {
    position: absolute;
    left: calc(50vw - 30 * var(--cm));
    top: calc(var(--desk-y) - 75 * var(--cm));
    width: calc(60 * var(--cm));
    height: calc(90 * var(--cm));
    transform-style: preserve-3d;
    pointer-events: none;
    transform: translate3d(200vw, 0, 0);
  }
  .mover__svg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    overflow: visible;
  }
  .mv-skin {
    fill: #c98f66;
  }
  .mv-skin-dark {
    fill: #b47b55;
  }
  .mv-shirt {
    fill: #2f4a6d;
  }
  .mv-shirt-dark {
    fill: #23384f;
  }
  .mv-badge {
    fill: #f59e0b;
  }
  .mv-cap {
    fill: #b8322a;
  }
  .mv-cap-brim {
    fill: #8f241e;
  }
  .mv-ink {
    fill: #2a1d14;
  }
  .mv-line {
    fill: none;
    stroke: #6e3f28;
    stroke-width: 2.4;
    stroke-linecap: round;
  }
  .mv-sleeve {
    fill: none;
    stroke: #2a4364;
    stroke-width: 19;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
}
</style>
