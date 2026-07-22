<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useCardStore } from '@/stores/cardStore'
import { useGridStore } from '@/stores/gridStore'
import Card from './Card.vue'

const cardStore = useCardStore()
const gridStore = useGridStore()
const { selectedCardId } = storeToRefs(cardStore)

const selectionX = ref(-1)
const selectionY = ref(-1)
const wheelCooldown = ref(false)

function onMouseMove(event: MouseEvent) {
  selectionX.value = event.clientX
  selectionY.value = event.clientY
}

function onKeyDown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    cardStore.clearSelection()
  }
  if (event.key === 'r' || event.key === 'R') {
    cardStore.rotateSelectedCard()
  }
}

function onWheel(event: WheelEvent) {
  event.preventDefault()
  if (wheelCooldown.value) return
  wheelCooldown.value = true
  setTimeout(() => { wheelCooldown.value = false }, 900)
  cardStore.rotateSelectedCard()
}

onMounted(() => {
  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('keydown', onKeyDown)
  document.addEventListener('wheel', onWheel, { passive: false })
})

onUnmounted(() => {
  document.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('keydown', onKeyDown)
  document.removeEventListener('wheel', onWheel)
})
</script>

<template>
  <div
    v-show="selectionX !== -1 && selectionY !== -1"
    class="pointer-events-none fixed z-[9999] -translate-x-1/2 -translate-y-1/2 opacity-100"
    :style="{ left: `${selectionX}px`, top: `${selectionY}px` }"
  >
    <div
      class="overflow-hidden bg-board-surface shadow-card-frame"
      :style="{ width: `${gridStore.boardCellSize}px`, aspectRatio: 'var(--card-aspect-ratio)' }"
    >
      <Card :card-id="selectedCardId!" />
    </div>
  </div>
</template>
