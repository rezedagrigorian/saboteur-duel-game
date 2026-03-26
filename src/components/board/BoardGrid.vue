<script setup lang="ts">

import BoardCell from './BoardCell.vue'
import { useGridStore } from '../../stores/gridStore'

const gridConfigurationStore = useGridStore()
</script>

<template>
  <div
    class="grid gap-1.5 bg-red-100 p-2"
    :style="{
      gridTemplateColumns: `repeat(${gridConfigurationStore.grid.size.width}, 100px)`,
    }"
  >
    <BoardCell
      v-for="cell in gridConfigurationStore.grid.cells"
      :key="cell.id"
      v-bind="cell"
    />
  </div>
</template>
