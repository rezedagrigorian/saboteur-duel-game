
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

import type { ICard } from '@/types'
import cardsJson from './cards.json'

export const useCardStore = defineStore('cards', () => {
  const cards = ref<Map<string, ICard>>(
    new Map((cardsJson as ICard[]).map(card => [card.id, card] as [string, ICard]))
  )
  const cardIds = computed(() => Array.from(cards.value.keys()))
  const selectedCardId = ref<string | null>(null)


  function getCardById(id: string): ICard | undefined {
    return cards.value.get(id)
  }

  function selectCard(id: string) {
    selectedCardId.value = id
  }

  function markCardAsPlaced(id: string, userId: string) {
    const card = cards.value.get(id)
    if (card) {
      card.user = userId
    }
  }

  function clearSelection() {
    selectedCardId.value = null
  }

  return {
    cards,
    cardIds,
    selectedCardId,
    getCardById,
    selectCard,
    markCardAsPlaced,
    clearSelection,
  }
})
