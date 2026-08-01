import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

import type { ICardBase, ICard, ICardPort } from '@/types'
import { ActionEffect, CardStatus, ToolKind } from '@/types/card'
import { LAVANDER_ENTRANCE_CARD_ID, YELLOW_ENTRANCE_CARD_ID } from '@/game-core/constants'
import { shuffle } from '@/utils/shuffle'
import { HAND_SIZE } from '@/game-core/constants'
import { cards as cardBases } from './cards'
import { usePlayerStore } from './playerStore'

const ENTRANCE_CARD_IDS = new Set([LAVANDER_ENTRANCE_CARD_ID, YELLOW_ENTRANCE_CARD_ID])

function createCard(base: ICardBase): ICard {
  return {
    ...base,
    status: ENTRANCE_CARD_IDS.has(base.id) ? CardStatus.Placed : CardStatus.Deck,
    owner: null,
    rotation: false,
    isRevealed: false,
  }
}

function buildInitialCards(): Map<string, ICard> {
  return new Map(
    cardBases.map(base => [base.id, createCard(base)])
  )
}

export const useCardStore = defineStore('cards', () => {
  const cards = ref<Map<string, ICard>>(buildInitialCards())
  const selectedCardId = ref<string | null>(null)
  const deckOrder = ref<string[]>([])

  const playerStore = usePlayerStore()

  const cardIds = computed(() => Array.from(cards.value.keys()))
  const playableCardIds = computed(() => cardIds.value.filter(id => !ENTRANCE_CARD_IDS.has(id)))

  function buildDeck():void {
    const deckIds = Array.from(cards.value.values())
      .filter(card => card.status === CardStatus.Deck)
      .map(card => card.id)
    deckOrder.value = shuffle(deckIds)
  }

  function drawCard(playerId: string): void {
    const nextId = deckOrder.value.shift()
    if (!nextId) return
    const card = cards.value.get(nextId)
    if (!card) return
    card.status = CardStatus.Hand
    card.owner = playerId
  }

  function dealInitialHands(playerIds: string[], handSize = HAND_SIZE): void {
    buildDeck()
    playerIds.forEach(playerId => {
      for (let i = 0; i < handSize; i++) {
        drawCard(playerId)
      }
    })
  }

  function handOf(playerId: string): ICard[] {
    return Array.from(cards.value.values())
      .filter(card => card.owner === playerId && card.status === CardStatus.Hand)
  }

  function pickGoalCards(count: number): string[] {
    const goldenCards = Array.from(cards.value.values()).filter(c => c.isGolden)
    const picked = shuffle(goldenCards).slice(0, count)
    picked.forEach(card => {
      card.status = CardStatus.Placed
    })
    return picked.map(card => card.id)
  }

  function getCardById(id: string): ICard | undefined {
    return cards.value.get(id)
  }

  function selectCard(id: string) {
    selectedCardId.value = id
  }

  function getHandCard(playerId: string, cardId: string): ICard | undefined {
    const card = cards.value.get(cardId)
    if (!card || card.owner !== playerId || card.status !== CardStatus.Hand) return undefined
    return card
  }

  function consumeCard(card: ICard, playerId: string): void {
    card.status = CardStatus.Discarded
    card.owner = null
    clearSelection()
    drawCard(playerId)
  }

  function discardSelectedCard(playerId: string): boolean {
    if (!selectedCardId.value) return false
    const card = getHandCard(playerId, selectedCardId.value)
    if (!card) return false
    consumeCard(card, playerId)
    return true
  }

  function markCardAsPlaced(id: string, playerId: string) {
    if (!playerId.trim()) {
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

  function rotateSelectedCard() {
    if (!selectedCardId.value) return
    const card = cards.value.get(selectedCardId.value)
    if (!card) return
  
    cards.value.set(selectedCardId.value, {
      ...card,
      rotation: !card.rotation,
      ports: [card.ports[2], card.ports[3], card.ports[0], card.ports[1]],
    })
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

  function playBreakCard(playerId: string, cardId: string, tool: ToolKind, targetPlayerId: string): boolean {
    const card = getHandCard(playerId, cardId)
    const action = card?.actions.find(a => a.effect === ActionEffect.Break && a.tool === tool)
    if (!card || !action) return false

    if (!playerStore.applyAction(targetPlayerId, action)) return false

    consumeCard(card, playerId)
    return true
  }

  function playFixCard(playerId: string, cardId: string, tool: ToolKind): boolean {
    const card = getHandCard(playerId, cardId)
    const action = card?.actions.find(a => a.effect === ActionEffect.Fix && a.tool === tool)
    if (!card || !action) return false

    if (!playerStore.applyAction(playerId, action)) return false

    consumeCard(card, playerId)
    return true
  }

  return {
    cards,
    cardIds,
    playableCardIds,
    selectedCardId,
    getCardById,
    selectCard,
    discardSelectedCard,
    markCardAsPlaced,
    clearSelection,
    rotateSelectedCard,
    getPortsByCardID,
    getOutPortsByCardIDAndPortIndex,
    pickGoalCards,
    buildDeck,
    dealInitialHands,
    drawCard,
    handOf,
    playBreakCard,
    playFixCard,
  }
})
