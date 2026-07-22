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
      class="hand-grid mx-auto grid grid-cols-[repeat(3,minmax(var(--card-min-width),1fr))]"
    >
      <div
        v-for="card in playerCards"
        :key="card.id"
        :class="{ 'rounded ring-2 ring-cyan-400 ring-offset-2 ring-offset-board-bg': selectedCardId === card.id,
                  'opacity-50 pointer-events-none': card.status === CardStatus.Placed }"
        @click="handleCardClick(card.id)"
      >
        <div
          class="w-full aspect-[var(--card-aspect-ratio)] overflow-hidden bg-board-surface shadow-card-frame"
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

<style scoped>
.hand-grid {
  --hand-gap: 1.5rem;
  --card-max-width: 110px;
  --card-min-width: 70px;

  gap: var(--hand-gap);
  max-inline-size: calc(3 * var(--card-max-width) + 2 * var(--hand-gap));
}
</style>
