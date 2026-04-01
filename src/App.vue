<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import AppShell from './components/layout/AppShell.vue'

const PiniaColadaDevtools = import.meta.env.DEV
  ? defineAsyncComponent(() =>
      import('@pinia/colada-devtools').then((m) => m.PiniaColadaDevtools),
    )
  : null
</script>

<template>
  <AppShell />

  <component
    :is="PiniaColadaDevtools"
    v-if="PiniaColadaDevtools"
  />
</template>
