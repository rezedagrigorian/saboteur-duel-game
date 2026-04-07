<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useCardStore } from '@/stores/cardStore'
import Card from './Card.vue'
const cardStore = useCardStore()
const { playableCardIds, selectedCardId, cards } = storeToRefs(cardStore)
</script>

<template>
  <aside
    class="w-full rounded-lg border border-neutral-200 bg-neutral-50 p-3 md:w-[26rem]"
    aria-label="cards on the board"
  >
    <h2 class="mb-3 text-sm font-semibold text-neutral-700">
      Cards from board
    </h2>
    <div
      v-if="playableCardIds.length > 0"
      class="max-h-[34rem] overflow-y-auto p-4"
    >
      <div class="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
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
