<script setup lang="ts">
import diamondIconSrc from '@/assets/diamond-icon.svg'

withDefaults(
  defineProps<{
    gold?: number
    width?: string
  }>(),
  {
    gold: 0,
    width: '5rem',
  },
)
</script>

<template>
  <div
    class="shrink-0 select-none"
    :style="{ width }"
    aria-label="Gold"
  >
    <svg
      viewBox="0 0 200 143"
      class="block h-auto w-full"
    >
      <polygon
        points="86.7,42.5 190,42.5 190,99.5 86.7,99.5 102,71"
        class="fill-grid-cell-border"
      />
      <line
        x1="90"
        y1="40"
        x2="190"
        y2="40"
        class="stroke-block-border"
        stroke-width="1.5"
        opacity="0.5"
      />
      <line
        x1="90"
        y1="102"
        x2="190"
        y2="102"
        class="stroke-block-border"
        stroke-width="1.5"
        opacity="0.5"
      />

      <path
        d="M179.5 35.5 H199.5 V54 H192.5 V42.5 H179.5 Z"
        class="fill-block-border"
      />
      <rect
        x="192.5"
        y="62.5"
        width="7"
        height="17"
        class="fill-block-border"
      />
      <path
        d="M192.5 88 H199.5 V106.5 H179.5 V99.5 H192.5 Z"
        class="fill-block-border"
      />

      <polygon
        points="2,71 27,24.5 77,24.5 102,71 77,117.5 27,117.5"
        class="fill-block-border stroke-block-border"
        fill-opacity="0.15"
        stroke-width="2.5"
      />
      <image
        :href="diamondIconSrc"
        x="23"
        y="46"
        width="58"
        height="50"
      />
      <text
        x="145"
        y="71"
        text-anchor="middle"
        dominant-baseline="central"
        class="fill-block-border tabular-nums"
        font-size="44"
      >{{ gold }}</text>
    </svg>
  </div>
</template>
