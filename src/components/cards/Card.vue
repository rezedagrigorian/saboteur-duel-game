<script setup lang="ts">

import { computed } from 'vue'

import type { ICard } from '@/types'
import { useCardStore } from '../../stores/cardStore'
import { usePlayerStore } from '../../stores/playerStore'

const props = defineProps<{
  cardId: string
}>()

const { getCardById } = useCardStore()
const playerStore = usePlayerStore()
const card = computed<ICard | undefined>(() => getCardById(props.cardId))

const PLAYER_GOLD_COLOR: Record<number, string> = {
  1: 'var(--color-yellow-400)',
  2: 'var(--color-purple-400)',
}

const goldColor = computed<string>(() => {
  const ownerId = Object.values(card.value?.goldOwners ?? {})[0]
  const ownerColor = playerStore.getPlayerById(ownerId)?.color
  return ownerColor ? PLAYER_GOLD_COLOR[ownerColor] : 'var(--color-block-border)'
})

const DOOR_COLOR: Record<number, string> = {
  1: 'yellow',
  2: 'violet',
}

const PORT_GROUP_CLASS: Record<number, string> = {
  1: 'bg-red-500',
  2: 'bg-green-500',
  3: 'bg-blue-500',
}

function portGroupClass(group: number): string {
  return PORT_GROUP_CLASS[group] ?? 'bg-neutral-400'
}

const PORT_POSITIONS = [
  'left-[-6%] top-1/2 -translate-y-1/2',      // 0 - слева по центру
  'top-[-6%] left-1/2 -translate-x-1/2',      // 1 - сверху по центру
  'right-[-6%] top-1/2 -translate-y-1/2',     // 2 - справа по центру
  'bottom-[-6%] left-1/2 -translate-x-1/2',   // 3 - снизу по центру
]

const RAT_OVERLAY_SIZE = 'w-[60%] aspect-[59/64]'

const RAT_OVERLAY_POSITION = [
  'left-0 top-1/2 -translate-y-1/2',
  'top-0 left-1/2 -translate-x-1/2',
  'right-0 top-1/2 -translate-y-1/2',
  'bottom-0 left-1/2 -translate-x-1/2',
]

const ratOverlayClass = computed<string | null>(() => {
  if (!card.value) return null
  const portIndex = card.value.ports.findIndex(port => port?.isRat)
  if (portIndex < 0) return null
  return `${RAT_OVERLAY_SIZE} ${RAT_OVERLAY_POSITION[portIndex]}`
})

</script>

<template>
  <div
    v-if="card"
    role="button"
    tabindex="0"
    class="relative grid h-full w-full cursor-pointer overflow-hidden"
    :class="!card.style.svg && 'rounded border'"
    :style="{
      backgroundColor: card.style.svg ? 'transparent' : (card.isGolden ? 'gold' : 'white'),
    }"
  >
    <div
      class="absolute inset-0"
      :style="{ transform: card.rotation ? 'rotate(180deg)' : 'rotate(0deg)' }"
    >
      <img
        v-if="card.style.svg"
        :src="`/cards/${card.style.svg}`"
        :alt="card.style.svg"
        class="absolute inset-0 h-full w-full object-contain"
      >
      <div
        v-if="card.style.svg && card.style.goldSvg"
        class="pointer-events-none absolute inset-0 [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]"
        :style="{
          backgroundColor: goldColor,
          maskImage: `url(/cards/${card.style.goldSvg})`,
        }"
      />
      <img
        v-if="card.style.doorSvg"
        :src="`/cards/${card.style.doorSvg}`"
        alt=""
        class="pointer-events-none absolute inset-0 h-full w-full object-contain"
      >
      <template v-if="!card.style.svg">
        <div
          v-for="(port, index) in card.ports"
          :key="card.id + '-' + index"
          class="absolute flex aspect-square w-1/4 items-center justify-center"
          :class="PORT_POSITIONS[index]"
        >
          <div
            v-if="port"
            :key="`${card.id}-${index}-g${port.group}`"
            class="flex h-full w-full flex-col items-center justify-center rounded-sm leading-none"
            :class="portGroupClass(port.group)"
            :style="{
              border: port.isRat ? '1px dashed black' : 'none',
              boxShadow: port.door ? `0 0 0 3px ${DOOR_COLOR[port.door]}` : 'none',
            }"
          >
            <span class="text-[10px] font-bold text-white">{{ index }}</span>
            <span
              v-if="card.gold?.[port.group] || port.isRat || port.door"
              class="text-[7px] font-semibold text-white"
            >
              {{ card.gold?.[port.group] ? 'G' : '' }}{{ port.isRat ? 'R' : '' }}{{ port.door ? 'D' : '' }}
            </span>
          </div>
        </div>
      </template>
    </div>
    <img
      v-if="card.style.ratSvg && ratOverlayClass"
      :src="`/cards/${card.style.ratSvg}`"
      alt=""
      class="pointer-events-none absolute z-10 max-w-none object-contain"
      :class="ratOverlayClass"
    >
  </div>
</template>
