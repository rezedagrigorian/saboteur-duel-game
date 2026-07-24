<script setup lang="ts">

import { computed, onMounted, onUnmounted, ref } from 'vue'

import BoardCell from './BoardCell.vue'
import { useGridStore } from '../../stores/gridStore'

const gridStore = useGridStore()

const cols = computed(() => gridStore.grid.size.width)
const rows = computed(() => gridStore.grid.size.height)

const frame = ref<HTMLElement | null>(null)

function centerScroll() {
  const el = frame.value
  if (!el) { return }
  el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2
  el.scrollTop = (el.scrollHeight - el.clientHeight) / 2
}

function measureCell() {
  const cell = frame.value?.querySelector<HTMLElement>('.board-grid > *')
  if (cell) { gridStore.boardCellSize = cell.getBoundingClientRect().width }
}

let observer: ResizeObserver | null = null

onMounted(() => {
  measureCell()
  centerScroll()
  observer = new ResizeObserver(() => {
    measureCell()
    centerScroll()
  })
  if (frame.value) { observer.observe(frame.value) }
})

onUnmounted(() => {
  observer?.disconnect()
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
        '--board-rows': rows,
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
  inline-size: 100%;
  min-inline-size: 0;
  overflow: auto;
  scrollbar-gutter: stable;
}

.board-grid {
  --cell: max(var(--board-cell-min), 100cqi / var(--board-cols));

  grid-auto-rows: calc(var(--cell) * 124 / 80);
}

@media (width >= 64rem) {
  .board-frame {
    container-type: size;
    block-size: 100%;
    min-block-size: 0;
  }

  .board-grid {
    --cell: max(
      var(--board-cell-min),
      100cqi / var(--board-cols),
      100cqb / var(--board-rows) * 80 / 124
    );
  }
}
</style>
