<script setup lang="ts">
import type { NuxtError } from '#app'
defineProps<{ error: NuxtError }>()
useHead({ title: 'Lost in time · Web Design Through the Ages' })
</script>

<template>
  <main class="lost">
    <pre aria-hidden="true">
 _  _    ___   _  _
| || |  / _ \ | || |
| || |_| | | || || |_
|__   _| |_| ||__   _|
   |_|  \___/    |_|</pre>
    <h1>This page fell out of the timeline</h1>
    <p>{{ error.statusCode === 404 ? 'No era lives at this address.' : error.statusMessage }}</p>
    <p><a href="/">Back to all eras</a></p>
  </main>
</template>

<style>
@layer shell {
  .lost {
    min-height: 100dvh;
    display: grid;
    place-content: center;
    text-align: center;
    background: #0000aa;
    color: #fff;
    font: 16px/1.5 var(--shell-mono);
    padding: 24px;
  }
  .lost pre {
    color: #ffff55;
  }
  .lost a {
    color: #55ffff;
  }
}
</style>
