<script setup lang="ts">

import { computed, onMounted, onUnmounted, ref } from 'vue'

import BoardCell from './BoardCell.vue'
import { useGridStore } from '../../stores/gridStore'

const gridStore = useGridStore()

const cols = computed(() => gridStore.grid.size.width)

const frame = ref<HTMLElement | null>(null)

function centerScroll() {
  const el = frame.value
  if (!el) { return }
  el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2
  el.scrollTop = (el.scrollHeight - el.clientHeight) / 2
}

onMounted(() => {
  centerScroll()
  window.addEventListener('resize', centerScroll)
})

onUnmounted(() => {
  window.removeEventListener('resize', centerScroll)
})
</script>

<template>
  <div
    ref="frame"
    class="board-frame border border-block-border bg-main-bg p-3"
  >
    <div
      class="board-grid grid"
      :style="{
        '--board-cols': cols,
        gridTemplateColumns: `repeat(${cols}, var(--cell))`,
      }"
    >
      <BoardCell
        v-for="cell in gridStore.grid.cells"
        :key="cell.id"
        v-bind="cell"
      />
    </div>
  </div>
</template>

<style scoped>
.board-frame {
  container-type: inline-size;
  display: grid;
  place-items: safe center;
  inline-size: 100%;
  min-inline-size: 0;
  overflow: auto;
  scrollbar-gutter: stable;
}

.board-grid {
  --cell: clamp(
    var(--board-cell-min),
    100cqi / var(--board-cols),
    var(--board-cell-max)
  );

  grid-auto-rows: calc(var(--cell) * 124 / 80);
}

@media (width >= 64rem) {
  .board-frame {
    block-size: 100%;
    min-block-size: 0;
  }
}
</style>
