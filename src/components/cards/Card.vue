<script setup lang="ts">

import { ref } from 'vue'

import type { TCard, TCardPort } from '@/types'
import { useCardStore } from '../../stores/cardStore'

const props = defineProps<{
  cardId: string
}>()

const { getCardById } = useCardStore()
const card: TCard | undefined = getCardById(props.cardId)

const portsColorMap = ref([
  'red',
  'green',
  'blue',
])

const portPositions = ref([
  'left-[-8px] top-1/2 -translate-y-1/2',      // 0 - слева по центру
  'top-[-8px] left-1/2 -translate-x-1/2',      // 1 - сверху по центру
  'right-[-8px] top-1/2 -translate-y-1/2',     // 2 - справа по центру
  'bottom-[-8px] left-1/2 -translate-x-1/2',   // 3 - снизу по центру
])

</script>

<template>
  <div
    v-if="card"
    class="relative grid size-[72px] place-items-center rounded-lg border border-red-600 text-xs text-neutral-800"
    :style="{
      backgroundColor: card.isGolden ? 'gold' : 'white',
    }"
  >
    <div
      v-for="(port, index) in card.ports"
      :key="card.id + '-' + index"
      class="absolute w-4 h-4"
      :class="portPositions[index]"
    >
      <div
        v-if="port"
        :key="port.group"
        class="w-4 h-4"
        :style="{
          backgroundColor: portsColorMap[port.group],
          border: port.isTroll ? '1px dashed black' : 'none',
        }"
      >
        {{ port.isGold ? 'G' : '' }}
        {{ port.isTroll ? 'T' : '' }}
      </div>
    </div>
  </div>
</template>
