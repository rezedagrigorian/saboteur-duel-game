
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

import type { ICardBase, ICard, ICardPort } from '@/types'
import { CardStatus } from '@/types/card'
import { START_CARD_ID } from '@/game-core/constants'
import cardsJson from './cards.json'

export const useCardStore = defineStore('cards', () => {
  const cards = ref<Map<string, ICard>>(new Map())

  const cardIds = computed(() => Array.from(cards.value.keys()))
  const playableCardIds = computed(() => cardIds.value.filter(id => id !== START_CARD_ID))
  const selectedCardId = ref<string | null>(null)

  function init(): void {
    const bareCards = cardsJson as ICardBase[]
    cards.value = new Map(
      bareCards.map(card => [card.id, {
        ...card,
        status: CardStatus.Deck,
        owner: null,
        rotation: false
      } as ICard])
    )
  }

  init()

  function getRandomCard(userId: string): void {
    const deckCards = Array.from(cards.value.values()).filter(card => card.status === CardStatus.Deck)
    if (deckCards.length === 0) return
    const randomCard = deckCards[Math.floor(Math.random() * deckCards.length)]
    if (!randomCard) return
    randomCard.status = CardStatus.Hand
    randomCard.owner = userId
  }

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
      card.status = CardStatus.Placed
    }
  }

  function clearSelection() {
    selectedCardId.value = null
  }

  function getPortsByCardID(id: string) : (ICardPort | undefined)[] {
    const card = getCardById(id)
    return card ? card.ports : []
  }

  function getOutPortsByCardIDAndPortIndex(id: string, portIndex: number): (ICardPort | undefined)[] | undefined {
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
    getOutPortsByCardIDAndPortIndex,
    getRandomCard
  }
})
