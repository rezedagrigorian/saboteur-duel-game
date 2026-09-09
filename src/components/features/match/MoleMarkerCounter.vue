<script setup lang="ts">
import { computed } from 'vue'
import { useCardStore } from '@/stores/cardStore'
import { MOLE_MARKER_COUNT } from '@/game-core/constants'

const cardStore = useCardStore()

// a shared pool between both players — worth flagging once it's about to end the round
const isLow = computed(() => cardStore.availableMarkerCount <= 2)
</script>

<template>
  <div
    class="pointer-events-none flex items-center gap-2 border bg-grid-cell-border px-3 py-1.5
           font-hud text-[0.625rem] uppercase tracking-[0.08em]"
    :class="isLow ? 'border-broken-frame text-broken-frame' : 'border-block-border text-hud-text'"
    role="status"
    :aria-label="`${cardStore.availableMarkerCount} of ${MOLE_MARKER_COUNT} mole markers remaining`"
  >
    <span class="text-hud-text-soft">Markers</span>
    <span class="font-bold tabular-nums">{{ cardStore.availableMarkerCount }}/{{ MOLE_MARKER_COUNT }}</span>
  </div>
</template>
