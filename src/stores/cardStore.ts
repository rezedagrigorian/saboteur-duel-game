import { v4 as uuidv4 } from 'uuid'
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

import type { ICard, ICardPort } from '@/types'
import cardsJson from './cards.json'

function generateRandomPort(): ICardPort | undefined {
  const isEmpty = Math.random() < 0.2
  if (isEmpty) return undefined

  return {
    group: Math.floor(Math.random() * 3),
    isTroll: Math.random() < 0.5,
    isGold: Math.random() < 0.5,
  }
}

export const useCardStore = defineStore('cards', () => {
  const cards = ref<Map<string, ICard>>(
    new Map((cardsJson as ICard[]).map(card => [card.id, card] as [string, ICard]))
  )
  const cardIds = computed(() => Array.from(cards.value.keys()))
  const selectedCardId = ref<string | null>(null)

  function createRandomCard(id: string): string {
    const card: ICard = {
      id,
      ports: [
        generateRandomPort(),
        generateRandomPort(),
        generateRandomPort(),
        generateRandomPort(),
      ],
      rotation: false,
      user: uuidv4(),
      isGolden: Math.random() < 0.5,
    }
    cards.value.set(id, card)
    return id
  }

  function getCardById(id: string): ICard | undefined {
    return cards.value.get(id)
  }

  function selectCard(id: string) {
    selectedCardId.value = id
  }

  return {
    cards,
    cardIds,
    selectedCardId,
    createRandomCard,
    getCardById,
    selectCard,
  }
})
