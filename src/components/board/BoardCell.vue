<script setup lang="ts">
import type { IGridCell } from '@/types'

import { computed } from 'vue'
import { storeToRefs } from 'pinia'

import { useCardStore } from '@/stores/cardStore'
import { useGridStore } from '@/stores/gridStore'
import { usePlayerStore } from '@/stores/playerStore'

import Card from '../cards/Card.vue'

const props = defineProps<IGridCell>()

const gridStore = useGridStore()
const { assignCardToCell } = gridStore
const cardStore = useCardStore()
const { currentPlayerId } = storeToRefs(usePlayerStore())

const isPlaceable = computed(() => !props.card && !!cardStore.selectedCardId)

const isLastColumn = computed(
  () => props.coordinate.x === gridStore.grid.size.width - 1,
)

const isLastRow = computed(
  () => props.coordinate.y === gridStore.grid.size.height - 1,
)

function handleClick() {
  if (props.card || !cardStore.selectedCardId) { return }
  assignCardToCell(props.id, cardStore.selectedCardId, currentPlayerId.value)
}
</script>

<template>
  <button
    type="button"
    class="h-full w-full min-h-0 min-w-0 overflow-hidden bg-main-bg card-border transition-colors"
    :class="[
      isPlaceable && 'hover:bg-cell-hover hover:ring-2 hover:ring-inset hover:ring-cyan-500',
      isLastColumn && 'card-border--no-right',
      isLastRow && 'card-border--no-bottom',
    ]"
    @click="handleClick"
  >
    <Card
      v-if="card"
      :card-id="card"
    />
  </button>
</template>

<style scoped>
.card-border {
  border-right: 1px solid var(--color-grid-cell-border);
  border-bottom: 1px solid var(--color-grid-cell-border);
}

.card-border.card-border--no-right {
  border-right: none;
}

.card-border.card-border--no-bottom {
  border-bottom: none;
}
</style>
