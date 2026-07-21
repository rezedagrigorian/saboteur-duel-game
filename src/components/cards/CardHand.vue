<script setup lang="ts">
// import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useCardStore } from '@/stores/cardStore'
import { CardStatus } from '@/types/card'
import Card from './Card.vue'
import type { ICard } from '@/types'

defineProps<{
  playerId: string
  playerCards: ICard[]
}>()

const cardStore = useCardStore()
const { selectedCardId } = storeToRefs(cardStore)

function handleCardClick(cardId: string) {
  if (selectedCardId.value === cardId) {
    cardStore.clearSelection()
  } else {
    cardStore.selectCard(cardId)
  }
}
</script>

<template>
  <aside
    class="p-3"
    aria-label="Hand cards"
  >
    <div
      v-if="playerCards.length > 0"
      class="grid grid-cols-3 gap-6"
    >
      <div
        v-for="card in playerCards"
        :key="card.id"
        :class="{ 'rounded ring-2 ring-cyan-400 ring-offset-2 ring-offset-board-bg': selectedCardId === card.id,
                  'opacity-50 pointer-events-none': card.status === CardStatus.Placed }"
        @click="handleCardClick(card.id)"
      >
        <div
          class="card-size shrink-0 overflow-hidden bg-board-surface shadow-card-frame"
        >
          <Card :card-id="card.id" />
        </div>
      </div>
    </div>
    <div
      v-else
      class="flex min-h-[8rem] items-center justify-center rounded-md"
    >
      <p class="w-full text-center text-sm text-cyan-200/70">
        No cards
      </p>
    </div>
  </aside>
</template>
