<script setup lang="ts">
import type { PlayerColor } from '@/types/player'

withDefaults(
  defineProps<{
    name?: string
    color?: PlayerColor
  }>(),
  {
    name: 'You',
    color: 1,
  },
)
</script>

<template>
  <div class="clip-btn flex w-fit shrink-0 items-center gap-2.5 self-start">
    <svg
      class="clip-btn-shape"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <polygon points="0,0 85,0 100,30 100,100 0,100" />
    </svg>
    <span
      class="size-2 shrink-0 rounded-full"
      :class="color === 2 ? 'bg-purple-400' : 'bg-yellow-400'"
      aria-hidden="true"
    />
    {{ name }}
  </div>
</template>

<style scoped>
.clip-btn {
  position: relative;
  padding: 11px 22px 11px 16px;
  color: var(--color-block-border);
  font-family: var(--font-hud);
  font-size: 14.4px;
  line-height: 1;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  white-space: nowrap;
  cursor: default;
}

.clip-btn-shape {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.clip-btn-shape polygon {
  fill: var(--color-grid-cell-border);
  stroke: var(--color-block-border);
  stroke-width: 1;
  vector-effect: non-scaling-stroke;
}
</style>
