<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useCardStore } from '@/stores/cardStore'
import { CardStatus } from '@/types/card'
import Card from './Card.vue'

const props = defineProps<{
  userId: string
}>()

const cardStore = useCardStore()
const { selectedCardId, cards } = storeToRefs(cardStore)

const playerCards = computed(() =>
  Array.from(cards.value.values()).filter(card =>  card.owner === props.userId)
)
</script>

<template>
  <aside
    class="bg-slate-100 rounded-lg border border-neutral-200 p-3"
    aria-label="cards on the board"
  >
    <div
      v-if="playerCards.length > 0"
      class="flex flex-wrap gap-6"
    >
      <div
        v-for="card in playerCards"
        :key="card.id"
        :class="{ 'ring-2 ring-blue-500 ring-offset-2': selectedCardId === card.id,
                  'opacity-50 pointer-events-none': card.status === CardStatus.Placed }"
        @click="cardStore.selectCard(card.id)"
      >
        <Card
          :card-id="card.id"
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
