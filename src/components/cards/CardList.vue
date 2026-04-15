<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useCardStore } from '@/stores/cardStore'
import Card from './Card.vue'
const cardStore = useCardStore()
const { playableCardIds, selectedCardId, cards } = storeToRefs(cardStore)
</script>

<template>
  <aside
    class="bg-slate-100 rounded-lg border border-neutral-200 p-3"
    aria-label="cards on the board"
  >
    <div
      v-if="playableCardIds.length > 0"
      class="flex flex-wrap gap-6"
    >
      <div
        v-for="cardId in playableCardIds"
        :key="cardId"
        :class="{ 'ring-2 ring-blue-500 ring-offset-2': selectedCardId === cardId, 'opacity-50 pointer-events-none': cards.get(cardId)?.user }"
        @click="cardStore.selectCard(cardId)"
      >
        <Card
          :card-id="cardId"
        />
      </div>
    </div>
    <div
      v-else
      class="flex min-h-[8rem] items-center justify-center rounded-md"
    >
      <p class="w-full text-center text-sm text-neutral-500">
        No cards
      </p>
    </div>
  </aside>
</template>
