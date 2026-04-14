<script setup lang="ts">

import { computed } from 'vue'

import type { ICard } from '@/types'
import { useCardStore } from '../../stores/cardStore'

const props = defineProps<{
  cardId: string
}>()

const { getCardById } = useCardStore()
const card = computed<ICard | undefined>(() => getCardById(props.cardId))

const PORT_GROUP_CLASS: Record<number, string> = {
  1: 'bg-red-500',
  2: 'bg-green-500',
  3: 'bg-blue-500',
}

function portGroupClass(group: number): string {
  return PORT_GROUP_CLASS[group] ?? 'bg-neutral-400'
}

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
      class="absolute flex size-5 items-center justify-center"
      :class="PORT_POSITIONS[index]"
    >
      <div
        v-if="port"
        :key="`${card.id}-${index}-g${port.group}`"
        class="flex size-5 flex-col items-center justify-center rounded-sm leading-none"
        :class="portGroupClass(port.group)"
        :style="{
          border: port.isTroll ? '1px dashed black' : 'none',
        }"
      >
        <span class="text-[10px] font-bold text-white drop-shadow-sm">{{ index }}</span>
        <span
          v-if="port.isGold || port.isTroll"
          class="mt-px text-[7px] font-semibold text-white drop-shadow-sm"
        >
          {{ port.isGold ? 'G' : '' }}{{ port.isTroll ? 'T' : '' }}
        </span>
      </div>
    </div>
  </div>
</template>
