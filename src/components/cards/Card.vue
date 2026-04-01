<script setup lang="ts">

import { computed } from 'vue'

import type { ICard } from '@/types'
import { useCardStore } from '../../stores/cardStore'

const props = defineProps<{
  cardId: string
}>()

const { getCardById } = useCardStore()
const card = computed<ICard | undefined>(() => getCardById(props.cardId))

const PORT_COLOR_MAP = [
  'red',
  'green',
  'blue',
]

const PORT_POSITIONS = [
  'left-[-8px] top-1/2 -translate-y-1/2',      // 0 - слева по центру
  'top-[-8px] left-1/2 -translate-x-1/2',      // 1 - сверху по центру
  'right-[-8px] top-1/2 -translate-y-1/2',     // 2 - справа по центру
  'bottom-[-8px] left-1/2 -translate-x-1/2',   // 3 - снизу по центру
]

</script>

<template>
  <div
    v-if="card"
    role="button"
    tabindex="0"
    class="relative grid size-[72px] cursor-pointer place-items-center rounded-lg border text-xs text-neutral-800 transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ring-offset-2"
    :style="{
      backgroundColor: card.isGolden ? 'gold' : 'white',
    }"
  >
    <div
      v-for="(port, index) in card.ports"
      :key="card.id + '-' + index"
      class="absolute w-4 h-4"
      :class="PORT_POSITIONS[index]"
    >
      <div
        v-if="port"
        :key="port.group"
        class="w-4 h-4"
        :style="{
          backgroundColor: PORT_COLOR_MAP[port.group],
          border: port.isTroll ? '1px dashed black' : 'none',
        }"
      >
        {{ port.isGold ? 'G' : '' }}
        {{ port.isTroll ? 'T' : '' }}
      </div>
    </div>
  </div>
</template>
