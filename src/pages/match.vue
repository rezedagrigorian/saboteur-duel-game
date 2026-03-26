<script setup lang="ts">
import { reactive } from 'vue'
import BoardGrid from '../components/board/BoardGrid.vue'

interface PlacedByCell {
  [cellKey: string]: string
}

interface CellCoords {
  x: number
  y: number
}

const placed = reactive<PlacedByCell>({
  '0,2': 'S',
  '1,2': 'P',
})

function onPlaceAttempt({ x, y }: CellCoords) {
  // Temporary debug until move validation is implemented.
  console.warn('place-at', x, y)
}
</script>

<template>
  <div class="my-6">
    <BoardGrid
      :placed="placed"
      @place-at="onPlaceAttempt"
    />
  </div>
</template>
