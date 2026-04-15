<script setup lang="ts">

import BoardCell from './BoardCell.vue'
import { useGridStore } from '../../stores/gridStore'

const gridStore = useGridStore()
</script>

<template>
  <div
    class="grid gap-1.5 p-2 min-w-[30rem]"
    :style="{
      gridTemplateColumns: `repeat(${gridStore.grid.size.width}, 80px)`,
    }"
  >
    <BoardCell
      v-for="cell in gridStore.grid.cells"
      :key="cell.id"
      v-bind="cell"
    />
  </div>
</template>
