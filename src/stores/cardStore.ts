
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

import type { ICard, ICardPort } from '@/types'
import { START_CARD_ID } from '@/game-core/constants'
import cardsJson from './cards.json'

export const useCardStore = defineStore('cards', () => {
  const cards = ref<Map<string, ICard>>(
    new Map((cardsJson as ICard[]).map(card => [card.id, card] as [string, ICard]))
  )
  const cardIds = computed(() => Array.from(cards.value.keys()))
  const playableCardIds = computed(() => cardIds.value.filter(id => id !== START_CARD_ID))
  const selectedCardId = ref<string | null>(null)


  function getCardById(id: string): ICard | undefined {
    return cards.value.get(id)
  }

  function selectCard(id: string) {
    selectedCardId.value = id
  }

  function markCardAsPlaced(id: string, userId: string) {
    if (!userId.trim()) {
      return
    }
    const card = cards.value.get(id)
    if (card) {
      card.user = userId
    }
  }

  function clearSelection() {
    selectedCardId.value = null
  }

  function getPortsByCardID(id: string) {
    const card = getCardById(id)
    return card ? card.ports : []
  }

  function getOutPortsByCardIDAndPortIndex(id: string, portIndex: number) {
    const card = getCardById(id)
    if (!card) return undefined
    const ports = card.ports
  
    const inPort: ICardPort | undefined = ports[portIndex]
    if (!inPort) return undefined

    return ports.map((port, index) => {
      if (port && port.group === inPort.group && index !== portIndex) {
        return port
      }
      return undefined
    })
  }
  
  return {
    cards,
    cardIds,
    playableCardIds,
    selectedCardId,
    getCardById,
    selectCard,
    markCardAsPlaced,
    clearSelection,
    getPortsByCardID,
    getOutPortsByCardIDAndPortIndex
  }
})
