<script setup lang="ts">
import BoardGrid from '../components/board/BoardGrid.vue'
import CardHand from '../components/cards/CardHand.vue'
import { useCardStore } from '../stores/cardStore'

const cardStore = useCardStore()
const userId = 'player1'
</script>

<template>
  <div class="mx-auto flex flex-col gap-4 lg:flex-row lg:items-start">
    <div class="-mx-4 overflow-x-auto px-4 lg:mx-0 lg:overflow-visible lg:px-0">
      <BoardGrid class="shrink-0" />
    </div>
    <div class="flex justify-center">
      <button
        class="bg-blue-500 text-white px-4 py-2 rounded-md"
        @click="cardStore.getRandomCard(userId)"
      >
        Get card
      </button>
    </div>
    <CardHand
      :user-id="userId"
      class="min-w-0 lg:flex-1"
    />
  </div>
</template>
