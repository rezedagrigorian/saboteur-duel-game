import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

import type { ICardBase, ICard, ICardPort } from '@/types'
import { ActionEffect, CardStatus, ToolKind } from '@/types/card'
import { LAVANDER_ENTRANCE_CARD_ID, YELLOW_ENTRANCE_CARD_ID } from '@/game-core/constants'
import { shuffle } from '@/utils/shuffle'
import { HAND_SIZE, MOLE_MARKER_COUNT } from '@/game-core/constants'
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

  const isRoundOver = computed(() => {
    for (const card of cards.value.values()) {
      if (card.isGolden) continue
      if (card.status === CardStatus.Deck || card.status === CardStatus.Hand) return false
    }
    return true
  })

  const placedMarkerCount = computed(() => {
    let count = 0
    for (const card of cards.value.values()) {
      count += Object.keys(card.goldOwners ?? {}).length
    }
    return count
  })

  const availableMarkerCount = computed(() => MOLE_MARKER_COUNT - placedMarkerCount.value)

  function claimMarker(cardId: string, group: number, playerId: string): boolean {
    if (availableMarkerCount.value <= 0) return false
    const card = cards.value.get(cardId)
    if (!card || card.goldOwners?.[group] !== undefined) return false
    if (!card.goldOwners) card.goldOwners = {}
    card.goldOwners[group] = playerId
    return true
  }

  function buildDeck():void {
    const deckIds = Array.from(cards.value.values())
      .filter(card => card.status === CardStatus.Deck && !card.isGolden)
      .map(card => card.id)
    deckOrder.value = shuffle(deckIds)
  }

  function resetCards() {
    cards.value = buildInitialCards()
    deckOrder.value = []
    clearSelection()
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

  function markCardsAsPlaced(ids: string[]): void {
    ids.forEach(id => {
      const card = cards.value.get(id)
      if (card) card.status = CardStatus.Placed
    })
  }

  function pickGoalCards(count: number): string[] {
    const goldenCards = Array.from(cards.value.values()).filter(c => c.isGolden)
    const picked = shuffle(goldenCards).slice(0, count).map(card => card.id)
    markCardsAsPlaced(picked)
    return picked
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

  function discardCard(playerId: string, cardId: string): boolean {
    const card = getHandCard(playerId, cardId)
    if (!card) return false
    consumeCard(card, playerId)
    playerStore.endTurn()
    return true
  }

  function discardSelectedCard(playerId: string): boolean {
    if (!selectedCardId.value) return false
    return discardCard(playerId, selectedCardId.value)
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

  function rotateCardById(cardId: string) {
    const card = cards.value.get(cardId)
    if (!card) return
    cards.value.set(cardId, {
      ...card,
      rotation: !card.rotation,
      ports: [card.ports[2], card.ports[3], card.ports[0], card.ports[1]],
    })
  }

  function rotateSelectedCard() {
    if (selectedCardId.value) rotateCardById(selectedCardId.value)
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

  function playActionCard(
    playerId: string,
    cardId: string,
    tool: ToolKind,
    effect: ActionEffect,
    targetPlayerId: string,
  ): boolean {
    if (playerId !== playerStore.currentPlayerId) return false

    const card = getHandCard(playerId, cardId)
    const action = card?.actions.find(a => a.effect === effect && a.tool === tool)
    if (!card || !action) return false

    // a fix always repairs its own player, only a break carries an explicit target
    const target = effect === ActionEffect.Fix ? playerId : targetPlayerId
    if (!playerStore.applyAction(target, action)) return false

    consumeCard(card, playerId)
    playerStore.endTurn()
    return true
  }

  return {
    cards,
    cardIds,
    playableCardIds,
    selectedCardId,
    getCardById,
    selectCard,
    markCardAsPlaced,
    markCardsAsPlaced,
    clearSelection,
    rotateSelectedCard,
    rotateCardById,
    getPortsByCardID,
    getOutPortsByCardIDAndPortIndex,
    pickGoalCards,
    buildDeck,
    dealInitialHands,
    drawCard,
    handOf,
    playActionCard,
    deckOrder,
    discardCard,
    discardSelectedCard,
    isRoundOver,
    availableMarkerCount,
    claimMarker,
    resetCards,
  }
})
